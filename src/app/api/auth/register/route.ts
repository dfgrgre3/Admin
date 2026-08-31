import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, backendJsonResponse, upstreamAuthHeaders } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...upstreamAuthHeaders(request),
    });
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    headers.delete('origin');

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers,
      body: body,
      credentials: 'include',
    });


    return backendJsonResponse(response);
  } catch (error) {
    console.error('[API Proxy] Register error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to registration service' },
      { status: 502 }
    );
  }
}
