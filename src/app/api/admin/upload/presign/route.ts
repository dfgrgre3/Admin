import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Presigned upload URL endpoint.
 *
 * This must exist as a real route file: a static App Router route is the only
 * thing guaranteed to own `/api/admin/upload/presign`, so the request always
 * passes through `forwardToGoApi`, which enforces `assertAdminApiPermission`,
 * rebuilds `X-CSRF-Token` from the URL-decoded `_csrf` cookie (Gin URL-escapes
 * the cookie it sets, so the raw browser value never matches), and strips
 * `Origin`/`Referer` before talking to the Go API.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    return await forwardToGoApi(request, '/api/admin/upload/presign', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin upload presign POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create a presigned upload URL' },
      { status: 500 },
    );
  }
}
