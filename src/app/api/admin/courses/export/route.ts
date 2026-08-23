import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, upstreamAuthHeaders } from '@/app/api/auth/_utils';
import { assertAdminApiPermission } from '@/app/api/admin/_proxy';
import { getApiTimeoutMs } from '@/lib/api/timeouts';

/**
 * Courses CSV export.
 *
 * Deliberately does NOT use forwardToGoApi(): that helper ends with
 * backendJsonResponse(), which JSON-parses the upstream body and would destroy
 * the CSV payload. Here the body is streamed through untouched while
 * Content-Type and Content-Disposition are preserved so the browser keeps the
 * filename.
 */
export async function GET(request: NextRequest) {
  const permissionError = await assertAdminApiPermission(request);
  if (permissionError) return permissionError;

  const { search } = new URL(request.url);
  const path = '/api/admin/courses/export';

  try {
    const response = await fetch(`${BACKEND_URL}${path}${search}`, {
      method: 'GET',
      headers: upstreamAuthHeaders(request),
      credentials: 'include',
      cache: 'no-store',
      signal: AbortSignal.timeout(getApiTimeoutMs(path)),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      await response.body?.cancel().catch(() => {});
      return NextResponse.json(
        { error: message || 'Failed to export courses' },
        { status: response.status },
      );
    }

    const fallbackName = `courses-export-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/csv; charset=utf-8',
        'Content-Disposition':
          response.headers.get('content-disposition') || `attachment; filename="${fallbackName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Admin courses export error:', error);
    return NextResponse.json({ error: 'Failed to export courses' }, { status: 502 });
  }
}
