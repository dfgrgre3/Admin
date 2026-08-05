import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const UPSTREAM_PATH = '/api/admin/upload/chunked';

/**
 * Chunked upload endpoint.
 *
 * See `../presign/route.ts` for why these upload endpoints need explicit route
 * files instead of relying on the `src/app/api/[...path]` catch-all.
 *
 * POST   initialises an upload session (JSON)
 * PUT    uploads a single chunk (multipart, max 25 MB per request)
 * PATCH  finalises the upload (JSON)
 */
async function forwardJson(request: NextRequest, method: 'POST' | 'PATCH') {
  const body = await request.text();
  return forwardToGoApi(request, UPSTREAM_PATH, {
    method,
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  try {
    return await forwardJson(request, 'POST');
  } catch (error) {
    console.error('Admin chunked upload POST error:', error);
    return NextResponse.json({ error: 'Failed to start the chunked upload' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    const body = await request.arrayBuffer();

    return await forwardToGoApi(request, UPSTREAM_PATH, {
      method: 'PUT',
      body,
      ...(contentType ? { headers: { 'Content-Type': contentType } } : {}),
    });
  } catch (error) {
    console.error('Admin chunked upload PUT error:', error);
    return NextResponse.json({ error: 'Failed to upload the file chunk' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await forwardJson(request, 'PATCH');
  } catch (error) {
    console.error('Admin chunked upload PATCH error:', error);
    return NextResponse.json({ error: 'Failed to finalise the chunked upload' }, { status: 500 });
  }
}
