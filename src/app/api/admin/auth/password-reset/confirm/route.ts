import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate reset token format (assuming it's a UUID or similar)
 * Adjust the regex as per your token format
 */
function isValidResetToken(token: string): boolean {
  // Example: UUID v4 format, adjust if your token format is different
  const tokenRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return tokenRegex.test(token);
}

/**
 * Validate password strength (basic)
 */
function isValidPassword(password: string): boolean {
  // At least 8 characters, contains at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required and must be a string' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'New password is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedToken = token.trim();
    const trimmedPassword = password.trim();

    if (!trimmedToken) {
      return NextResponse.json(
        { error: 'Reset token cannot be empty' },
        { status: 400 }
      );
    }

    if (!trimmedPassword) {
      return NextResponse.json(
        { error: 'New password cannot be empty' },
        { status: 400 }
      );
    }

    // Validate token format
    if (!isValidResetToken(trimmedToken)) {
      return NextResponse.json(
        { error: 'Invalid reset token format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(trimmedPassword)) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long and contain at least one letter and one number' 
        },
        { status: 400 }
      );
    }

    // Log request (without sensitive data)
    console.info('Password reset confirmation requested');

    // Forward request to Go API with validated data
    const forwardedRequest = new Request(request, {
      body: JSON.stringify({ token: trimmedToken, password: trimmedPassword }),
      headers: request.headers
    });

    const response = await forwardToGoApi(forwardedRequest, '/api/admin/auth/password-reset/confirm', { method: 'POST' });

    // Log response status for monitoring
    console.info(`Password reset confirmation completed with status: ${response.status}`);

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    console.error('Password reset confirmation error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to confirm password reset' },
      { status: 500 }
    );
  }
}