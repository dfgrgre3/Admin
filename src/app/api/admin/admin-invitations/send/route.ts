import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { NextRequest as NextRequestType } from 'next/server';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format (for inviterId if provided)
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(request: NextRequestType) {
  try {
    const body = await request.json();
    const { email, role, inviterId } = body;

    // Validate email
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

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role (if provided)
    if (role !== undefined && typeof role !== 'string') {
      return NextResponse.json(
        { error: 'Role must be a string if provided' },
        { status: 400 }
      );
    }

    // Validate inviterId (if provided)
    if (inviterId !== undefined && typeof inviterId !== 'string') {
      return NextResponse.json(
        { error: 'Inviter ID must be a string if provided' },
        { status: 400 }
      );
    }

    const trimmedInviterId = inviterId ? inviterId.trim() : null;
    if (inviterId && (!trimmedInviterId || !isValidUUID(trimmedInviterId))) {
      return NextResponse.json(
        { error: 'Invalid inviter ID format' },
        { status: 400 }
      );
    }

    // Log request (without sensitive data)
    logger.info('Admin invitation requested', { source: 'api/admin/admin-invitations/send' });

    // Prepare request body
    const requestBody: any = { email: trimmedEmail };
    if (role !== undefined) {
      requestBody.role = role;
    }
    if (inviterId !== undefined) {
      requestBody.inviterId = trimmedInviterId;
    }

    // Forward request to Go API
    const response = await forwardToGoApi(request, '/api/admin/admin-invitations/send', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Log response status for monitoring
    logger.info('Admin invitation request completed', { source: 'api/admin/admin-invitations/send', statusCode: response.status });

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    logger.error('Admin invitation handler failed', error, { source: 'api/admin/admin-invitations/send' });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to send admin invitation' },
      { status: 500 }
    );
  }
}