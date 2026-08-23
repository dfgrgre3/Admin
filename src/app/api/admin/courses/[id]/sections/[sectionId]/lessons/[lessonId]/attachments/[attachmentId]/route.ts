import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string; lessonId: string; attachmentId: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/sections/${params.sectionId}/lessons/${params.lessonId}/attachments/${params.attachmentId}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Delete lesson attachment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson attachment' },
      { status: 500 }
    );
  }
}
