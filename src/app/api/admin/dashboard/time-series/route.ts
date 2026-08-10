import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const ENDPOINT = '/api/admin/dashboard/time-series';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, ENDPOINT, { method: 'GET' });
  } catch (error) {
    console.error('Admin dashboard time-series GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard time-series' }, { status: 500 });
  }
}
