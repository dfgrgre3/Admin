import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const ENDPOINT = '/api/admin/dashboard/top-courses';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, ENDPOINT, { method: 'GET' });
  } catch (error) {
    console.error('Admin dashboard top-courses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard top courses' }, { status: 500 });
  }
}
