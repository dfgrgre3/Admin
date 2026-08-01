import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getBackendOrigin } from '@/lib/api/config';
import { logger } from '@/lib/logger';

type HeaderWithSetCookie = Headers & {
  getSetCookie?: () => string[];
  raw?: () => Record<string, string[]>;
};

export const BACKEND_URL = getBackendOrigin();

export async function proxyLoginRequest(
  request: NextRequest,
  source: 'api/auth/login' | 'api/auth/admin-login',
): Promise<NextResponse> {
  const body = await request.text();
  if (!body.trim()) {
    return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...upstreamAuthHeaders(request),
  });
  headers.delete('origin');

  logger.info('Login proxy request received', { source, bodyLength: body.length });
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
      signal: AbortSignal.timeout(15_000),
    });
    logger.info('Login proxy backend response', { source, statusCode: response.status });
    return backendJsonResponse(response);
  } catch (error) {
    logger.error('Login proxy connection failed', error, { source });
    return NextResponse.json(
      { error: 'Failed to connect to authentication service' },
      { status: 502 },
    );
  }
}

/** Forward browser session / bearer token to the Go API (matches client `apiClient` + `credentials: 'include'`). */
export function upstreamAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const cookie = request.headers.get('cookie');
  if (cookie) headers.Cookie = cookie;
  const authorization = request.headers.get('authorization');
  if (authorization) headers.Authorization = authorization;
  
  // For writes, derive the upstream header from the forwarded cookie. This
  // keeps every dedicated route on the same double-submit pair and avoids a
  // stale client header surviving a rotated CSRF cookie.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
    const csrfToken = request.cookies.get('_csrf')?.value;
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
}

/**
 * Copy the browser CSRF double-submit token to an upstream request.
 * The cookie is the source of truth: accepting a client-supplied header here
 * would allow the two values to diverge across dedicated proxy routes.
 */
export function addUpstreamCsrfHeaders(
  request: NextRequest,
  headers: Headers,
): void {
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

  const cookieToken = request.cookies.get('_csrf')?.value;
  if (cookieToken) headers.set('X-CSRF-Token', cookieToken);
}


function splitCombinedSetCookie(value: string): string[] {
  // Fix ReDoS (S5852): Use a more efficient regex that avoids overlapping quantifiers.
  // The lookahead ensures we only split on commas that are followed by a 'key=' pattern.
  return value.split(/,(?=\s*[^\s;,][^;,]*=)/).map((cookie) => cookie.trim()).filter(Boolean);
}

export function forwardSetCookie(source: Response, target: NextResponse): void {
  const headers = source.headers as HeaderWithSetCookie;
  const cookies =
    headers.getSetCookie?.() ??
    headers.raw?.()['set-cookie'] ??
    splitCombinedSetCookie(headers.get('set-cookie') || '');

  for (let cookie of cookies) {
    // SECURITY/DEV FIX: If we are in development and using HTTP, the browser will reject cookies with the 'Secure' flag.
    // The backend might be sending it because NODE_ENV is set to 'production' there.
    if (process.env.NODE_ENV === 'development') {
      // Fix ReDoS (S5852): Avoid regex for attribute removal.
      cookie = cookie.split(';').filter(part => part.trim().toLowerCase() !== 'secure').join(';');
    }
    
    target.headers.append('Set-Cookie', cookie);
  }
}

export async function backendJsonResponse(response: Response): Promise<NextResponse> {
  const buffer = await response.arrayBuffer();
  const text = new TextDecoder('utf-8').decode(buffer);
  let payload: unknown = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    const logContext = { source: 'api/auth/proxy', statusCode: response.status };
    if (response.status === 401) {
      logger.warn('Backend authentication request rejected', logContext);
    } else if (response.status === 403) {
      logger.warn('Backend permission denied', logContext);
    } else if (response.status === 409) {
      logger.warn('Backend request conflict', logContext);
    } else {
      logger.error('Backend request failed', undefined, logContext);
    }
  }

  const nextResponse = NextResponse.json(payload, { status: response.status });
  
  // Forward X-CSRF-Token if present in backend response
  const csrfToken = response.headers.get('X-CSRF-Token');
  if (csrfToken) {
    nextResponse.headers.set('X-CSRF-Token', csrfToken);
  }
  
  forwardSetCookie(response, nextResponse);
  return nextResponse;
}
