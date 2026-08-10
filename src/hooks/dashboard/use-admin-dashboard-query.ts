"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { mapDashboardPayload, type DashboardViewModel } from "@/lib/dashboard-payload-mapper";
import { PERFORMANCE_DEFAULTS } from "@/lib/performance-config";

interface UseAdminDashboardQueryResult {
  dashboard: DashboardViewModel | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errors: unknown[];
  refetchAll: () => Promise<unknown>;
}

export function useAdminDashboardQuery(timeFilter: string): UseAdminDashboardQueryResult {
  const query = useQuery({
    queryKey: ["admin-dashboard", timeFilter],
    queryFn: async () => {
      const response = await adminFetch(`dashboard?time=${encodeURIComponent(timeFilter)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const json = await response.json();
      const payload = (json.data ?? json) as Record<string, unknown>;
      return mapDashboardPayload(payload);
    },
    staleTime: PERFORMANCE_DEFAULTS.queryStaleTimeMs,
    gcTime: PERFORMANCE_DEFAULTS.queryGcTimeMs,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errors: query.isError ? [query.error] : [],
    refetchAll: query.refetch,
  };
}
