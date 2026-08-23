import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; instructorId: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/instructors/${params.instructorId}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Remove course instructor error:', error);
    return NextResponse.json(
      { error: 'Failed to remove course instructor' },
      { status: 500 }
    );
  }
}
