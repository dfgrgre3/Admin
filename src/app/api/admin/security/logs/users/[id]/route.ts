import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { forwardToGoApi } from '@/app/api/admin/_proxy';

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate input
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();
    if (!trimmedId) {
      return NextResponse.json(
        { error: 'User ID cannot be empty' },
        { status: 400 }
      );
    }

    // Validate UUID format (adjust regex if your ID format differs)
    if (!isValidUUID(trimmedId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Log request for auditing (avoid logging sensitive data)
    logger.info('Admin user security logs requested', { source: 'api/admin/security/logs/users' });

    // Forward request to Go API
    const response = await forwardToGoApi(
      request, 
      `/api/admin/security/logs/users/${trimmedId}`, 
      { method: 'GET' }
    );

    // Log response status for monitoring
    logger.info('Admin user security logs request completed', { source: 'api/admin/security/logs/users', statusCode: response.status });

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    logger.error('Admin user security logs request failed', error, { source: 'api/admin/security/logs/users' });
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
}