import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const ENDPOINT = '/api/admin/dashboard/recent-activities';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, ENDPOINT, { method: 'GET' });
  } catch (error) {
    console.error('Admin dashboard recent-activities GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard recent activities' }, { status: 500 });
  }
}
