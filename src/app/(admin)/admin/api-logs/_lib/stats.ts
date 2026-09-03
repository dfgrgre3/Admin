// ─── Statistics Computation ──────────────────────────────────

import type {
  ApiLogEntry,
  ApiLogsStats,
  HttpMethod,
  HttpStatus,
  ApiCategory,
  Severity,
} from "./constants";
import { HTTP_METHODS, HTTP_STATUS_GROUPS, API_CATEGORIES, SEVERITIES } from "./constants";

function emptyCounters() {
  return {
    byStatus: Object.fromEntries(HTTP_STATUS_GROUPS.map((s) => [s, 0 as number])) as Record<HttpStatus, number>,
    byMethod: Object.fromEntries(HTTP_METHODS.map((m) => [m, 0 as number])) as Record<HttpMethod, number>,
    byCategory: Object.fromEntries(API_CATEGORIES.map((c) => [c, 0 as number])) as Record<ApiCategory, number>,
    bySeverity: Object.fromEntries(SEVERITIES.map((s) => [s, 0 as number])) as Record<Severity, number>,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export const formatHourLabel = (h: number): string => `${String(h).padStart(2, "0")}:00`;

export function computeStats(logs: ApiLogEntry[]): ApiLogsStats {
  const total = logs.length;
  const counters = emptyCounters();
  let totalResponseMs = 0;
  let totalBandwidth = 0;
  let successCount = 0;
  let rateLimitedCount = 0;
  const users = new Set<string>();
  const endpoints = new Set<string>();
  const responseTimes: number[] = [];
  const endpointMap = new Map<string, { calls: number; errors: number; totalMs: number }>();
  const hourMap = new Map<string, { calls: number; errors: number; totalMs: number }>();
  const keyMap = new Map<string, { id: string; name: string; calls: number }>();

  for (const log of logs) {
    counters.byStatus[log.statusGroup]++;
    counters.byMethod[log.method]++;
    counters.byCategory[log.category]++;
    counters.bySeverity[log.severity]++;

    totalResponseMs += log.responseTimeMs;
    totalBandwidth += log.requestSize + log.responseSize;

    if (log.statusGroup === "2xx") successCount++;
    if (log.rateLimited) rateLimitedCount++;
    users.add(log.userId);
    endpoints.add(log.endpoint);

    responseTimes.push(log.responseTimeMs);

    const ep = endpointMap.get(log.endpoint) || { calls: 0, errors: 0, totalMs: 0 };
    ep.calls++;
    ep.totalMs += log.responseTimeMs;
    if (log.statusGroup === "4xx" || log.statusGroup === "5xx") ep.errors++;
    endpointMap.set(log.endpoint, ep);

    const d = new Date(log.timestamp);
    const hourKey = formatHourLabel(d.getHours());
    const hr = hourMap.get(hourKey) || { calls: 0, errors: 0, totalMs: 0 };
    hr.calls++;
    hr.totalMs += log.responseTimeMs;
    if (log.statusGroup === "4xx" || log.statusGroup === "5xx") hr.errors++;
    hourMap.set(hourKey, hr);

    if (log.apiKeyId) {
      const key = keyMap.get(log.apiKeyId) || { id: log.apiKeyId, name: log.apiKeyName || log.apiKeyId, calls: 0 };
      key.calls++;
      keyMap.set(log.apiKeyId, key);
    }
  }

  responseTimes.sort((a, b) => a - b);
  const avgResponseTimeMs = total === 0 ? 0 : Math.round(totalResponseMs / total);

  const byEndpoint = Array.from(endpointMap.entries())
    .map(([endpoint, v]) => ({
      endpoint,
      calls: v.calls,
      avgMs: Math.round(v.totalMs / v.calls),
      errors: v.errors,
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);

  const byHour = Array.from(hourMap.entries())
    .map(([hour, v]) => ({ hour, calls: v.calls, errors: v.errors, avgMs: Math.round(v.totalMs / Math.max(1, v.calls)) }))
    .sort((a, b) => parseInt(a.hour.split(":")[0] ?? "0", 10) - parseInt(b.hour.split(":")[0] ?? "0", 10));

  const slowest = [...logs]
    .filter((l) => l.statusGroup === "5xx" || l.responseTimeMs > 1500)
    .sort((a, b) => b.responseTimeMs - a.responseTimeMs)
    .slice(0, 5);

  const mostActiveKeys = Array.from(keyMap.values()).sort((a, b) => b.calls - a.calls).slice(0, 5);

  return {
    total,
    successRate: total === 0 ? 0 : (successCount / total) * 100,
    errorRate: total === 0 ? 0 : ((counters.byStatus["4xx"] + counters.byStatus["5xx"]) / total) * 100,
    avgResponseTimeMs,
    p95ResponseTimeMs: percentile(responseTimes, 95),
    p99ResponseTimeMs: percentile(responseTimes, 99),
    totalBandwidth,
    rateLimitedCount,
    uniqueEndpoints: endpoints.size,
    uniqueUsers: users.size,
    ...counters,
    byEndpoint,
    byHour,
    slowest,
    mostActiveKeys,
  };
}