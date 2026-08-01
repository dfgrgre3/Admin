import { NextRequest } from 'next/server';
import { BACKEND_URL, backendJsonResponse, upstreamAuthHeaders } from '@/app/api/auth/_utils';

export async function GET(request: NextRequest) {
  const targetUrl = `${BACKEND_URL}/api/settings/preferences`;
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: upstreamAuthHeaders(request),
      credentials: 'include',
      cache: 'no-store',
    });
    
    return backendJsonResponse(response);
  } catch (error) {
    console.error('[API Proxy] Error fetching settings preferences:', error);
    return Response.json({ error: 'Failed to connect to backend' }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  const targetUrl = `${BACKEND_URL}/api/settings/preferences`;
  const body = await request.arrayBuffer();

  const headers = new Headers({
    ...upstreamAuthHeaders(request),
    'Content-Type': request.headers.get('content-type') || 'application/json',
  });
  // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
  headers.delete('origin');

  try {
    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers,
      body,
      credentials: 'include',
    });
    
    return backendJsonResponse(response);
  } catch (error) {
    console.error('[API Proxy] Error updating settings preferences:', error);
    return Response.json({ error: 'Failed to connect to backend' }, { status: 502 });
  }
}
