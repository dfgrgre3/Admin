import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { NextRequest } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email cannot be empty' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log request (without sensitive data)
    logger.info('Admin password reset requested', { source: 'api/admin/auth/password-reset/request' });

    // Forward request to Go API with validated email
    const response = await forwardToGoApi(request, '/api/admin/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email: trimmedEmail }),
    });

    // Log response status for monitoring
    logger.info('Admin password reset request completed', { source: 'api/admin/auth/password-reset/request', statusCode: response.status });

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    logger.error('Admin password reset request failed', error, { source: 'api/admin/auth/password-reset/request' });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}