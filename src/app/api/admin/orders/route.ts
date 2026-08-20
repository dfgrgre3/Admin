import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/orders', { method: 'GET' });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/orders', { method: 'PATCH' });
  } catch (error) {
    console.error('Admin orders PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
