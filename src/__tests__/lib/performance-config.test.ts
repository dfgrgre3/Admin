import {
  getPageSizeOptions,
  normalizePageSize,
  PERFORMANCE_DEFAULTS,
} from "@/lib/performance-config";

describe("performance defaults", () => {
  it("uses pagination by default with a bounded page size", () => {
    expect(PERFORMANCE_DEFAULTS.defaultPageSize).toBe(10);
    expect(normalizePageSize(undefined)).toBe(10);
    expect(normalizePageSize(0)).toBe(10);
    expect(normalizePageSize(Number.NaN)).toBe(10);
  });

  it("normalizes custom page sizes and exposes them in the selector", () => {
    expect(normalizePageSize(15.9)).toBe(15);
    expect(getPageSizeOptions(15)).toEqual([10, 15, 20, 30, 50]);
  });

  it("defines finite cache lifetimes", () => {
    expect(PERFORMANCE_DEFAULTS.queryStaleTimeMs).toBeGreaterThan(0);
    expect(PERFORMANCE_DEFAULTS.queryGcTimeMs).toBeGreaterThan(
      PERFORMANCE_DEFAULTS.queryStaleTimeMs,
    );
    expect(PERFORMANCE_DEFAULTS.serverCacheTtlSeconds).toBeGreaterThan(0);
  });
});