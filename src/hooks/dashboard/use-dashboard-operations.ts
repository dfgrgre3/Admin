"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin-api";
import { PERFORMANCE_DEFAULTS } from "@/lib/performance-config";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";

/**
 * Wires the granular `/api/admin/dashboard/*` endpoints that the aggregate
 * payload does not cover: operational alerts, the pending-decision queue and
 * live service health.
 *
 * Each concern is a separate query so one failing widget cannot blank the
 * others, and each is only issued when the caller actually holds the matching
 * permission — the backend enforces the same gate and answers 403 otherwise.
 */

export interface DashboardAlert {
  id: string;
  severity: "critical" | "error" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  source: string;
  occurrenceCount: number;
  state: "open" | "acknowledged" | "resolved";
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface DashboardPendingAction {
  id: string;
  type: string;
  title: string;
  entityType: string;
  entityId: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  dueAt: string | null;
  assignedTo: string | null;
  requestedBy: string;
  serviceLevelStatus: string;
  actionUrl: string;
  requiredPermission: string;
}

export interface DashboardServiceHealth {
  serviceKey: string;
  serviceName: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  lastCheckedAt: string;
  details: string;
  actionUrl: string;
  /** Null for probes with no measured error rate. */
  errorRate: number | null;
}

interface DashboardListEnvelope<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface SystemHealthPayload {
  overallStatus: "healthy" | "degraded" | "unhealthy";
  checkedAt: string;
  services: DashboardServiceHealth[];
}

/** The API envelope wraps every payload in `{ success, data }`. */
function unwrap<T>(response: unknown): T {
  const body = response as { data?: T } | null;
  return (body?.data ?? response) as T;
}

const PENDING_PAGE_SIZE = 10;
const ALERTS_PAGE_SIZE = 10;

export function useDashboardOperations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const can = (permission: Permission) =>
    user ? hasPermission(user as Parameters<typeof hasPermission>[0], permission) : false;

  const canViewAlerts = can(PERMISSIONS.DASHBOARD_VIEW_ALERTS);
  const canViewPending = can(PERMISSIONS.DASHBOARD_VIEW_PENDING_ITEMS);
  const canViewHealth = can(PERMISSIONS.DASHBOARD_VIEW_SYSTEM_HEALTH);
  const canAcknowledgeAlerts = can(PERMISSIONS.DASHBOARD_ACKNOWLEDGE_ALERTS);

  const alertsQuery = useQuery({
    queryKey: ["admin-dashboard", "alerts"],
    enabled: canViewAlerts,
    queryFn: async () => {
      const response = await adminApi.get<unknown>("dashboard/alerts", {
        state: "open",
        pageSize: ALERTS_PAGE_SIZE,
        sortBy: "lastSeenAt",
      });
      return unwrap<DashboardListEnvelope<DashboardAlert>>(response);
    },
    staleTime: PERFORMANCE_DEFAULTS.queryStaleTimeMs,
    gcTime: PERFORMANCE_DEFAULTS.queryGcTimeMs,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const pendingQuery = useQuery({
    queryKey: ["admin-dashboard", "pending-actions"],
    enabled: canViewPending,
    queryFn: async () => {
      const response = await adminApi.get<unknown>("dashboard/pending-actions", {
        pageSize: PENDING_PAGE_SIZE,
        sortBy: "priority",
        sortDirection: "desc",
      });
      return unwrap<DashboardListEnvelope<DashboardPendingAction>>(response);
    },
    staleTime: PERFORMANCE_DEFAULTS.queryStaleTimeMs,
    gcTime: PERFORMANCE_DEFAULTS.queryGcTimeMs,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const healthQuery = useQuery({
    queryKey: ["admin-dashboard", "system-health"],
    enabled: canViewHealth,
    queryFn: async () => {
      const response = await adminApi.get<unknown>("dashboard/system-health");
      return unwrap<SystemHealthPayload>(response);
    },
    // Health is the one slice that genuinely goes stale on its own, so it is
    // the only query here that polls. Everything else refreshes on demand or
    // via the existing WebSocket trigger.
    staleTime: PERFORMANCE_DEFAULTS.healthStaleTimeMs,
    refetchInterval: PERFORMANCE_DEFAULTS.healthRefetchIntervalMs,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, note }: { alertId: string; note?: string }) => {
      return adminApi.post(`dashboard/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
        note: note ?? "",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard", "alerts"] });
    },
  });

  return {
    alerts: alertsQuery.data?.items ?? [],
    alertsTotal: alertsQuery.data?.totalCount ?? 0,
    alertsLoading: alertsQuery.isLoading,
    alertsError: alertsQuery.isError,

    pendingActions: pendingQuery.data?.items ?? [],
    pendingTotal: pendingQuery.data?.totalCount ?? 0,
    pendingLoading: pendingQuery.isLoading,
    pendingError: pendingQuery.isError,

    services: healthQuery.data?.services ?? [],
    overallStatus: healthQuery.data?.overallStatus ?? null,
    healthCheckedAt: healthQuery.data?.checkedAt ?? null,
    healthLoading: healthQuery.isLoading,
    healthError: healthQuery.isError,

    canViewAlerts,
    canViewPending,
    canViewHealth,
    canAcknowledgeAlerts,

    acknowledgeAlert: acknowledgeAlert.mutate,
    isAcknowledging: acknowledgeAlert.isPending,

    refetchOperations: async () => {
      await Promise.allSettled([
        canViewAlerts ? alertsQuery.refetch() : Promise.resolve(),
        canViewPending ? pendingQuery.refetch() : Promise.resolve(),
        canViewHealth ? healthQuery.refetch() : Promise.resolve(),
      ]);
    },
  };
}
