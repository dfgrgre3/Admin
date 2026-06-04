import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
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

async function getCurrentUser(request: NextRequest): Promise<AdminAuthUser | null> {
  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: 'GET',
    headers: upstreamAuthHeaders(request),
    credentials: 'include',
    cache: 'no-store',
    signal: AbortSignal.timeout(getApiTimeoutMs('/api/auth/me')),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  return (payload?.user || payload?.data?.user || null) as AdminAuthUser | null;
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

  return null;
}

/**
 * Server-side proxy to the Go API with the same auth as the browser (cookies + optional Authorization).
 */
export async function forwardToGoApi(
  request: NextRequest,
  apiPath: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const url = new URL(request.url);
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const target = `${BACKEND_URL}${path}${url.search}`;
  const permissionError = await assertAdminApiPermission(request);
  if (permissionError) return permissionError;

  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(upstreamAuthHeaders(request))) {
    headers.set(key, value);
  }

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
