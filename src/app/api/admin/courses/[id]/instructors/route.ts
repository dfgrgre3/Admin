import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/instructors`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('List course instructors error:', error);
    return NextResponse.json(
      { error: 'Failed to list course instructors' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/instructors`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Add course instructor error:', error);
    return NextResponse.json(
      { error: 'Failed to add course instructor' },
      { status: 500 }
    );
  }
}
