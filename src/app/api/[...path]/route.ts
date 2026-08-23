import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, addUpstreamCsrfHeaders, upstreamAuthHeaders, forwardSetCookie } from '@/app/api/auth/_utils';
import { assertAdminApiPermission } from '@/app/api/admin/_proxy';
import { getApiTimeoutMs } from '@/lib/api/timeouts';
import { trimTrailingSlashes } from '@/lib/utils';
import { logger } from '@/lib/logger';

/**
 * General API Proxy Catch-all
 * This handles any /api/* routes that don't have a specific route file.
 * It forwards authentication and CSRF tokens to the Go backend.
 */

/**
 * Build the proxy RequestInit, forwarding all necessary headers.
 *
 * CSRF fix: upstreamAuthHeaders() and addUpstreamCsrfHeaders() use the same
 * browser cookie as the source of truth for the double-submit header.
 *
 * Body handling: the request body is buffered once in handleProxy() (not here) so it can be
 * replayed across origin failover attempts — request.body is a single-consumption stream.
 */
function buildProxyRequestOptions(request: NextRequest, authHeaders: Record<string, string>): RequestInit {
  const mergedHeaders: Record<string, string> = { ...authHeaders };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    // Forward Content-Type (critical for multipart/form-data boundary preservation)
    const contentType = request.headers.get('content-type');
    if (contentType) mergedHeaders['Content-Type'] = contentType;

    // Keep the double-submit values identical even when the browser has just
    // received a refreshed CSRF cookie from the bootstrap endpoint.
    const csrfCookie = request.cookies.get('_csrf')?.value?.trim();
    if (csrfCookie) {
      mergedHeaders['X-CSRF-Token'] = csrfCookie;
    }

    // Forward Idempotency-Key if present (injected by apiClient.buildHeaders)
    const idempotencyKey = request.headers.get('idempotency-key');
    if (idempotencyKey) mergedHeaders['Idempotency-Key'] = idempotencyKey;
  }

  const normalizedHeaders = new Headers(mergedHeaders);
  addUpstreamCsrfHeaders(request, normalizedHeaders);
  normalizedHeaders.delete('origin');
  normalizedHeaders.delete('referer');

  return {
    method: request.method,
    headers: normalizedHeaders,
    credentials: 'include',
  };
}

async function handleErrorResponse(response: Response) {
  let errorMessage = response.status === 404 ? 'Resource not found on backend' : 'Backend request failed';
  
  // Try to extract the actual error message from the backend response
  try {
    const body = await response.clone().json();
    if (body.error) {
      errorMessage = body.error;
    } else if (body.message) {
      errorMessage = body.message;
    }
  } catch {
    // If we can't parse the body, use the default message
  }

  return NextResponse.json(
    {
      error: errorMessage,
      status: response.status,
    },
    { status: response.status },
  );
}

async function handleProxy(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const path = params.path.join('/');
  const pathname = `/api/${path}`;
  const permissionError = await assertAdminApiPermission(request, pathname);
  if (permissionError) return permissionError;

  const { search } = new URL(request.url);
  const authHeaders = upstreamAuthHeaders(request);

  const primaryOrigin = trimTrailingSlashes(BACKEND_URL);
  const origins = [...new Set([
    primaryOrigin,
    ...(process.env.BACKEND_FAILOVER_URLS || '').split(',')
      .map((origin) => trimTrailingSlashes(origin.trim()))
      .filter(Boolean),
  ])];
  const options = buildProxyRequestOptions(request, authHeaders);
  const timeoutMs = getApiTimeoutMs(`/api/${path}`);

  // Buffer the request body once so it can be replayed across origin failover
  // attempts. request.body is a single-consumption stream: the first fetch
  // would consume it, leaving retries (404 fallback or network error) unable to
  // resend the payload. Buffering also handles FormData/streaming uploads that
  // omit content-length, which the old content-length guard silently dropped.
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  if (isWriteMethod) {
    options.body = await request.arrayBuffer();
  }

  for (const origin of origins) {
    try {
      const targetUrl = `${origin}/api/${path}${search}`;
      logger.info('API proxy request', { source: 'api/catch-all', method: request.method, path });

      const response = await fetch(targetUrl, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        logger.warn('API proxy backend returned an error', {
          source: 'api-catch-all',
          method: request.method,
          statusCode: response.status,
        });

        // A non-2xx response (e.g. 404 "User not found") is a definitive
        // application-level answer from a reachable backend — return it as-is
        // instead of failing over to a secondary origin. Failover only happens
        // for connection-level failures (handled in the catch below).
        const errorResponse = await handleErrorResponse(response);
        await response.body?.cancel();
        return errorResponse;
      }

      // Success! Return the response
      const nextResponse = new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          'Cache-Control': response.headers.get('cache-control') || 'no-store',
        },
      });

      // Preserve download filenames for file responses (CSV exports, reports, ...)
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        nextResponse.headers.set('Content-Disposition', contentDisposition);
      }

      // Forward CSRF token if the backend refreshed it
      const csrfToken = response.headers.get('X-CSRF-Token');
      if (csrfToken) {
        nextResponse.headers.set('X-CSRF-Token', csrfToken);
      }

      forwardSetCookie(response, nextResponse);
      return nextResponse;
    } catch {
      logger.warn('API proxy upstream attempt failed', {
        source: 'api/catch-all',
        method: request.method,
        status: 'connection_failed',
      });
      continue;
    }
  }

  return NextResponse.json(
    { error: 'Failed to connect to backend service' },
    { status: 502 }
  );
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
