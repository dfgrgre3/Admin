"use client";

import * as React from "react";
import { toast } from "sonner";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";
import { useAnalyticsIntegration } from "@/hooks/use-analytics-integration";
import { useWebSocket } from "@/contexts/websocket-context";
import { useDashboardExport } from "@/lib/export-utils";
import { useAdminDashboardQuery } from "@/hooks/dashboard/use-admin-dashboard-query";
import { useDashboardDerivedData } from "@/hooks/dashboard/use-dashboard-derived-data";
import { useDashboardOperations } from "@/hooks/dashboard/use-dashboard-operations";
import { useDashboardSections } from "@/hooks/dashboard/use-dashboard-sections";
import type { UserSegment } from "@/components/admin/broadcast/broadcast-modal";
import type { UserModel } from "@/components/admin/broadcast/types";
import { PERFORMANCE_DEFAULTS } from "@/lib/performance-config";

export function useDashboardData() {
  const { playSound } = usePremiumSounds();
  const { user } = useAuth();
  const { isConnected: wsConnected } = useWebSocket();
  const [timeFilter, setTimeFilter] = React.useState("today");
  const [isBroadcastOpen, setIsBroadcastOpen] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const { trackPageView, trackEvent, startSession } = useAnalyticsIntegration(user?.id);

  const { notifications, markAsRead, dismiss } = useAdminNotifications();

  const {
    filteredUsers: broadcastUsers,
    segments,
    selectedSegment,
    isLoading: usersLoading,
    selectSegment,
    setSearch,
  } = useBroadcastUsers({ enabled: isBroadcastOpen }) as {
    filteredUsers: UserModel[];
    segments: UserSegment[];
    selectedSegment: string | null;
    isLoading: boolean;
    selectSegment: (id: string | null) => void;
    setSearch: (q: string) => void;
  };

  const { dashboard, isLoading, isFetching, isError, errors, refetchAll } = useAdminDashboardQuery(timeFilter);
  const derived = useDashboardDerivedData(dashboard);
  const operations = useDashboardOperations();

  // Track the dashboard view once on mount, mirroring the analytics contract.
  // The session is started lazily by the tracking hook when the first event
  // fires, so we don't force an analytics session just by visiting.
  React.useEffect(() => {
    startSession();
    trackEvent("admin_dashboard_viewed", { path: "/admin", timeFilter: "today" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useDashboardRealtime(
    () => { void refetchAll(); },
    PERFORMANCE_DEFAULTS.dashboardRealtimeDebounceMs,
  );

  // Record the last successful data fetch time for the offline banner.
  React.useEffect(() => {
    if (!isLoading && !isError) {
      setLastUpdated(new Date());
    }
  }, [isLoading, isError]);

  // The server-side export takes an explicit window, so the active time filter
  // is resolved into concrete dates rather than being re-derived on the server.
  const exportDateRange = React.useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    switch (timeFilter) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setHours(0, 0, 0, 0);
        break;
    }
    const iso = (value: Date) => value.toISOString().slice(0, 10);
    return { startDate: iso(start), endDate: iso(end) };
  }, [timeFilter]);

  const { exportDashboard, isExporting, error: exportError } = useDashboardExport(exportDateRange);

  const handleTimeFilterChange = React.useCallback((filter: "today" | "week" | "month" | "year") => {
    playSound("click");
    setTimeFilter(filter);
    trackEvent("admin_dashboard_filter_changed", { filter });
  }, [playSound, trackEvent]);

  const handleExport = React.useCallback(() => {
    playSound("click");
    trackEvent("admin_dashboard_export_requested", { scope: "summary", timeFilter });
    // The export is now produced, authorized and audited by the backend; the
    // browser only downloads the resulting file.
    void exportDashboard("summary").catch(() => {
      toast.error("تعذر تصدير البيانات", {
        description: "حاول مرة أخرى، أو تحقق من صلاحيات التصدير.",
      });
    });
  }, [playSound, exportDashboard, trackEvent, timeFilter]);

  const handleRefresh = React.useCallback(() => {
    playSound("click");
    trackEvent("admin_dashboard_refreshed", { timeFilter });
    void refetchAll();
  }, [playSound, refetchAll, trackEvent, timeFilter]);

  const sections = useDashboardSections({
    derived,
    operations,
    timeFilter,
    playSound,
    notifications,
    markAsRead,
    dismiss,
    wsConnected,
    isError,
    errorCount: errors.length,
    lastUpdated,
    isFetching,
    onTimeFilterChange: handleTimeFilterChange,
    onExport: handleExport,
    onRefresh: handleRefresh,
    onOpenBroadcast: () => setIsBroadcastOpen(true),
  });

  React.useEffect(() => {
    if (!isLoading) {
      const hasPayload = Boolean(
        derived.safeStats.totalUsers
        || derived.safeActivity.tasksCompleted
        || derived.safeRecentActivity.length,
      );
      if (!hasPayload) {
        toast.warning("لا توجد بيانات متاحة حالياً لهذه الفترة الزمنية", {
          description: "حاول اختيار فترة زمنية أخرى أو تحديث الصفحة",
          duration: 5000,
        });
      }
    }
  }, [
    isLoading,
    derived.safeStats.totalUsers,
    derived.safeActivity.tasksCompleted,
    derived.safeRecentActivity.length,
  ]);

  return {
    user,
    wsConnected,
    timeFilter,
    isBroadcastOpen,
    setIsBroadcastOpen,
    lastUpdated,
    notifications,
    broadcastUsers,
    segments,
    selectedSegment,
    usersLoading,
    selectSegment,
    setSearch,
    isLoading,
    isFetching,
    isError,
    errors,
    sections,
    handleExport,
    isExporting,
    exportError,
    handleRefresh,
  };
}
