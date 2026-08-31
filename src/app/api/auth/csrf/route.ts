import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, backendJsonResponse } from '@/app/api/auth/_utils';
import { logger } from '@/lib/logger';

/**
 * CSRF Token Bootstrap Endpoint
 * 
 * This endpoint ensures the browser receives a _csrf cookie before making
 * state-changing requests. It calls the backend's /api/auth/csrf endpoint
 * which uses middleware.EnsureCSRFToken to set the cookie and X-CSRF-Token header.
 * 
 * The frontend apiClient calls this before POST/PUT/PATCH/DELETE requests to
 * implement the Double Submit Cookie pattern.
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('CSRF token bootstrap request', { 
      source: 'api/auth/csrf',
      cookie: request.headers.get('cookie'),
      origin: request.headers.get('origin')
    });

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
      signal: AbortSignal.timeout(10_000),
    });

    logger.info('CSRF token bootstrap response', { 
      source: 'api/auth/csrf', 
      statusCode: response.status,
      hasCsrfHeader: !!response.headers.get('X-CSRF-Token'),
      setCookie: response.headers.get('set-cookie')
    });

    // Use backendJsonResponse to properly forward CSRF headers and cookies
    return backendJsonResponse(response);
  } catch (error) {
    logger.error('CSRF token bootstrap failed', error, { source: 'api/auth/csrf' });
    return NextResponse.json(
      { error: 'Failed to fetch CSRF token' },
      { status: 502 }
    );
  }
}
