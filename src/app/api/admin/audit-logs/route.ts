import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

const ENDPOINT = '/api/admin/audit-logs';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, ENDPOINT, { method: 'GET' });
  } catch (error) {
    console.error('Admin audit-logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit-logs data' }, { status: 500 });
  }
}
