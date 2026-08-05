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

  // Get access token from cookies for WebSocket authentication.
  // The browser's WebSocket API cannot set custom headers, so we pass the token as a query parameter.
  // Cookies may be HttpOnly or blocked on cross-origin WS connections, so fall back to localStorage.
  const accessToken = getAccessTokenFromCookie() || getAccessTokenFromStorage();
  const tokenParam = accessToken ? `&access_token=${encodeURIComponent(accessToken)}` : '';

  return `${wsProtocol}//${host}/api/ws?userId=${encodeURIComponent(userId)}${tokenParam}`;
}

function getAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

/**
 * Extract access token from cookies for WebSocket authentication.
 * WebSocket connections cannot send custom headers, so we pass the token as a query parameter.
 */
function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = "access_token=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  // Fallback: try __session cookie
  const sessionNameEQ = "__session=";
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(sessionNameEQ) === 0) return c.substring(sessionNameEQ.length, c.length);
  }

  return null;
}
