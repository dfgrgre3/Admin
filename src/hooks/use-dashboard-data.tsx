"use client";

import * as React from "react";
import { toast } from "sonner";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";
import { useWebSocket } from "@/contexts/websocket-context";
import { useDashboardExport } from "@/lib/export-utils";
import { useAdminDashboardQuery } from "@/hooks/dashboard/use-admin-dashboard-query";
import { useDashboardDerivedData } from "@/hooks/dashboard/use-dashboard-derived-data";
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

  const prevFetching = React.useRef(false);
  React.useEffect(() => {
    if (prevFetching.current && !isFetching && !isLoading) {
      setLastUpdated(new Date());
    }
    prevFetching.current = isFetching;
  }, [isFetching, isLoading]);

  useDashboardRealtime(
    () => { void refetchAll(); },
    PERFORMANCE_DEFAULTS.dashboardRealtimeDebounceMs,
  );

  const { exportDashboardData } = useDashboardExport(derived.safeStats);

  const handleTimeFilterChange = React.useCallback((filter: "today" | "week" | "month" | "year") => {
    playSound("click");
    setTimeFilter(filter);
  }, [playSound]);

  const handleExport = React.useCallback(() => {
    playSound("click");
    exportDashboardData();
  }, [playSound, exportDashboardData]);

  const handleRefresh = React.useCallback(() => {
    playSound("click");
    void refetchAll();
  }, [playSound, refetchAll]);

  const sections = useDashboardSections({
    derived,
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
    handleRefresh,
  };
}
