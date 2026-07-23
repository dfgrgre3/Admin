import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

async function handle(request: NextRequest, method: string, id: string) {
  try {
    return await forwardToGoApi(request, `/api/admin/instructors/${id}`, {
      method,
      ...(method !== 'GET' && method !== 'DELETE' ? { body: await request.text() } : {}),
    });
  } catch (error) {
    console.error('Admin instructor detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to process instructor detail request' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(request, 'GET', id);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(request, 'PATCH', id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(request, 'DELETE', id);
}
