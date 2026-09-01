import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params;
    return await forwardToGoApi(
      request,
      `/api/admin/dashboard/system-health/${encodeURIComponent(service)}/history`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('Admin dashboard service health history GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service health history' },
      { status: 500 }
    );
  }
}
