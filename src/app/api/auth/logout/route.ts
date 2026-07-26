import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, backendJsonResponse, upstreamAuthHeaders } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const headers = new Headers(upstreamAuthHeaders(request));
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    headers.delete('origin');

    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });


    return backendJsonResponse(response);
  } catch (error) {
    console.error('[API Proxy] Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to logout service' },
      { status: 502 }
    );
  }
}
