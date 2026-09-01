'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { logger } from '@/lib/logger';

export type AdminEventType =
  | 'new_ticket'
  | 'ticket_updated'
  | 'new_payment'
  | 'payment_refunded'
  | 'user_registered'
  | 'user_login'
  | 'user_logout'
  | 'user_suspended'
  | 'user_activated'
  | 'user_deleted'
  | 'user_restored'
  | 'user_status_changed'
  | 'user_online'
  | 'user_offline'
  | 'user_verified'
  | 'user_role_changed'
  | 'user_permissions_changed'
  | 'course_created'
  | 'course_updated'
  | 'exam_submitted'
  | 'live_session_started'
  | 'live_session_ended'
  | 'announcement_published';

export interface AdminEvent {
  type: AdminEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

type EventHandler = (event: AdminEvent) => void;

const handlersMap = new Map<AdminEventType, Set<EventHandler>>();

function registerHandler(type: AdminEventType, handler: EventHandler) {
  if (!handlersMap.has(type)) {
    handlersMap.set(type, new Set());
  }
  handlersMap.get(type)!.add(handler);
}

function unregisterHandler(type: AdminEventType, handler: EventHandler) {
  handlersMap.get(type)?.delete(handler);
}

function dispatchAdminEvent(event: AdminEvent) {
  const handlers = handlersMap.get(event.type);
  if (handlers) {
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        logger.error('Error in admin event handler:', error);
      }
    });
  }
}

export function useAdminRealtime() {
  const { socket, isConnected } = useWebSocket();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const subscribe = useCallback((type: AdminEventType, handler: EventHandler) => {
    registerHandler(type, handler);
    return () => unregisterHandler(type, handler);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type.startsWith('admin_')) {
          const adminEventType = data.type.replace('admin_', '') as AdminEventType;
          dispatchAdminEvent({
            type: adminEventType,
            data: data.payload || {},
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.debug('Failed to parse admin WebSocket message', error);
      }
    };

    messageHandlerRef.current = handleMessage;
    socket.addEventListener('message', handleMessage);

    return () => {
      if (socket && messageHandlerRef.current) {
        socket.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, [socket, isConnected]);

  return { subscribe, isConnected };
}

// Keeps a callback's latest identity in a ref so effects that use it can
// depend on stable booleans (whether a handler is present) instead of the
// handler's own identity — callers don't need to memoize what they pass in.
function useLatestCallback(callback: (() => void) | undefined): () => void {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  return useCallback(() => {
    ref.current?.();
  }, []);
}

export function useTicketRealtime(onNewTicket?: () => void, onTicketUpdate?: () => void) {
  const { subscribe, isConnected } = useAdminRealtime();
  const latestNewTicket = useLatestCallback(onNewTicket);
  const latestTicketUpdate = useLatestCallback(onTicketUpdate);
  const hasNewTicket = !!onNewTicket;
  const hasTicketUpdate = !!onTicketUpdate;

  useEffect(() => {
    if (!hasNewTicket && !hasTicketUpdate) return;

    const unsubNew = hasNewTicket ? subscribe('new_ticket', () => latestNewTicket()) : undefined;
    const unsubUpdate = hasTicketUpdate
      ? subscribe('ticket_updated', () => latestTicketUpdate())
      : undefined;

    return () => {
      unsubNew?.();
      unsubUpdate?.();
    };
  }, [subscribe, hasNewTicket, hasTicketUpdate, latestNewTicket, latestTicketUpdate]);

  return { isConnected };
}

export function usePaymentRealtime(onNewPayment?: () => void, onRefund?: () => void) {
  const { subscribe, isConnected } = useAdminRealtime();
  const latestNewPayment = useLatestCallback(onNewPayment);
  const latestRefund = useLatestCallback(onRefund);
  const hasNewPayment = !!onNewPayment;
  const hasRefund = !!onRefund;

  useEffect(() => {
    if (!hasNewPayment && !hasRefund) return;

    const unsubNew = hasNewPayment ? subscribe('new_payment', () => latestNewPayment()) : undefined;
    const unsubRefund = hasRefund ? subscribe('payment_refunded', () => latestRefund()) : undefined;

    return () => {
      unsubNew?.();
      unsubRefund?.();
    };
  }, [subscribe, hasNewPayment, hasRefund, latestNewPayment, latestRefund]);

  return { isConnected };
}

export function useLiveMonitoringRealtime(onSessionStart?: () => void, onSessionEnd?: () => void) {
  const { subscribe, isConnected } = useAdminRealtime();
  const latestSessionStart = useLatestCallback(onSessionStart);
  const latestSessionEnd = useLatestCallback(onSessionEnd);
  const hasSessionStart = !!onSessionStart;
  const hasSessionEnd = !!onSessionEnd;

  useEffect(() => {
    if (!hasSessionStart && !hasSessionEnd) return;

    const unsubStart = hasSessionStart
      ? subscribe('live_session_started', () => latestSessionStart())
      : undefined;
    const unsubEnd = hasSessionEnd
      ? subscribe('live_session_ended', () => latestSessionEnd())
      : undefined;

    return () => {
      unsubStart?.();
      unsubEnd?.();
    };
  }, [subscribe, hasSessionStart, hasSessionEnd, latestSessionStart, latestSessionEnd]);

  return { isConnected };
}
