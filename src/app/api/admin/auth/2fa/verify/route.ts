import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { NextRequest } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate 2FA code format (typically 6 digits)
 */
function isValid2FACode(code: string): boolean {
  // Assuming 6-digit numeric code, adjust as needed
  return /^\d{6}$/.test(code);
}

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
    const { code, userId } = body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: '2FA code is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim();
    const trimmedUserId = userId.trim();

    if (!trimmedCode) {
      return NextResponse.json(
        { error: '2FA code cannot be empty' },
        { status: 400 }
      );
    }

    if (!trimmedUserId) {
      return NextResponse.json(
        { error: 'User ID cannot be empty' },
        { status: 400 }
      );
    }

    // Validate 2FA code format
    if (!isValid2FACode(trimmedCode)) {
      return NextResponse.json(
        { error: 'Invalid 2FA code format. Must be 6 digits.' },
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

    // Log attempt (without sensitive data)
    logger.info('Admin 2FA verification requested', { source: 'api/admin/auth/2fa/verify' });

    // Forward request to Go API with validated data
    const response = await forwardToGoApi(request, '/api/admin/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code: trimmedCode, userId: trimmedUserId }),
    });

    // Log response status for monitoring
    logger.info('Admin 2FA verification completed', { source: 'api/admin/auth/2fa/verify', statusCode: response.status });

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    logger.error('Admin 2FA verification failed', error, { source: 'api/admin/auth/2fa/verify' });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}