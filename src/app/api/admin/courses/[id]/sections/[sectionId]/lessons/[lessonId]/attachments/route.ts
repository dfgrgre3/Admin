import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string; lessonId: string } }
) {
  try {
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/sections/${params.sectionId}/lessons/${params.lessonId}/attachments`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Add lesson attachment error:', error);
    return NextResponse.json(
      { error: 'Failed to add lesson attachment' },
      { status: 500 }
    );
  }
}
