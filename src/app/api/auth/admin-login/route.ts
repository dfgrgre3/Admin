import { NextRequest } from 'next/server';
import { proxyLoginRequest } from '../_utils';

/**
 * POST /api/auth/admin-login
 *
 * Proxies the request to the Go backend's registered /api/auth/login endpoint.
 * The admin panel verifies the returned user role before granting access.
 */
export async function POST(request: NextRequest) {
  return proxyLoginRequest(request, 'api/auth/admin-login');
}
