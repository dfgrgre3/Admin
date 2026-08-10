import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  try {
    const { alertId } = await params;
    const rawBody = await request.text();
    return await forwardToGoApi(
      request,
      `/api/admin/dashboard/alerts/${alertId}/acknowledge`,
      {
        method: 'POST',
        ...(rawBody ? { body: rawBody } : {}),
      }
    );
  } catch (error) {
    console.error('Admin dashboard alert acknowledge POST error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge dashboard alert' },
      { status: 500 }
    );
  }
}
