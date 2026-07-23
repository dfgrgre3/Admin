import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

async function handle(request: NextRequest, method: string, action: string, id: string) {
  try {
    return await forwardToGoApi(request, `/api/admin/instructors/${id}/${action}`, {
      method,
      ...(method !== 'GET' ? { body: await request.text() } : {}),
    });
  } catch (error) {
    console.error('Admin instructor action API error:', error);
    return NextResponse.json(
      { error: 'Failed to process instructor action request' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const action = request.nextUrl.pathname.split('/').pop();
  return handle(request, 'POST', action || 'approve', id);
}
