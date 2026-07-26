import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string; lessonId: string } }
) {
  try {
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/sections/${params.sectionId}/lessons/${params.lessonId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string; lessonId: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/sections/${params.sectionId}/lessons/${params.lessonId}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Delete lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
