import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, backendJsonResponse, upstreamAuthHeaders } from '@/app/api/auth/_utils';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = upstreamAuthHeaders(request);

    // Validate request
    if (!body.message && !body.messages) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Extract the last user message
    let userMessage = body.message;
    if (!userMessage && body.messages) {
      const lastUserMessage = body.messages.filter((msg: any) => msg.role === 'user').pop();
      userMessage = lastUserMessage?.content;
    }

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: 'No user message found' },
        { status: 400 }
      );
    }

    // Build backend payload
    const backendPayload: any = {
      message: userMessage,
      stream: body.stream || false,
    };

    // Add conversation ID if provided
    if (body.conversationId) {
      backendPayload.conversationId = body.conversationId;
    }

    logger.info('AI chat request received', {
      source: 'api/ai/chat',
      stream: Boolean(backendPayload.stream),
      hasConversationId: Boolean(backendPayload.conversationId),
    });

    // Handle streaming request
    if (backendPayload.stream) {
      return handleStreamingRequest(request, backendPayload);
    }

    // Non-streaming request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const postHeaders = new Headers({
      'Content-Type': 'application/json',
      ...headers
    });
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    postHeaders.delete('origin');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: postHeaders,
        body: JSON.stringify(backendPayload),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      logger.info('AI chat backend response', { source: 'api/ai/chat', statusCode: response.status });

      if (!response.ok) {
        await response.body?.cancel();
        logger.error('AI chat backend request failed', undefined, {
          source: 'api/ai/chat',
          statusCode: response.status,
        });
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to communicate with AI assistant'
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      const reply = data.reply || data.message || '';

      return NextResponse.json({
        success: true,
        reply,
        message: reply || 'عذراً، لم أتمكن من الرد على سؤالك',
        conversationId: data.conversationId,
        messageId: data.messageId,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        logger.warn('AI chat request timed out', { source: 'api/ai/chat' });
        return NextResponse.json(
          { 
            success: false, 
            error: 'Request timed out. Please try again.'
          },
          { status: 504 }
        );
      }
      
      logger.error('AI chat request failed', error, { source: 'api/ai/chat' });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to AI assistant'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error('AI chat handler failed', error, { source: 'api/ai/chat' });
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timed out. Please try again.'
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to AI assistant'
      },
      { status: 500 }
    );
  }
}

// Handle streaming response from backend
async function handleStreamingRequest(request: NextRequest, payload: any) {
  const backendUrl = BACKEND_URL;
  const headers = upstreamAuthHeaders(request);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for streaming

  try {
    const streamHeaders = new Headers({
      'Content-Type': 'application/json',
      ...headers
    });
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    streamHeaders.delete('origin');

    const response = await fetch(`${backendUrl}/api/ai/chat`, {
      method: 'POST',
      headers: streamHeaders,
      body: JSON.stringify(payload),
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await response.body?.cancel();
      logger.error('AI streaming backend request failed', undefined, {
        source: 'api/ai/chat',
        statusCode: response.status,
      });
      return NextResponse.json(
        { error: 'AI streaming request failed' },
        { status: response.status }
      );
    }

    // Check if response is SSE (Server-Sent Events)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      // Return the streaming response directly
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    // If not streaming, parse as JSON
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Streaming request timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to connect to streaming AI service' },
      { status: 500 }
    );
  }
}

// GET handler for retrieving conversations
export async function GET(request: NextRequest) {
  try {
    const headers = upstreamAuthHeaders(request);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const backendUrl = BACKEND_URL;

    // Handle different actions
    if (action === 'conversations') {
      // Get user's conversations
      const getHeaders = new Headers(headers);
      // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
      getHeaders.delete('origin');

      const response = await fetch(`${backendUrl}/api/ai/conversations`, {
        method: 'GET',
        headers: getHeaders,
        credentials: 'include'
      });

      if (!response.ok) {
        await response.body?.cancel();
        return NextResponse.json(
          { error: 'Failed to retrieve conversations' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'conversation') {
      const conversationId = searchParams.get('id');
      if (!conversationId) {
        return NextResponse.json(
          { error: 'Conversation ID is required' },
          { status: 400 }
        );
      }

      const getConvHeaders = new Headers(headers);
      // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
      getConvHeaders.delete('origin');

      const response = await fetch(`${backendUrl}/api/ai/conversation/${conversationId}`, {
        method: 'GET',
        headers: getConvHeaders,
        credentials: 'include'
      });

      if (!response.ok) {
        await response.body?.cancel();
        return NextResponse.json(
          { error: 'Failed to retrieve conversation' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    logger.error('AI conversations handler failed', error, { source: 'api/ai/chat' });
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting conversations
export async function DELETE(request: NextRequest) {
  try {
    const headers = upstreamAuthHeaders(request);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const backendUrl = BACKEND_URL;

    const deleteHeaders = new Headers(headers);
    // CRITICAL CSRF FIX: Strip the Origin header when proxying to the Go backend.
    deleteHeaders.delete('origin');

    const response = await fetch(`${backendUrl}/api/ai/conversation/${conversationId}`, {
      method: 'DELETE',
      headers: deleteHeaders,
      credentials: 'include'
    });

    if (!response.ok) {
      await response.body?.cancel();
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('AI conversation deletion failed', error, { source: 'api/ai/chat' });
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}