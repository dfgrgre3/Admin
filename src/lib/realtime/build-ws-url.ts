import { getAccessTokenMirror } from '@/lib/auth/token-mirror';

/**
 * Single place for browser WebSocket URL to `/api/ws` (notifications + future live payloads).
 * The WebSocket endpoint is served by the backend API server, not the Next.js frontend.
 * Uses NEXT_PUBLIC_API_URL to construct the WebSocket URL pointing to the backend.
 */
export function buildAppUserWebSocketUrl(userId: string): string {
  if (typeof window === "undefined" || !userId) return "";

  // Use NEXT_PUBLIC_API_URL if available, otherwise fall back to NEXT_PUBLIC_WS_HOST,
  // otherwise fall back to window.location.host (for backward compatibility)
  const apiUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.trim()) ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_HOST?.trim()) ||
    window.location.host;

  // Follow the configured backend protocol. A tunneled HTTPS frontend can
  // still use an HTTP localhost backend during development; forcing `wss` in
  // that case makes the browser try to TLS-connect to a plain HTTP server.
  const configuredProtocol = apiUrl.match(/^([a-z][a-z\d+.-]*):\/\//i)?.[1];
  const wsProtocol = configuredProtocol
    ? (configuredProtocol.toLowerCase() === "https" ? "wss:" : "ws:")
    : (window.location.protocol === "https:" ? "wss:" : "ws:");

  // Extract host from API URL (e.g., "http://localhost:8082/api" -> "localhost:8082")
  // or use the host directly if it's already in host:port format
  let host: string;
  if (apiUrl.includes('://')) {
    // Full URL provided, extract host
    const url = new URL(apiUrl);
    host = url.host;
  } else if (apiUrl.includes(':')) {
    // Already in host:port format
    host = apiUrl;
  } else {
    // Just a hostname, use as-is
    host = apiUrl;
  }

  // Get the access token for WebSocket authentication. The real access_token
  // cookie is HttpOnly by design (unreadable via document.cookie, and not
  // reliably forwarded on a cross-origin WS handshake either), and the
  // browser WebSocket API cannot send custom headers — so the only viable
  // path is this in-memory mirror, passed as a query parameter. It is never
  // persisted to localStorage; see token-mirror.ts for why.
  const accessToken = getAccessTokenMirror();
  const tokenParam = accessToken ? `&access_token=${encodeURIComponent(accessToken)}` : '';

  return `${wsProtocol}//${host}/api/v1/ws?userId=${encodeURIComponent(userId)}${tokenParam}`;
}
