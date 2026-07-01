import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, backendJsonResponse, upstreamAuthHeaders } from '../_utils';
import { getApiTimeoutMs } from '@/lib/api/timeouts';
import { trimTrailingSlashes } from '@/lib/utils';

function backendOriginCandidates(): string[] {
  const primary = trimTrailingSlashes(BACKEND_URL);
  const set = new Set<string>([primary]);
  if (primary.includes(':8082')) set.add(primary.replace(':8082', ':8080'));
  else if (primary.includes(':8080')) set.add(primary.replace(':8080', ':8082'));
  return [...set];
}

export async function GET(request: NextRequest) {
  const headers = upstreamAuthHeaders(request);
  const timeoutMs = getApiTimeoutMs('/api/auth/me');
  let lastError: unknown = null;

  for (const origin of backendOriginCandidates()) {
    try {
      const response = await fetch(`${origin}/api/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });

      // The backend answered (even if non-ok, e.g. 401) — honor it as-is
      // so the client can still react to auth states correctly.
      return backendJsonResponse(response);
    } catch (error) {
      lastError = error;
      console.warn(
        `[API Proxy] /api/auth/me upstream failed for ${origin}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const details = lastError instanceof Error ? lastError.message : 'Unknown upstream error';
  console.error('[API Proxy] Me error:', lastError);
  return NextResponse.json(
    { error: 'Failed to connect to authentication service', details },
    { status: 502 },
  );
}
