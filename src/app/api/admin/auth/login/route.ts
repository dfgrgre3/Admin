import { NextRequest, NextResponse } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email cannot be empty' },
        { status: 400 }
      );
    }

    if (!trimmedPassword) {
      return NextResponse.json(
        { error: 'Password cannot be empty' },
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

    // Validate password strength
    if (!isValidPassword(trimmedPassword)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one letter and one number' },
        { status: 400 }
      );
    }

    // Log attempt for auditing (without sensitive data)
    console.info(`Admin login attempt for email: ${trimmedEmail}`);

    // Forward request to Go API with validated data
    const forwardedRequest = new Request(request, {
      body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      headers: request.headers
    });

    const response = await forwardToGoApi(forwardedRequest, '/api/admin/auth/login', { method: 'POST' });

    // Log response status for monitoring
    console.info(`Admin login request completed with status: ${response.status}`);

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    console.error('Admin login error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}