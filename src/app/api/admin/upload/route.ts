import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Direct (multipart) upload endpoint.
 *
 * See `./presign/route.ts` for why these upload endpoints need explicit route
 * files instead of relying on the `src/app/api/[...path]` catch-all.
 *
 * The multipart body is buffered so the `Content-Type` boundary is preserved
 * exactly as the browser sent it. Callers chunk anything larger than 25 MB
 * through `/api/admin/upload/chunked`, so the buffer stays bounded.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    const body = await request.arrayBuffer();

    return await forwardToGoApi(request, '/api/admin/upload', {
      method: 'POST',
      body,
      ...(contentType ? { headers: { 'Content-Type': contentType } } : {}),
    });
  } catch (error) {
    console.error('Admin upload POST error:', error);
    return NextResponse.json({ error: 'Failed to upload the file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.text();
    return await forwardToGoApi(request, '/api/admin/upload', {
      method: 'DELETE',
      ...(body ? { body, headers: { 'Content-Type': 'application/json' } } : {}),
    });
  } catch (error) {
    console.error('Admin upload DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete the file' }, { status: 500 });
  }
}
