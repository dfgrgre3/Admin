import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filterId: string }> }
) {
  try {
    const { filterId } = await params;
    return await forwardToGoApi(
      request,
      `/api/admin/dashboard/saved-filters/${filterId}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Admin dashboard saved-filters DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard filter' },
      { status: 500 }
    );
  }
}
