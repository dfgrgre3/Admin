import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

export async function GET(request: NextRequest) {
  try {
    return await forwardToGoApi(request, '/api/admin/courses', { method: 'GET' });
  } catch (error) {
    console.error('Admin courses GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 },
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

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const body = normalizeCoursePayload(rawBody);
    return await forwardToGoApi(request, '/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Admin courses POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const body = normalizeCoursePayload(rawBody);
    return await forwardToGoApi(request, '/api/admin/courses', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Admin courses PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    return await forwardToGoApi(request, '/api/admin/courses', {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Admin courses DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 },
    );
  }
}
