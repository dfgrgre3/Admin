import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, upstreamAuthHeaders, forwardSetCookie } from '@/app/api/auth/_utils';
import { assertAdminApiPermission } from '@/app/api/admin/_proxy';
import { getApiTimeoutMs } from '@/lib/api/timeouts';
import { trimTrailingSlashes } from '@/lib/utils';

/**
 * General API Proxy Catch-all
 * This handles any /api/* routes that don't have a specific route file.
 * It forwards authentication and CSRF tokens to the Go backend.
 */
function getOrigins(primaryOrigin: string): string[] {
  const origins = [primaryOrigin];
  if (primaryOrigin.includes(':8082')) {
    origins.push(primaryOrigin.replace(':8082', ':8080'));
  } else if (primaryOrigin.includes(':8080')) {
    origins.push(primaryOrigin.replace(':8080', ':8082'));
  }
  return origins;
}

/**
 * Build the proxy RequestInit, forwarding all necessary headers.
 *
 * Key CSRF fix: apiClient.fetch() injects an X-CSRF-Token header before the request
 * reaches this proxy. We MUST forward it explicitly — upstreamAuthHeaders() only copies
 * Cookie + Authorization. Without this forward the Go CSRFMiddleware sees the _csrf cookie
 * but no matching header, and returns 403 "CSRF token validation failed".
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

    // Forward the CSRF token header that apiClient.fetch injected.
    // Without this the backend gets the _csrf cookie but not the X-CSRF-Token header,
    // causing validateCSRFToken() to fail.
    const csrfToken = request.headers.get('x-csrf-token');
    if (csrfToken) mergedHeaders['X-CSRF-Token'] = csrfToken;

    // Forward Idempotency-Key if present (injected by apiClient.buildHeaders)
    const idempotencyKey = request.headers.get('idempotency-key');
    if (idempotencyKey) mergedHeaders['Idempotency-Key'] = idempotencyKey;
  }

  return {
    method: request.method,
    headers: mergedHeaders,
    credentials: 'include',
  };
}

function handleErrorResponse(response: Response, errorText: string) {
  let errorData;
  try {
    errorData = JSON.parse(errorText);
  } catch {
    errorData = {
      error: response.status === 404 ? 'Resource not found on backend' : 'Backend error',
      status: response.status,
      details: errorText.substring(0, 500),
    };
  }
  return NextResponse.json(errorData, { status: response.status });
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
  const origins = getOrigins(primaryOrigin);
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

  let lastError: any = null;

  for (const origin of origins) {
    try {
      const targetUrl = `${origin}/api/${path}${search}`;
      console.log(`[API Proxy] ${request.method} /api/${path} -> ${targetUrl}`);

      const response = await fetch(targetUrl, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API Proxy] Backend (${response.status}) for ${path}:`, errorText.substring(0, 200));

        // A non-2xx response (e.g. 404 "User not found") is a definitive
        // application-level answer from a reachable backend — return it as-is
        // instead of failing over to a secondary origin. Failover only happens
        // for connection-level failures (handled in the catch below).
        return handleErrorResponse(response, errorText);
      }

      // Success! Return the response
      const nextResponse = new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          'Cache-Control': response.headers.get('cache-control') || 'no-store',
        },
      });

      // Forward CSRF token if the backend refreshed it
      const csrfToken = response.headers.get('X-CSRF-Token');
      if (csrfToken) {
        nextResponse.headers.set('X-CSRF-Token', csrfToken);
      }

      forwardSetCookie(response, nextResponse);
      return nextResponse;
    } catch (error: any) {
      console.warn(`[API Proxy] Attempt failed for ${origin}:`, error.message);
      lastError = error;
      continue;
    }
  }

  return NextResponse.json(
    { error: 'Failed to connect to backend service', details: lastError?.message },
    { status: 502 }
  );
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
