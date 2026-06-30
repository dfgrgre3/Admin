/**
 * Authentication Navigation Utilities
 */

export const DEFAULT_AUTHENTICATED_ROUTE = '/admin';
const DEFAULT_UNAUTHENTICATED_ROUTE = '/admin-login';
const PUBLIC_ROUTES = ['/', '/admin-login', '/unauthorized'];

/**
 * Sanitizes a redirect path to ensure it's a relative admin path and not a malicious external URL.
 */
export function sanitizeRedirectPath(path: string | null | undefined, fallback: string = DEFAULT_AUTHENTICATED_ROUTE): string {
  if (!path) return fallback;

  if (path.startsWith('/admin') && !path.startsWith('//') && path !== '/admin-login' && !path.startsWith('/admin-login/')) {
    return path;
  }

  return fallback;
}

/**
 * Checks if a route is public.
 */
function isAuthPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}
