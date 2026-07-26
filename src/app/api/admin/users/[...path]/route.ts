import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const GO_API_BASE = '/api/admin/users';

async function handle(
  request: NextRequest,
  method: string,
  pathSuffix: string,
) {
  try {
    const target = pathSuffix ? `${GO_API_BASE}/${pathSuffix}` : GO_API_BASE;
    const body =
      method === 'GET' || method === 'DELETE'
        ? undefined
        : await request.text();
    return await forwardToGoApi(request, target, {
      method,
      ...(body ? { body } : {}),
    });
  } catch (error) {
    console.error('Admin users sub-resource API error:', error);
    return NextResponse.json(
      { error: 'Failed to process users sub-resource request' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return handle(request, 'GET', path ? path.join('/') : '');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return handle(request, 'POST', path ? path.join('/') : '');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return handle(request, 'PATCH', path ? path.join('/') : '');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return handle(request, 'PUT', path ? path.join('/') : '');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return handle(request, 'DELETE', path ? path.join('/') : '');
}
