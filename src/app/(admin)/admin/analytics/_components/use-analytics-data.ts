"use client";

import * as React from "react";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import type { AnalyticsPeriod } from "./period-selector";

interface UseAnalyticsDataOptions {
  endpoint: string;
  period: AnalyticsPeriod;
  enabled?: boolean;
  refetchInterval?: number | false;
  params?: Record<string, string | number | boolean | undefined>;
}

export function useAnalyticsData<T>({
  endpoint,
  period,
  enabled = true,
  refetchInterval = 5 * 60 * 1000,
  params = {},
}: UseAnalyticsDataOptions) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const lastFetchRef = React.useRef<number>(0);

  const queryKey = React.useMemo(
    () => JSON.stringify({ endpoint, period, params }),
    [endpoint, period, params]
  );

  const refetch = React.useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(endpoint, "http://placeholder");
      url.searchParams.set("period", period);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
      });
      const path = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${url.searchParams.toString()}`;
      const res = await adminFetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as T;
      setData(json);
      lastFetchRef.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed"));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, period, params, enabled]);

  React.useEffect(() => {
    refetch();
  }, [queryKey, refetch]);

  React.useEffect(() => {
    if (!refetchInterval || !enabled) return;
    const id = setInterval(refetch, refetchInterval);
    return () => clearInterval(id);
  }, [refetchInterval, refetch, enabled]);

  return { data, isLoading, error, refetch };
}

export function buildAnalyticsUrl(base: string, period: AnalyticsPeriod, extra: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams();
  params.set("period", period);
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  return `${base}?${params.toString()}`;
}

export { apiRoutes };