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
const CLIENT_RATE_LIMIT = 60;

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
        if (!forceRefresh && this.getCookie('_csrf')) return;

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
                })
                .finally(() => { this.csrfBootstrapPromise = null; });
        }

        return this.csrfBootstrapPromise;
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
                headers.set('X-CSRF-Token', csrfToken);
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

    public async fetch(endpoint: string, options: FetchOptions = {}, retryCount = 0): Promise<Response> {
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

            if (await this.isCsrfValidationFailure(response) && retryCount < 1) {
                await this.ensureCsrfToken(true);
                return this.fetch(endpoint, options, retryCount + 1);
            }

            if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login') && retryCount < 1) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    return this.fetch(endpoint, options, retryCount + 1);
                }
                this.resetAuthStore();
            }

            const shouldRetry = [408, 429, 500, 502, 503, 504].includes(response.status) && retryCount < retries;
            if (shouldRetry) {
                await sleep(retryDelay(retryCount));
                return this.fetch(endpoint, options, retryCount + 1);
            }

            return response;
        } catch (error: unknown) {
            clearTimeout(id);

            if (this.isRetryableError(error, retryCount, retries)) {
                await sleep(retryDelay(retryCount));
                return this.fetch(endpoint, options, retryCount + 1);
            }

            this.logNetworkError(error, endpoint);
            throw error;
        }
    }

    /**
     * Parses an error response. Returns `true` when the caller should retry;
     * otherwise throws an ApiError (caught and re-thrown by `request`).
     */
    private async handleApiErrorResponse(response: Response, retryCount: number, retries: number): Promise<true> {
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

        const shouldRetry = [408, 429, 500, 502, 503, 504].includes(response.status) && retryCount < retries;
        if (shouldRetry) return true;

        throw new ApiError(errorMessage, response.status, errorCode, errorData);
    }

    private async request<T>(endpoint: string, options: FetchOptions = {}, retryCount = 0): Promise<T> {
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
                credentials: 'include', // Ensure cookies are sent (access_token)
                signal: controller.signal,
            });
            timer.stop();

            clearTimeout(id);

            if (await this.isCsrfValidationFailure(response) && retryCount < 1) {
                await this.ensureCsrfToken(true);
                return this.request<T>(endpoint, options, retryCount + 1);
            }

            // Handle 401 Unauthorized - Attempt Token Refresh
            if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login') && retryCount < 1) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry original request once more
                    return this.request<T>(endpoint, options, retryCount + 1);
                }
                
                this.resetAuthStore();
            }

            if (!response.ok) {
                const shouldRetry = await this.handleApiErrorResponse(response, retryCount, retries);
                if (shouldRetry) {
                    await sleep(retryDelay(retryCount));
                    return this.request<T>(endpoint, options, retryCount + 1);
                }
            }

            // Check for empty response
            const contentLength = response.headers.get('content-length');
            if (response.status === 204 || contentLength === '0') {
                return {} as T;
            }

            const payload = await response.json() as T | ApiEnvelope<T>;
            return unwrapApiEnvelope<T>(payload);
        } catch (error: unknown) {
            clearTimeout(id);

            if (error instanceof ApiError) throw error;

            if (this.isRetryableError(error, retryCount, retries)) {
                await sleep(retryDelay(retryCount));
                return this.request<T>(endpoint, options, retryCount + 1);
            }

            this.logNetworkError(error, endpoint);
            throw error;
        }
    }

    private refreshPromise: Promise<boolean> | null = null;

    private async refreshToken(): Promise<boolean> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            try {
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

    private getCookie(name: string): string | null {
        if (typeof document === 'undefined') return null;
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            const c = ca[i];
            if (!c) continue;
            let trimmed = c;
            while (trimmed.charAt(0) === ' ') trimmed = trimmed.substring(1);
            if (trimmed.indexOf(nameEQ) === 0) return trimmed.substring(nameEQ.length);
        }
        return null;
    }
}


export const apiClient = new ApiClient();
export default apiClient;
