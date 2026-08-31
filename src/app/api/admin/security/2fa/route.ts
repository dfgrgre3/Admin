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

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/status';
    const response = await fetch(
      `${BACKEND_URL}/api/v1/admin/security/2fa${path}`,
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
    console.error('Admin 2FA GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch 2FA status' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionError = await assertAdminApiPermission(request);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/setup';

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...upstreamAuthHeaders(request),
    });
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    headers.delete('origin');

    const response = await fetch(
      `${BACKEND_URL}/api/v1/admin/security/2fa${path}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        cache: 'no-store',
      },
    );
    return backendJsonResponse(response);
  } catch (error) {
    console.error('Admin 2FA POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process 2FA request' },
      { status: 500 },
    );
  }
}
