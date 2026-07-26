import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { NextRequest } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      return NextResponse.json(
        { error: 'User ID cannot be empty' },
        { status: 400 }
      );
    }

    // Validate user ID format (adjust regex if your ID format is different)
    if (!isValidUUID(trimmedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Log request for auditing (without sensitive data)
    logger.info('Admin 2FA setup requested', { source: 'api/admin/auth/2fa/setup' });

    // Forward request to Go API with validated data
    const response = await forwardToGoApi(request, '/api/admin/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ userId: trimmedUserId }),
    });

    // Log response status for monitoring
    logger.info('Admin 2FA setup completed', { source: 'api/admin/auth/2fa/setup', statusCode: response.status });

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    logger.error('Admin 2FA setup failed', error, { source: 'api/admin/auth/2fa/setup' });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}