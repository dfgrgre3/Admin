import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/enrollments`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Enroll user error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${params.id}/enrollments`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('List enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to list enrollments' },
      { status: 500 }
    );
  }
}
