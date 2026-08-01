'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ErrorInfo } from 'react';
import { logger } from '@/lib/logger';
import { buildAppUserWebSocketUrl } from '@/lib/realtime/build-ws-url';
import { useAuth } from './auth-context';


type WebSocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false
});

// Error boundary component to catch any WebSocket-related errors
class WebSocketErrorBoundary extends React.Component<
  {children: React.ReactNode;},
  {hasError: boolean;}>
{
  constructor(props: {children: React.ReactNode;}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): {hasError: boolean;} {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log WebSocket errors instead of silently swallowing them
    try {
      console.error('[WebSocketErrorBoundary] Error caught:', error.message, errorInfo.componentStack);
    } catch {
      // Safety net in case console itself is unavailable
    }
  } override render() {
    if (this.state.hasError) {
      // Silently return children without WebSocket functionality
      return <>{this.props.children}</>;
    }

    return this.props.children;
  }
}

// WebSocket is enabled: the Go backend serves the realtime endpoint at /api/ws.
const WEBSOCKET_ENABLED = true;

export function WebSocketProvider({ children, userId }: {children: React.ReactNode;userId?: string;}) {
  const { user } = useAuth();
  const currentUserId = userId || user?.id;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Track if page was restored from bfcache
  const [isBfcacheRestored, setIsBfcacheRestored] = useState(false);

  useEffect(() => {
    // Handle bfcache restoration
    const handleBfcacheRestore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      setIsBfcacheRestored(true);
      // Reset connection state on restore
      setSocket(null);
      setIsConnected(false);
    };

    window.addEventListener('pageshow', handleBfcacheRestore);
    return () => window.removeEventListener('pageshow', handleBfcacheRestore);
  }, []);

  useEffect(() => {
    // Wait until a user id is available before connecting
    if (!WEBSOCKET_ENABLED || !currentUserId) {
      return;
    }

    // Skip connection if page was just restored from bfcache
    if (isBfcacheRestored) {
      queueMicrotask(() => setIsBfcacheRestored(false));
      return;
    }

    // ... rest of the connection logic ...
    const isWebSocketSupported = typeof window !== 'undefined' && 'WebSocket' in window;

    if (!isWebSocketSupported) {
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (!WEBSOCKET_ENABLED || !currentUserId) return;

      try {
        const wsUrl = buildAppUserWebSocketUrl(currentUserId);
        if (!wsUrl) return;

        ws = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        }, 30000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          if (!WEBSOCKET_ENABLED) {
            ws?.close();
            return;
          }
          setIsConnected(true);
          setSocket(ws);
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          if (!WEBSOCKET_ENABLED) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              logger.info('WebSocket notification:', data.message);
            }
          } catch (error) {
            logger.debug('Failed to parse WebSocket message', error);
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          setSocket(null);
          if (WEBSOCKET_ENABLED && event.code !== 1000) {
            reconnectAttempts++;
            const delay = Math.min(3000 * Math.pow(2, reconnectAttempts - 1), 30000);
            logger.info(`WebSocket disconnected, attempting reconnection #${reconnectAttempts} in ${delay}ms`);
            reconnectTimeout = setTimeout(connect, delay);
          }
        };

        ws.onerror = () => {
          clearTimeout(connectionTimeout);
          if (ws) {
            try {ws.close();} catch {
              return;
            }
          }
        };
      } catch (error) {
        logger.debug('WebSocket connection attempt failed', error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onerror = null;
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        try {ws.close();} catch {
          return;
        }
      }
      setSocket((current) => current === null ? current : null);
      setIsConnected((current) => current ? false : current);
    };
  }, [currentUserId, isBfcacheRestored]); // Use currentUserId as dependency

  // Always provide safe default values
  const contextValue = useMemo<WebSocketContextType>(() => ({
    socket: WEBSOCKET_ENABLED ? socket : null,
    isConnected: WEBSOCKET_ENABLED ? isConnected : false
  }), [socket, isConnected]);

  // Wrap in error boundary to catch any unexpected errors
  return (
    <WebSocketErrorBoundary>
      <WebSocketContext.Provider value={contextValue}>
        {children}
      </WebSocketContext.Provider>
    </WebSocketErrorBoundary>);

}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  // Always return safe defaults, never undefined
  if (!context) {
    return {
      socket: null,
      isConnected: false
    };
  }

  return context;
}
