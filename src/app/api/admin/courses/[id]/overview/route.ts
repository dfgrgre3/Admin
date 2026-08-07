import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await forwardToGoApi(
      request,
      `/api/admin/courses/${id}/overview`,
      { method: 'GET' }
    );

    return response;
  } catch (error) {
    console.error('Admin course overview GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course overview' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${id}/overview`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Admin course overview POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update course overview' },
      { status: 500 }
    );
  }
}
