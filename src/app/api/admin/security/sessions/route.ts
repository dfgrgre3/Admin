import { NextRequest, NextResponse } from 'next/server';
import {
  BACKEND_URL,
  backendJsonResponse,
  upstreamAuthHeaders,
} from '@/app/api/auth/_utils';
import { assertAdminApiPermission } from '@/app/api/admin/_proxy';

export async function GET(request: NextRequest) {
  try {
    const permissionError = await assertAdminApiPermission(request);
    if (permissionError) return permissionError;

    const response = await fetch(
      `${BACKEND_URL}/api/admin/security/sessions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...upstreamAuthHeaders(request),
        },
        cache: 'no-store',
      },
    );
    return backendJsonResponse(response);
  } catch (error) {
    console.error('Admin sessions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionError = await assertAdminApiPermission(request);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action, sessionId } = body as {
      action?: string;
      sessionId?: string;
    };

    let targetUrl = `${BACKEND_URL}/api/admin/security/sessions`;
    if (action === 'revoke' && sessionId) {
      targetUrl = `${targetUrl}/${sessionId}/revoke`;
    } else if (action === 'revoke-others') {
      targetUrl = `${targetUrl}/revoke-others`;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...upstreamAuthHeaders(request),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    return backendJsonResponse(response);
  } catch (error) {
    console.error('Admin sessions POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process session action' },
      { status: 500 },
    );
  }
}
