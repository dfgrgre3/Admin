import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/admin/taxes', '');
    const searchParams = url.search;
    return await forwardToGoApi(request, `/api/admin/taxes${path}${searchParams}`, { method: 'GET' });
  } catch (error) {
    console.error('Admin taxes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch taxes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/taxes', { method: 'POST' });
  } catch (error) {
    console.error('Admin taxes POST error:', error);
    return NextResponse.json({ error: 'Failed to create tax' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/taxes', { method: 'PUT' });
  } catch (error) {
    console.error('Admin taxes PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tax' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/taxes', { method: 'DELETE' });
  } catch (error) {
    console.error('Admin taxes DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tax' }, { status: 500 });
  }
}
