import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import {
  BACKEND_URL,
  backendJsonResponse,
  upstreamAuthHeaders,
} from '@/app/api/auth/_utils';
import { getRequiredPermissionForAdminApiRequest } from '@/lib/admin-panel-route-access';
import { getApiTimeoutMs } from '@/lib/api/timeouts';
import { hasPermission } from '@/lib/permissions';

interface AdminAuthUser {
  id: string;
  email: string;
  role: string;
  permissions?: string[] | null;
}

// ---------------------------------------------------------------------------
// Short-lived server-side cache for /api/auth/me responses.
//
// Rationale: every admin API request through the catch-all proxy called
// getCurrentUser(), which made a fresh network round-trip to the backend
// (~800-1100 ms overhead per request). A 30-second TTL cache keyed by the
// access_token value eliminates that overhead for burst requests from the
// same session while keeping permissions reasonably fresh.
// ---------------------------------------------------------------------------
const USER_CACHE_TTL_MS = 30_000; // 30 seconds

interface CacheEntry {
  user: AdminAuthUser | null;
  expiresAt: number;
}

const userCache = new Map<string, CacheEntry>();

/** Returns a safe cache key derived from the access_token cookie. */
function getCacheKey(request: NextRequest): string | null {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return null;
  // Use a prefix slice — never log or expose the full token.
  return createHash('sha256').update(token).digest('hex');
}

/** Evict all expired entries to prevent unbounded memory growth. */
function evictExpired(): void {
  const now = Date.now();
  userCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) userCache.delete(key);
  });
}

async function getCurrentUser(request: NextRequest): Promise<AdminAuthUser | null> {
  const cacheKey = getCacheKey(request);

  if (cacheKey) {
    const cached = userCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }
  }

  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: 'GET',
    headers: upstreamAuthHeaders(request),
    credentials: 'include',
    cache: 'no-store',
    signal: AbortSignal.timeout(getApiTimeoutMs('/api/auth/me')),
  });

  const user: AdminAuthUser | null = response.ok
    ? await response.json()
        .then((p: any) => (p?.user || p?.data?.user || null) as AdminAuthUser | null)
        .catch(() => null)
    : null;

  if (cacheKey) {
    evictExpired();
    userCache.set(cacheKey, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
  }

  return user;
}

export async function assertAdminApiPermission(
  request: NextRequest,
  pathname: string = request.nextUrl.pathname,
  method: string = request.method,
): Promise<NextResponse | null> {
  const requiredPermission = getRequiredPermissionForAdminApiRequest(pathname, method);
  if (!requiredPermission) return null;

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  if (!hasPermission(user, requiredPermission)) {
    return NextResponse.json(
      {
        error: 'Insufficient admin permission',
        requiredPermission,
      },
      { status: 403 },
    );
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
    const userMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)/);
    let targetUserId = userMatch?.[1] ? decodeURIComponent(userMatch[1]) : null;

    if (pathname === "/api/admin/impersonate") {
      const body = await request.clone().json().catch(() => null) as { targetUserId?: string } | null;
      targetUserId = body?.targetUserId || null;
    }

    if (targetUserId && targetUserId === user.id) {
      return NextResponse.json(
        { error: "Administrators cannot perform this action on their current account" },
        { status: 409 },
      );
    }
  }

  return null;
}

/**
 * Server-side proxy to the Go API with the same auth as the browser (cookies + optional Authorization).
 *
 * Permission enforcement lives here (not only in the catch-all route) because
 * dedicated admin route handlers (e.g. coupons, settings, blog) call this
 * function directly and are dispatched by Next.js before the catch-all route,
 * so the catch-all's assertAdminApiPermission() never runs for them. The 30s
 * user cache makes this extra lookup cheap.
 */
export async function forwardToGoApi(
  request: NextRequest,
  apiPath: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const permissionError = await assertAdminApiPermission(request);
  if (permissionError) return permissionError;

  const url = new URL(request.url);
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const target = `${BACKEND_URL}${path}${url.search}`;

  const headers = new Headers(init.headers);
  const authHeaders = upstreamAuthHeaders(request);
  Object.keys(authHeaders).forEach((key) => {
    headers.set(key, authHeaders[key] as string);
  });

  if (
    init.body &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(target, {
    ...init,
    headers,
    cache: 'no-store',
    signal: init.signal || AbortSignal.timeout(getApiTimeoutMs(path)),
  });

  return backendJsonResponse(response);
}
