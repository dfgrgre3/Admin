import { NextRequest, NextResponse } from 'next/server';
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
    console.info(`Fetching security logs for user ID: ${trimmedId}`);

    // Forward request to Go API
    const response = await forwardToGoApi(
      request, 
      `/api/admin/security/logs/users/${trimmedId}`, 
      { method: 'GET' }
    );

    // Log response status for monitoring
    console.info(`Security logs request completed with status: ${response.status}`);

    return response;
  } catch (error) {
    // Log detailed error for debugging (avoid exposing internal details in response)
    console.error('Admin security logs GET error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
}