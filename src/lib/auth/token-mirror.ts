/**
 * In-memory (non-persisted) mirror of the access token.
 *
 * SECURITY: this used to be a `localStorage` mirror. localStorage persists
 * across reloads/tabs/restarts and has no expiry, so any XSS anywhere in the
 * admin panel — even one that only runs once, days after a login — could
 * read it and steal a live session. The real `access_token`/`refresh_token`
 * cookies are already HttpOnly and are the source of truth for every normal
 * request; this module exists only for the two cases JS genuinely cannot use
 * cookies for:
 *
 *   1. WebSocket auth (`build-ws-url.ts`) — the browser WebSocket API cannot
 *      send custom headers or rely on an HttpOnly cookie being forwarded
 *      cross-origin, so the token must be attached as a query param.
 *   2. A same-tab "have I ever logged in" hint (`auth-context.tsx`) to avoid
 *      an unnecessary `/api/auth/me` call on public pages.
 *
 * Keeping this in a module-level variable instead of localStorage means the
 * token never survives a page reload, a new tab, or the browser closing, and
 * an XSS payload can only exfiltrate it during the exact window the script
 * runs — not read it back out of storage at leisure. It is intentionally
 * *not* exported as a mutable object so callers can't accidentally stash a
 * second durable copy elsewhere.
 */
let accessTokenMirror: string | null = null;

export function setAccessTokenMirror(token: string | null | undefined): void {
  accessTokenMirror = typeof token === 'string' && token ? token : null;
}

export function getAccessTokenMirror(): string | null {
  return accessTokenMirror;
}

export function clearAccessTokenMirror(): void {
  accessTokenMirror = null;
}

export function hasAccessTokenMirror(): boolean {
  return accessTokenMirror !== null;
}
