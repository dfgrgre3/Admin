"use client";

import * as React from "react";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";
import { useWebSocket } from "@/contexts/websocket-context";
import { useAdminDashboardWidgets, mergeDashboardWidgetPayloads } from "@/hooks/use-admin-dashboard-widgets";
import { buildComprehensiveStats } from "@/lib/dashboard-data";
import { generateSmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import { useDashboardExport } from "@/lib/export-utils";
import {
  buildHeatmapData,
  buildDistributionData,
  formatUserGrowthData,
  buildDefaultGoals,
  normalizeRecentActivity,
  normalizeUpcomingEvents,
  type DashboardGoal,
} from "@/lib/dashboard-utils";
import type { DashboardData, DashboardStatsData } from "@/components/admin/dashboard/dashboard.types";

export function useDashboardData() {
  const { playSound } = usePremiumSounds();
  const { user } = useAuth();
  const { isConnected: wsConnected } = useWebSocket();
  const [timeFilter, setTimeFilter] = React.useState<"today" | "week" | "month" | "year">("today");
  const [isBroadcastOpen, setIsBroadcastOpen] = React.useState(false);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useAdminNotifications();

  const {
    filteredUsers: broadcastUsers,
    segments,
    selectedSegment,
    isLoading: usersLoading,
    selectSegment,
    setSearch,
  } = useBroadcastUsers() as {
    filteredUsers: Array<{ id: string; name: string }>;
    segments: Array<{ id: string; name: string }>;
    selectedSegment: string | null;
    isLoading: boolean;
    selectSegment: (id: string | null) => void;
    setSearch: (q: string) => void;
  };

  const { overview, stats, intelligence, systems, activity, isLoading, isFetching, isError, errors, refetchAll } = useAdminDashboardWidgets(timeFilter);

  const aggregatedData = React.useMemo(() => {
    const widgetData = {
      overview: overview.data as Record<string, unknown> | undefined,
      stats: stats.data as Record<string, unknown> | undefined,
      intelligence: intelligence.data as Record<string, unknown> | undefined,
      systems: systems.data as Record<string, unknown> | undefined,
      activity: activity.data as Record<string, unknown> | undefined,
    };

    return mergeDashboardWidgetPayloads(widgetData);
  }, [overview.data, stats.data, intelligence.data, systems.data, activity.data]);

  useDashboardRealtime(() => { void refetchAll(); }, 2000);

  const { exportDashboardData } = useDashboardExport(aggregatedData.stats || {});

  const handleRefresh = React.useCallback(() => {
    playSound("click");
    void refetchAll();
  }, [playSound, refetchAll]);

  const handleTimeFilterChange = React.useCallback((filter: "today" | "week" | "month" | "year") => {
    playSound("click");
    setTimeFilter(filter);
  }, [playSound]);

  const handleExport = React.useCallback(() => {
    playSound("click");
    exportDashboardData();
  }, [playSound, exportDashboardData]);

  const pageControls = React.useMemo(() => ({
    refreshDashboard: handleRefresh,
    openBroadcast: () => setIsBroadcastOpen(true),
    setTimeFilter: (filter: "today" | "week" | "month" | "year") => setTimeFilter(filter),
    scrollToSection: (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-4", "ring-primary/50", "scale-[1.01]", "transition-all", "duration-500");
        setTimeout(() => {
          element.classList.remove("ring-4", "ring-primary/50", "scale-[1.01]");
        }, 3000);
      }
    },
  }), [handleRefresh]);

  const safeStats = React.useMemo<DashboardStatsData>(() => ({
    totalUsers: Number(aggregatedData.stats?.totalUsers ?? 0),
    totalSubjects: Number(aggregatedData.stats?.totalSubjects ?? 0),
    totalExams: Number(aggregatedData.stats?.totalExams ?? 0),
    totalResources: Number(aggregatedData.stats?.totalResources ?? 0),
    activeChallenges: Number(aggregatedData.stats?.activeChallenges ?? 0),
    newUsersToday: Number(aggregatedData.stats?.newUsersToday ?? 0),
    newUsersThisWeek: Number(aggregatedData.stats?.newUsersThisWeek ?? 0),
    activeStudents: Number(aggregatedData.stats?.activeStudents ?? aggregatedData.stats?.totalUsers ?? 0),
    totalTeachers: Number(aggregatedData.stats?.totalTeachers ?? 0),
    publishedCourses: Number(aggregatedData.stats?.publishedCourses ?? aggregatedData.stats?.totalSubjects ?? 0),
    reviewCourses: Number(aggregatedData.stats?.reviewCourses ?? 0),
    draftCourses: Number(aggregatedData.stats?.draftCourses ?? 0),
    dailyRevenue: Number(aggregatedData.stats?.dailyRevenue ?? 0),
    monthlyRevenue: Number(aggregatedData.stats?.monthlyRevenue ?? 0),
    newSubscriptions: Number(aggregatedData.stats?.newSubscriptions ?? 0),
    cancelledSubscriptions: Number(aggregatedData.stats?.cancelledSubscriptions ?? 0),
    pendingOrders: Number(aggregatedData.stats?.pendingOrders ?? 0),
    openTickets: Number(aggregatedData.stats?.openTickets ?? 0),
    moderationQueue: Number(aggregatedData.stats?.moderationQueue ?? 0),
    pendingApprovals: Number(aggregatedData.stats?.pendingApprovals ?? 0),
    completionRate: Number(aggregatedData.stats?.completionRate ?? 0),
  }), [aggregatedData.stats]);

  const safeTrends = React.useMemo(() => ({
    userGrowth: Number((aggregatedData.trends as { userGrowth?: number } | undefined)?.userGrowth ?? 0),
    studyTime: Number((aggregatedData.trends as { studyTime?: number } | undefined)?.studyTime ?? 0),
  }), [aggregatedData.trends]);

  const safeActivity = React.useMemo(() => ({
    tasksCompleted: Number((aggregatedData.activity as { tasksCompleted?: number } | undefined)?.tasksCompleted ?? 0),
    examsTaken: Number((aggregatedData.activity as { examsTaken?: number } | undefined)?.examsTaken ?? 0),
    achievementsEarned: Number((aggregatedData.activity as { achievementsEarned?: number } | undefined)?.achievementsEarned ?? 0),
    studyMinutes: Number((aggregatedData.activity as { studyMinutes?: number } | undefined)?.studyMinutes ?? 0),
  }), [aggregatedData.activity]);

  const safeRecentActivity = React.useMemo(() => normalizeRecentActivity(aggregatedData.recentActivity as DashboardData["recentActivity"]), [aggregatedData.recentActivity]);
  const safeUpcomingEvents = React.useMemo(() => normalizeUpcomingEvents(aggregatedData.upcomingEvents as DashboardData["upcomingEvents"]), [aggregatedData.upcomingEvents]);
  const safeCharts = React.useMemo(() => ({
    userGrowth: formatUserGrowthData((aggregatedData.charts as DashboardData["charts"])?.userGrowth),
    activity: (aggregatedData.charts as DashboardData["charts"])?.activity ?? [],
  }), [aggregatedData.charts]);

  const safeGoals = React.useMemo<DashboardGoal[]>(() => {
    const goals = aggregatedData.goals as DashboardGoal[] | undefined;
    if (Array.isArray(goals) && goals.length > 0) {
      return goals;
    }
    return buildDefaultGoals(safeStats, safeActivity);
  }, [aggregatedData.goals, safeStats, safeActivity]);

  const alertData = React.useMemo(() => {
    if (!aggregatedData.stats && !aggregatedData.activity) return [];
    return generateSmartAlerts({
      users: {
        total: safeStats.totalUsers,
        new: safeStats.newUsersToday,
        active: safeStats.newUsersThisWeek,
      },
      content: {
        subjects: safeStats.totalSubjects,
        exams: safeStats.totalExams,
        resources: safeStats.totalResources,
      },
      activity: {
        studySessions: safeActivity.studyMinutes > 0 ? Math.round(safeActivity.studyMinutes / 45) : 0,
        tasksCompleted: safeActivity.tasksCompleted,
      },
      trends: {
        userGrowth: safeTrends.userGrowth,
        studyTime: safeTrends.studyTime,
      },
    });
  }, [aggregatedData.stats, aggregatedData.activity, safeStats, safeActivity, safeTrends]);

  const agentDashboardContext = React.useMemo(() => ({
    stats: safeStats,
    trends: safeTrends,
    activity: safeActivity,
    alerts: alertData,
    recentActivity: safeRecentActivity.slice(0, 8),
    upcomingEvents: safeUpcomingEvents.slice(0, 8),
    timeFilter,
    realtime: { connected: wsConnected },
  }), [safeStats, safeTrends, safeActivity, alertData, safeRecentActivity, safeUpcomingEvents, timeFilter, wsConnected]);

  const distributionData = React.useMemo(() => buildDistributionData(safeStats), [safeStats]);
  const heatmapData = React.useMemo(() => buildHeatmapData(safeCharts.activity), [safeCharts.activity]);

  const comprehensiveStats = React.useMemo(() => buildComprehensiveStats({
    stats: safeStats,
    activity: safeActivity,
    topSellingCourses: aggregatedData.topSellingCourses as DashboardData["topSellingCourses"],
    criticalKPIs: aggregatedData.criticalKPIs as DashboardData["criticalKPIs"],
    systemAlerts: aggregatedData.systemAlerts as DashboardData["systemAlerts"],
  }), [safeStats, safeActivity, aggregatedData.topSellingCourses, aggregatedData.criticalKPIs, aggregatedData.systemAlerts]);

  return {
    user,
    timeFilter,
    setTimeFilter,
    isBroadcastOpen,
    setIsBroadcastOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    dismiss,
    broadcastUsers,
    segments,
    selectedSegment,
    usersLoading,
    selectSegment,
    setSearch,
    aggregatedData,
    isLoading,
    isFetching,
    isError,
    errors,
    refetchAll,
    handleRefresh,
    handleTimeFilterChange,
    handleExport,
    pageControls,
    safeStats,
    safeTrends,
    safeActivity,
    safeRecentActivity,
    safeUpcomingEvents,
    safeCharts,
    safeGoals,
    alertData,
    agentDashboardContext,
    distributionData,
    heatmapData,
    comprehensiveStats,
    wsConnected,
  };
}
