import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${id}`,
      { method: 'GET' }
    );
  } catch (error) {
    console.error('Admin course GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

function normalizeCoursePayload(body: any) {
  if (!body || typeof body !== 'object') return body;
  const payload = { ...body };

  let targetAudienceStr: string | undefined = undefined;
  if (Array.isArray(payload.targetAudience)) {
    targetAudienceStr = payload.targetAudience.filter(Boolean).join('\n');
  } else if (Array.isArray(payload.target_audience)) {
    targetAudienceStr = payload.target_audience.filter(Boolean).join('\n');
  } else if (typeof payload.targetAudience === 'string') {
    targetAudienceStr = payload.targetAudience;
  } else if (typeof payload.target_audience === 'string') {
    targetAudienceStr = payload.target_audience;
  }

  if (targetAudienceStr !== undefined) {
    payload.targetAudience = targetAudienceStr;
    payload.target_audience = targetAudienceStr;
  }

  let prereqStr: string | undefined = undefined;
  if (Array.isArray(payload.prerequisitesText)) {
    prereqStr = payload.prerequisitesText.filter(Boolean).join('\n');
  } else if (Array.isArray(payload.prerequisites_text)) {
    prereqStr = payload.prerequisites_text.filter(Boolean).join('\n');
  } else if (typeof payload.prerequisitesText === 'string') {
    prereqStr = payload.prerequisitesText;
  } else if (typeof payload.prerequisites_text === 'string') {
    prereqStr = payload.prerequisites_text;
  }

  if (prereqStr !== undefined) {
    payload.prerequisitesText = prereqStr;
    payload.prerequisites_text = prereqStr;
  }

  return payload;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawBody = await request.json();
    const body = normalizeCoursePayload(rawBody);
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('Admin course PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await forwardToGoApi(
      request,
      `/api/admin/courses/${id}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Admin course DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
