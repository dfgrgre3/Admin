import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/assignments/${params.assignmentId}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Delete course assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course assignment' },
      { status: 500 }
    );
  }
}
