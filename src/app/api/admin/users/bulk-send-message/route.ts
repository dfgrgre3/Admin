import { NextRequest, NextResponse } from 'next/server';
import {
  BACKEND_URL,
  backendJsonResponse,
  upstreamAuthHeaders,
} from '@/app/api/auth/_utils';
import { assertAdminApiPermission } from '@/app/api/admin/_proxy';

export async function POST(request: NextRequest) {
  try {
    const permissionError = await assertAdminApiPermission(request);
    if (permissionError) return permissionError;

    const body = await request.json();
    
    // Transform frontend request format to backend expected format
    const backendPayload = {
      message: body.message,
      userIds: body.userIds || [],
      title: body.title,
      type: body.type,
      channels: body.channels,
      actionUrl: body.actionUrl,
    };

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...upstreamAuthHeaders(request),
    });
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    headers.delete('origin');

    const response = await fetch(`${BACKEND_URL}/api/admin/users/bulk-send-message`, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload),
      cache: 'no-store',
    });

    return backendJsonResponse(response);
  } catch (error) {
    console.error('[API Proxy] Bulk send message error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to broadcast service' },
      { status: 502 }
    );
  }
}
