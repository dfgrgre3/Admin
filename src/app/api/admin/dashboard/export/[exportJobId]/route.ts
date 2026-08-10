import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exportJobId: string }> }
) {
  try {
    const { exportJobId } = await params;
    return await forwardToGoApi(
      request,
      `/api/admin/dashboard/export/${exportJobId}`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('Admin dashboard export status GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard export status' },
      { status: 500 }
    );
  }
}
