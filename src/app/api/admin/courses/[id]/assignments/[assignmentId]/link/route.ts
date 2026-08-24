import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/assignments/${params.assignmentId}/link`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Link assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to link assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/assignments/${params.assignmentId}/link`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Unlink assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink assignment' },
      { status: 500 }
    );
  }
}
