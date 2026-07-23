import { NextRequest, NextResponse } from 'next/server';
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
    console.info(`Password reset requested for email: ${trimmedEmail}`);

    // Forward request to Go API with validated email
    const forwardedRequest = new Request(request, {
      body: JSON.stringify({ email: trimmedEmail }),
      headers: request.headers
    });

    const response = await forwardToGoApi(forwardedRequest, '/api/admin/auth/password-reset/request', { method: 'POST' });

    // Log response status for monitoring
    console.info(`Password reset request completed with status: ${response.status}`);

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    console.error('Password reset request error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}