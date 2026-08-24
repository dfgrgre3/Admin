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
      `/api/admin/courses/${params.id}/sections/${params.sectionId}/lessons/${params.lessonId}/exam`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Link lesson exam error:', error);
    return NextResponse.json(
      { error: 'Failed to link lesson exam' },
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
      `/api/admin/courses/${params.id}/sections/${params.sectionId}/lessons/${params.lessonId}/exam`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Unlink lesson exam error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink lesson exam' },
      { status: 500 }
    );
  }
}
