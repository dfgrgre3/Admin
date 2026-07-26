import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/unarchive`,
      { method: 'POST' }
    );
  } catch (error) {
    console.error('Unarchive course error:', error);
    return NextResponse.json(
      { error: 'Failed to unarchive course' },
      { status: 500 }
    );
  }
}
