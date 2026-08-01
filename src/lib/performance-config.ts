/** Shared performance defaults for data-heavy admin screens. */
export const PERFORMANCE_DEFAULTS = {
  queryStaleTimeMs: 5 * 60 * 1000,
  queryGcTimeMs: 24 * 60 * 60 * 1000,
  persistedQueryMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 30, 50] as const,
  lazyLoadRootMargin: "200px",
  serverCacheTtlSeconds: 5 * 60,
} as const;

export function normalizePageSize(
  value: number | undefined,
  fallback = PERFORMANCE_DEFAULTS.defaultPageSize,
): number {
  if (!Number.isFinite(value) || (value ?? 0) <= 0) return fallback;
  return Math.floor(value as number);
}

export function getPageSizeOptions(currentPageSize?: number): number[] {
  const current = normalizePageSize(currentPageSize);
  return [...new Set([...PERFORMANCE_DEFAULTS.pageSizeOptions, current])].sort((a, b) => a - b);
}