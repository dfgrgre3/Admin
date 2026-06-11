import { NextRequest, NextResponse } from 'next/server';
import { getBackendOrigin } from '@/lib/api/config';
import {
  getRequiredPermissionForAdminApiRequest,
  getRequiredPermissionForAdminPath,
} from '@/lib/admin-panel-route-access';
import { hasPermission } from '@/lib/permissions';

const PROTECTED_PAGE_PREFIXES = ['/admin', '/coupons', '/revenue', '/subjects'];
const ADMIN_LOGIN_PATH = '/admin-login';
const PROTECTED_API_PREFIX = '/api/admin';

const PUBLIC_ADMIN_PATHS = [ADMIN_LOGIN_PATH];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPagePath(pathname: string): boolean {
  return PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminApiPath(pathname: string): boolean {
  return pathname.startsWith(PROTECTED_API_PREFIX);
}

const BACKEND_URL = getBackendOrigin();

type VerifiedAdminSession = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { role: string; permissions?: string[] | null } | null;
};

async function verifyAdminSession(request: NextRequest): Promise<VerifiedAdminSession> {
  const targetUrl = `${BACKEND_URL}/api/auth/me`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '',
        Authorization: request.headers.get('authorization') || '',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    const data = await response.json();
    const user = data?.user;
    
    if (!user) {
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    const role = user.role?.toUpperCase();
    const isAdmin = role === 'ADMIN' || role === 'MODERATOR';

    return { isAuthenticated: true, isAdmin, user };
  } catch {
    return { isAuthenticated: false, isAdmin: false, user: null };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isProtectedPage = isProtectedPagePath(pathname);
  const isProtectedApi = isAdminApiPath(pathname);

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const session = await verifyAdminSession(request);

  if (!session.isAuthenticated) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!session.isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const requiredPermission = isProtectedApi
    ? getRequiredPermissionForAdminApiRequest(pathname, request.method)
    : getRequiredPermissionForAdminPath(pathname);

  if (requiredPermission && !hasPermission(session.user, requiredPermission)) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Forbidden', requiredPermission },
        { status: 403 },
      );
    }

    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/coupons/:path*',
    '/revenue/:path*',
    '/subjects/:path*',
    '/api/admin/:path*',
  ],
};
