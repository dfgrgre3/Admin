/**
 * Shared API response types for Admin Panel.
 * Mirrors the backend ApiResponse envelope and pagination structure.
 * Synced with frontend types/api/responses.ts
 * Last sync: 2026-06-29
 */

// ────────────────────────────────────────────────────────────
// Core API Envelope
// ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
  /** legacy field — some handlers return total at root */
  total?: number;
}

// ────────────────────────────────────────────────────────────
// API Error
// ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly data?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code?: string,
    data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }

  get isUnauthorized(): boolean { return this.status === 401; }
  get isForbidden(): boolean { return this.status === 403; }
  get isNotFound(): boolean { return this.status === 404; }
  get isValidation(): boolean { return this.status === 422; }
  get isRateLimited(): boolean { return this.status === 429; }
}

// ────────────────────────────────────────────────────────────
// Query helpers
// ────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams, SortParams {
  q?: string;
}
