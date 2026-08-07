"use client";

import { useEffect, useRef } from "react";
import { useWebSocket } from "@/contexts/websocket-context";

/**
 * WebSocket message types that should trigger a dashboard refresh.
 */
const REFRESH_TRIGGERS = new Set([
  "admin_notification",
  "broadcast-completed",
  "notification",
  "activity",
]);

/**
 * Subscribe to admin WebSocket messages and trigger a debounced refetch.
 *
 * dashboard data. This hook debounces the refetch so a burst of notifications
 * only results in a single network request after the configured delay.
 *
 * Only explicit message types in {@link REFRESH_TRIGGERS} trigger a refetch
 * (not every `admin_*` WebSocket event).
 *
 * @param refetch - The react-query `refetch` function.
 * @param delay   - Debounce window in ms (default 2000).
 */
export function useDashboardRealtime(
  refetch: () => void,
  delay = 2000,
): void {
  const { socket } = useWebSocket();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refetchRef = useRef(refetch);

  // Keep the latest refetch without re-subscribing the listener.
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!socket) return;

    const handleWsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const type: string | undefined = data?.type;
        if (!type) return;

        const shouldRefresh = REFRESH_TRIGGERS.has(type);

        if (!shouldRefresh) return;

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          refetchRef.current();
          timerRef.current = null;
        }, delay);
      } catch {
        // Ignore malformed messages
      }
    };

    socket.addEventListener("message", handleWsMessage);
    return () => {
      socket.removeEventListener("message", handleWsMessage);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [socket, delay]);
}