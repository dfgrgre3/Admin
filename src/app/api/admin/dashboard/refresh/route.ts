import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const ENDPOINT = '/api/admin/dashboard/refresh';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    return await forwardToGoApi(request, ENDPOINT, {
      method: 'POST',
      ...(rawBody ? { body: rawBody } : {}),
    });
  } catch (error) {
    console.error('Admin dashboard refresh POST error:', error);
    return NextResponse.json({ error: 'Failed to refresh dashboard data' }, { status: 500 });
  }
}
