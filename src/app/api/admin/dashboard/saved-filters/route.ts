import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const ENDPOINT = '/api/admin/dashboard/saved-filters';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await forwardToGoApi(request, ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Admin dashboard saved-filters POST error:', error);
    return NextResponse.json({ error: 'Failed to save dashboard filter' }, { status: 500 });
  }
}
