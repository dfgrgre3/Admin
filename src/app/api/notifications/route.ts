import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, upstreamAuthHeaders, forwardSetCookie } from '@/app/api/auth/_utils';
import { getApiTimeoutMs } from '@/lib/api/timeouts';
import { trimTrailingSlashes } from '@/lib/utils';

function backendOriginCandidates(): string[] {
  const primary = trimTrailingSlashes(BACKEND_URL);
  const set = new Set<string>([primary]);
  for (const extra of (process.env.BACKEND_FAILOVER_URLS || '').split(',')) {
    const origin = trimTrailingSlashes(extra.trim());
    if (origin) set.add(origin);
  }
  return [...set];
}

function forwardResponseMetadata(source: Response, target: NextResponse): void {
  const csrfToken = source.headers.get('X-CSRF-Token');
  if (csrfToken) {
    target.headers.set('X-CSRF-Token', csrfToken);
  }

  forwardSetCookie(source, target);
}

async function backendErrorResponse(response: Response): Promise<NextResponse> {
  const text = await response.text();
  const logMsg = `[API Proxy] Backend returned ${response.status}: ${text.substring(0, 100)}`;
  console.warn(logMsg);

  let payload: unknown = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  const nextResponse = NextResponse.json(payload, { status: response.status });
  forwardResponseMetadata(response, nextResponse);
  return nextResponse;
}

function streamBackendResponse(response: Response): NextResponse {
  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Cache-Control': response.headers.get('cache-control') || 'no-store',
    },
  });

  forwardResponseMetadata(response, nextResponse);
  return nextResponse;
}

export async function GET(request: NextRequest) {
  const { search } = new URL(request.url);
  const timeoutMs = getApiTimeoutMs('/api/notifications');
  const headers = upstreamAuthHeaders(request);
  let lastError: unknown = null;

  for (const origin of backendOriginCandidates()) {
    const targetUrl = `${origin}/api/notifications${search}`;

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        return backendErrorResponse(response);
      }

      return streamBackendResponse(response);
    } catch (error: any) {
      lastError = error;
      console.warn(`[API Proxy] Notifications upstream failed for ${origin}:`, error.message);
    }
  }

  const details = lastError instanceof Error ? lastError.message : 'Unknown upstream error';
  console.error('[API Proxy] Error fetching notifications:', lastError);
  return NextResponse.json(
    { error: 'Failed to connect to backend', details },
    { status: 502 }
  );
}