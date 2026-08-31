import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

// Static segment so Next.js matches this file instead of the dynamic
// `courses/[id]/route.ts` (which would otherwise treat "batch" as an id
// and 405 POST, since it only exports GET/PATCH/DELETE).
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    return await forwardToGoApi(request, '/api/admin/courses/batch', {
      method: 'POST',
      body,
    });
  } catch (error) {
    console.error('Admin courses batch POST error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 },
    );
  }
}
