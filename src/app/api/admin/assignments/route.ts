import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/admin/assignments', '');
    const searchParams = url.search;
    return await forwardToGoApi(request, `/api/admin/assignments${path}${searchParams}`, { method: 'GET' });
  } catch (error) {
    console.error('Admin assignments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/assignments', { method: 'POST' });
  } catch (error) {
    console.error('Admin assignments POST error:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/assignments', { method: 'PUT' });
  } catch (error) {
    console.error('Admin assignments PUT error:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/assignments', { method: 'DELETE' });
  } catch (error) {
    console.error('Admin assignments DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}