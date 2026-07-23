import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const GO_API = '/api/admin/instructors';

async function handle(request: NextRequest, method: string, pathSuffix = '') {
  try {
    const target = pathSuffix ? `${GO_API}/${pathSuffix}` : GO_API;
    const body = method === 'GET' || method === 'DELETE' ? undefined : await request.text();
    return await forwardToGoApi(request, target, {
      method,
      ...(body ? { body } : {}),
    });
  } catch (error) {
    console.error('Admin instructors API error:', error);
    return NextResponse.json(
      { error: 'Failed to process instructor request' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handle(request, 'POST');
}

export async function PATCH(request: NextRequest) {
  return handle(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handle(request, 'DELETE');
}
