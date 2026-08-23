/**
 * Centralized API Client (Fetch Wrapper)
 * This replaces all custom apiFetch instances across the app to reduce over-engineering.
 */
import { performanceMonitor } from '../metrics/performance';
import { buildRuntimeApiUrl } from './config';
import { errorService } from '@/lib/logging/error-service';
import { useAuthStore } from '@/lib/auth/auth-store';

// The import graph is acyclic and verified:
//   api-client → error-service → safe-client-utils → api/config → utils
//   api-client → auth-store    → user-utils        → safe-client-utils
// (the old client-logger link in the cycle was removed; unified-logger loads
// error-service lazily, so no static path leads back here).

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
}

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: string;
}

const AUTH_REFRESH_ENDPOINT = '/api/auth/refresh';

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10_000;
const CLIENT_RATE_WINDOW_MS = 10_000;
const CLIENT_RATE_LIMIT = 120; // raised to stay below the backend global limit (500/min)

const requestTimestamps: number[] = [];

function enforceClientRequestLimit(): void {
    const now = Date.now();
    while (requestTimestamps[0] != null && now - requestTimestamps[0] >= CLIENT_RATE_WINDOW_MS) {
        requestTimestamps.shift();
    }
    if (requestTimestamps.length >= CLIENT_RATE_LIMIT) {
        throw new Error('Too many API requests. Please try again shortly.');
    }
    requestTimestamps.push(now);
}

class ApiError extends Error {
    public status: number;
    public code?: string;
    public data?: unknown;

    constructor(message: string, status: number, code?: string, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Exponential backoff with jitter prevents synchronized clients from retrying together. */
function retryDelay(retryCount: number): number {
    const exponential = Math.min(MAX_RETRY_DELAY, RETRY_DELAY * Math.pow(2, retryCount));
    return Math.floor(exponential * (0.5 + Math.random() * 0.5));
}

function normalizeEndpoint(endpoint: string): string {
    if (!endpoint) return '';
    return buildRuntimeApiUrl(endpoint);
}

function unwrapApiEnvelope<T>(payload: T | ApiEnvelope<T>): T {
    if (
        payload &&
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        'success' in payload &&
        'data' in payload
    ) {
        return (payload as ApiEnvelope<T>).data as T;
    }

    return payload as T;
}

class ApiClient {
    /** In-flight CSRF bootstrap request — shared across concurrent callers to avoid duplicate fetches */
    private csrfBootstrapPromise: Promise<void> | null = null;
    private lastCsrfToken: string | null = null;
    /**
     * Whether we have ever successfully bootstrapped a CSRF token in this
     * session. The Next.js proxy re-derives the X-CSRF-Token header from the
     * `_csrf` cookie, so the only thing the browser controls is that a *valid*
     * cookie is present on the request. A stale cookie string can linger in
     * `document.cookie` after the backend has already invalidated it, so we must
     * not trust its mere presence — we bootstrap once up front and again on every
     * CSRF rejection to guarantee a freshly minted token.
     */
    private csrfBootstrapped = false;
    /**
     * Ensures the _csrf cookie exists by fetching GET /api/auth/csrf when it is absent.
     * Multiple simultaneous callers share the same in-flight request (single-flight pattern).
     *
     * This solves the bootstrap problem: on first load (or after cookie expiry) the browser
     * has no _csrf cookie, so any POST/PUT/PATCH/DELETE would fail with
     * "CSRF token validation failed" until a GET request triggered ensureCSRFToken on the backend.
     */
    private async ensureCsrfToken(forceRefresh = false): Promise<void> {
        if (typeof window === 'undefined') return;

        const existingCookie = this.getCookie('_csrf');
        // Trust a cookie only if it was minted by a bootstrap we performed this
        // session. A leftover/expired cookie string would otherwise let a stale
        // token slip through and trigger "CSRF token validation failed".
        if (!forceRefresh && existingCookie && this.csrfBootstrapped) {
            this.lastCsrfToken = existingCookie;
            return;
        }

        if (!this.csrfBootstrapPromise) {
            this.csrfBootstrapPromise = fetch('/api/auth/csrf', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`CSRF bootstrap failed with status ${response.status}`);
                    }
                    const token = response.headers.get('X-CSRF-Token');
                    if (token) {
                        this.lastCsrfToken = token;
                    }
                    this.csrfBootstrapped = true;
                    // Wait a small delay to ensure cookie is set
                    return new Promise<void>(resolve => setTimeout(resolve, 50));
                })
                .finally(() => { this.csrfBootstrapPromise = null; });
        }

        return this.csrfBootstrapPromise!;
    }

    private async buildHeaders(customOptions: RequestInit): Promise<Headers> {
        const headers = new Headers({
            ...(customOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...customOptions.headers,
        });

        const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(customOptions.method || 'GET');

        // For state-changing requests in the browser: guarantee the CSRF cookie exists first,
        // then inject it as the X-CSRF-Token header (Double Submit Cookie pattern).
        if (typeof window !== 'undefined' && isWriteMethod) {
            await this.ensureCsrfToken();
            const csrfToken = this.getCookie('_csrf');
            if (csrfToken) {
                this.lastCsrfToken = csrfToken;
                headers.set('X-CSRF-Token', csrfToken);
            } else if (this.lastCsrfToken) {
                headers.set('X-CSRF-Token', this.lastCsrfToken);
            }
        }

        // Auto-generate Idempotency-Key for write requests (idempotency middleware)
        if (isWriteMethod && !headers.has('Idempotency-Key')) {
            headers.set('Idempotency-Key', crypto.randomUUID());
        }

        return headers;
    }

    private resetAuthStore(): void {
        if (typeof window !== 'undefined') {
            useAuthStore.getState().reset();
            // Clear the localStorage token mirror too — it's the only source
            // buildAppUserWebSocketUrl() can read (access_token cookie is
            // HttpOnly), so leaving stale tokens here lets a revoked session
            // keep authenticating WebSocket connections after logout/reset.
            try {
                window.localStorage.removeItem('accessToken');
                window.localStorage.removeItem('refreshToken');
            } catch {
                // Ignore storage errors (private browsing, quota, etc.)
            }
        }
    }

    private logNetworkError(error: unknown, endpoint: string): void {
        try {
            errorService.handleNetworkError(error, endpoint);
        } catch {
            // Logging must never mask the original network error.
        }
    }

    private isRetryableError(error: unknown, retryCount: number, retries: number): boolean {
        const errName = (error as { name?: string })?.name;
        const errMsg = (error as { message?: string })?.message;
        const isNetworkError = errName === 'TypeError' &&
            typeof errMsg === 'string' && /network|failed to fetch|load failed/i.test(errMsg);
        return !!((errName === 'AbortError' || isNetworkError) && retryCount < retries);
    }

    private async isCsrfValidationFailure(response: Response): Promise<boolean> {
        if (response.status !== 403) return false;
        const body = await response.clone().json().catch(() => null) as { error?: string; message?: string } | null;
        const message = body?.error || body?.message || '';
        return message.toLowerCase().includes('csrf');
    }

    /**
     * Core fetch implementation with retry, refresh, timeout, and CSRF logic.
     * This is the single source of truth for all HTTP requests.
     * The public `fetch` method and typed convenience methods all delegate here.
     */
    private async executeFetch(endpoint: string, options: FetchOptions = {}, retryCount = 0): Promise<Response> {
        if (retryCount === 0) enforceClientRequestLimit();
        const { timeout = API_TIMEOUT, retries = MAX_RETRIES, ...customOptions } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const headers = await this.buildHeaders(customOptions);

        try {
            const url = normalizeEndpoint(endpoint);
            const timer = performanceMonitor.startTimer('API Request', { endpoint, method: customOptions.method || 'GET' });
            const response = await fetch(url, {
                ...customOptions,
                headers,
                credentials: 'include',
                signal: controller.signal,
            });

            timer.stop();
            clearTimeout(id);

            if (await this.isCsrfValidationFailure(response) && retryCount < 2) {
                await this.ensureCsrfToken(true);
                await sleep(200); // Increased delay to ensure cookie is set
                return this.executeFetch(endpoint, options, retryCount + 1);
            }

            if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login') && retryCount < 1) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    return this.executeFetch(endpoint, options, retryCount + 1);
                }
                this.resetAuthStore();
            }

            // 429 Too Many Requests: respect the server's Retry-After header
            // instead of blindly retrying with exponential backoff (which would
            // burn through the rate-limit quota even faster). Only retry once.
            if (response.status === 429 && retryCount < 1) {
                const retryAfterHeader = response.headers.get('Retry-After');
                const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
                const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
                    ? Math.min(retryAfterSec * 1000, MAX_RETRY_DELAY)
                    : retryDelay(retryCount);
                await sleep(waitMs);
                return this.executeFetch(endpoint, options, retryCount + 1);
            }

            const shouldRetry = [408, 500, 502, 503, 504].includes(response.status) && retryCount < retries;
            if (shouldRetry) {
                await sleep(retryDelay(retryCount));
                return this.executeFetch(endpoint, options, retryCount + 1);
            }

            return response;
        } catch (error: unknown) {
            clearTimeout(id);

            if (this.isRetryableError(error, retryCount, retries)) {
                await sleep(retryDelay(retryCount));
                return this.executeFetch(endpoint, options, retryCount + 1);
            }

            this.logNetworkError(error, endpoint);
            throw error;
        }
    }

    /**
     * Public raw fetch access — returns the raw Response for callers that
     * need direct access to headers, streaming, etc.
     */
    public async fetch(endpoint: string, options?: FetchOptions): Promise<Response> {
        return this.executeFetch(endpoint, options);
    }

    /**
     * Parses an error response and throws an ApiError.
     * Note: retryable 5xx/408 statuses are already retried inside executeFetch,
     * so this only formats the final failure.
     */
    private async handleErrorAndThrow(response: Response): Promise<never> {
        let errorMessage = `Server error: ${response.statusText}`;
        let errorCode = 'HTTP_ERROR';
        let errorData: unknown = null;

        const responseText = await response.text();
        try {
            errorData = JSON.parse(responseText);
            const body = errorData as Record<string, unknown>;
            errorMessage = typeof body.error === 'string'
                ? body.error
                : typeof body.message === 'string' ? body.message : errorMessage;
            errorCode = typeof body.code === 'string' ? body.code : errorCode;
        } catch {
            if (responseText) errorMessage = responseText;
        }

        throw new ApiError(errorMessage, response.status, errorCode, errorData);
    }

    /**
     * Typed request — uses executeFetch internally and parses the JSON response.
     * All retries (network, 5xx, CSRF, 401-refresh, 429) live in executeFetch,
     * so request() must not retry again or failures get amplified 4x.
     */
    private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const response = await this.executeFetch(endpoint, options);

        // Check for empty response
        const contentLength = response.headers.get('content-length');
        if (response.status === 204 || contentLength === '0') {
            return {} as T;
        }

        if (!response.ok) {
            await this.handleErrorAndThrow(response);
        }

        const payload = await response.json() as T | ApiEnvelope<T>;
        return unwrapApiEnvelope<T>(payload);
    }

    private refreshPromise: Promise<boolean> | null = null;

    private async refreshToken(): Promise<boolean> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            try {
                // Ensure CSRF token exists before refresh
                await this.ensureCsrfToken();
                
                const headers: Record<string, string> = {};
                if (typeof window !== 'undefined') {
                    const csrfToken = this.getCookie('_csrf');
                    if (csrfToken) {
                        headers['X-CSRF-Token'] = csrfToken;
                    }
                }

                const response = await fetch(AUTH_REFRESH_ENDPOINT, {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                });

                if (response.ok && typeof window !== 'undefined') {
                    // The access_token cookie is HttpOnly (by design — XSS-hardened),
                    // which means WebSocket connections (buildAppUserWebSocketUrl) can
                    // never read it via document.cookie and rely on this localStorage
                    // mirror as their only viable auth source. Keep it in sync on every
                    // successful refresh, or WS auth silently uses a stale token.
                    try {
                        const payload = await response.clone().json() as { data?: { accessToken?: string; refreshToken?: string }; accessToken?: string; refreshToken?: string };
                        const accessToken = payload?.data?.accessToken ?? payload?.accessToken;
                        const refreshTokenValue = payload?.data?.refreshToken ?? payload?.refreshToken;
                        if (accessToken) window.localStorage.setItem('accessToken', accessToken);
                        if (refreshTokenValue) window.localStorage.setItem('refreshToken', refreshTokenValue);
                    } catch {
                        // Non-fatal — the refresh itself succeeded via cookies; the
                        // localStorage mirror just won't be updated this cycle.
                    }
                }

                return response.ok;
            } catch {
                return false;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    public get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public post<T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    public put<T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    public patch<T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    public delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * Read a cookie and URL-decode its value.
     *
     * Decoding is required, not cosmetic: the Go API writes the CSRF cookie with
     * Gin's `c.SetCookie`, which stores `url.QueryEscape(token)` — so a token
     * ending in base64 padding reaches `document.cookie` as `...%3D`. Gin then
     * reads it back with `c.Cookie`, which `url.QueryUnescape`s it. Sending the
     * raw `...%3D` string as `X-CSRF-Token` therefore fails the double-submit
     * comparison with `403 {"error":"CSRF token validation failed"}`.
     */
    private getCookie(name: string): string | null {
        if (typeof document === 'undefined') return null;
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            const c = ca[i];
            if (!c) continue;
            let trimmed = c;
            while (trimmed.charAt(0) === ' ') trimmed = trimmed.substring(1);
            if (trimmed.indexOf(nameEQ) === 0) {
                const rawValue = trimmed.substring(nameEQ.length);
                try {
                    return decodeURIComponent(rawValue);
                } catch {
                    // Malformed percent-encoding — fall back to the raw value.
                    return rawValue;
                }
            }
        }
        return null;
    }
}


export const apiClient = new ApiClient();
