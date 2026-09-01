"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin-api";
import type { TimeRange } from "../../_types/health";

export interface ServiceHealthCurrent {
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  details: string;
  lastCheckedAt: string;
  errorRate: number | null;
}

export interface ServiceHealthHistoryPoint {
  checkedAt: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  errorRate: number | null;
  details: string;
}

export interface ServiceHealthHistoryPayload {
  service: {
    key: string;
    name: string;
    actionUrl: string;
  };
  current: ServiceHealthCurrent | null;
  summary: {
    uptimePercent: number;
    avgLatencyMs: number;
    incidentCount: number;
  };
  history: ServiceHealthHistoryPoint[];
}

/** The API envelope wraps every payload in `{ success, data }`. */
function unwrap<T>(response: unknown): T {
  const body = response as { data?: T } | null;
  return (body?.data ?? response) as T;
}

export function useServiceHealthHistory(
  serviceKey: string,
  timeRange: TimeRange,
  autoRefresh: boolean
) {
  return useQuery<ServiceHealthHistoryPayload>({
    queryKey: ["admin", "health", "service", serviceKey, timeRange],
    enabled: Boolean(serviceKey),
    queryFn: async () => {
      const response = await adminApi.get<unknown>(
        `dashboard/system-health/${encodeURIComponent(serviceKey)}/history`,
        { range: timeRange }
      );
      return unwrap<ServiceHealthHistoryPayload>(response);
    },
    refetchInterval: autoRefresh ? 30000 : false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
    retry: 1,
  });
}
