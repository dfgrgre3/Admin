import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/lessons', { method: 'GET' });
  } catch (error) {
    console.error('Admin lessons GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/lessons', { method: 'POST' });
  } catch (error) {
    console.error('Admin lessons POST error:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/lessons', { method: 'PATCH' });
  } catch (error) {
    console.error('Admin lessons PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/lessons', { method: 'DELETE' });
  } catch (error) {
    console.error('Admin lessons DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
