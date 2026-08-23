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

/**
 * Canonical cache key for the admin dashboard query. Shared with
 * `(admin)/layout.tsx` so the auth guard can warm the cache with exactly the
 * same key/fn while the profile request is still in flight.
 */
export function adminDashboardQueryKey(timeFilter: string) {
  return ["admin-dashboard", timeFilter] as const;
}

/**
 * Raw fetcher for the dashboard payload. Exported so the auth guard can
 * prefetch (warm) the cache before the page even mounts, collapsing the
 * serial auth -> data waterfall into a single parallel round-trip.
 */
export async function fetchAdminDashboard(timeFilter: string): Promise<DashboardViewModel> {
  const response = await adminFetch(`dashboard?time=${encodeURIComponent(timeFilter)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  const json = await response.json();
  const payload = (json.data ?? json) as Record<string, unknown>;
  return mapDashboardPayload(payload);
}

export function useAdminDashboardQuery(timeFilter: string): UseAdminDashboardQueryResult {
  const query = useQuery({
    queryKey: adminDashboardQueryKey(timeFilter),
    queryFn: () => fetchAdminDashboard(timeFilter),
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
