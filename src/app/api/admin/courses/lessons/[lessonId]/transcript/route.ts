import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/lessons/${params.lessonId}/transcript`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Upload lesson transcript error:', error);
    return NextResponse.json(
      { error: 'Failed to upload lesson transcript' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/lessons/${params.lessonId}/transcript`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Delete lesson transcript error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson transcript' },
      { status: 500 }
    );
  }
}
