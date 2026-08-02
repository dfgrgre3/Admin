"use client";

import * as React from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { DashboardSkeleton } from "@/components/admin/ui/loading-skeleton";
import { DraggableDashboard } from "@/components/admin/dashboard/draggable-dashboard";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";
import { useWebSocket } from "@/contexts/websocket-context";
import { buildComprehensiveStats } from "@/lib/dashboard-data";
import { generateSmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import { useDashboardExport } from "@/lib/export-utils";
import { useAdminDashboardWidgets, mergeDashboardWidgetPayloads } from "@/hooks/use-admin-dashboard-widgets";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  buildHeatmapData,
  buildDistributionData,
  formatUserGrowthData,
  buildDefaultGoals,
  normalizeRecentActivity,
  normalizeUpcomingEvents,
  type DashboardGoal,
} from "@/lib/dashboard-utils";
import type { UserSegment } from "@/components/admin/broadcast/broadcast-modal";
import type { UserModel } from "@/components/admin/broadcast/types";
import { RefreshCw } from "lucide-react";

// Code-split section components
import { StatsSection } from "@/components/admin/dashboard/sections/stats-section";
import { QuickActionsSection } from "@/components/admin/dashboard/sections/quick-actions-section";
import { IntelligenceSection } from "@/components/admin/dashboard/sections/intelligence-section";
import { SystemDiagnosticsSection } from "@/components/admin/dashboard/sections/system-diagnostics-section";
import { ActivityDistributionSection } from "@/components/admin/dashboard/sections/activity-distribution-section";
import { RealtimeNotificationsSection } from "@/components/admin/dashboard/sections/realtime-notifications-section";

// Code-split the BroadcastModal (heavy dialog + user list)
const BroadcastModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});

interface DashboardData {
  stats: {
    totalUsers: number;
    totalSubjects: number;
    totalExams: number;
    totalResources: number;
    activeChallenges: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    // Extended stats (optional — provided by newer backend versions)
    activeStudents?: number;
    totalTeachers?: number;
    publishedCourses?: number;
    reviewCourses?: number;
    draftCourses?: number;
    dailyRevenue?: number;
    monthlyRevenue?: number;
    newSubscriptions?: number;
    cancelledSubscriptions?: number;
    pendingOrders?: number;
    openTickets?: number;
    moderationQueue?: number;
    pendingApprovals?: number;
    completionRate?: number;
  };
  trends: {
    userGrowth: number;
    studyTime: number;
  };
  charts: {
    userGrowth: Array<{ month: string; users: number }>;
    activity: Array<{ day: string; sessions: number }>;
  };
  activity: {
    tasksCompleted: number;
    examsTaken: number;
    achievementsEarned: number;
    studyMinutes: number;
  };
  recentActivity: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
    user?: {
      name: string;
      avatar: string;
    };
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: "exam" | "challenge" | "announcement";
  }>;
  // Optional extended payload sections
  goals?: DashboardGoal[];
  topSellingCourses?: Array<{ id: string; title: string; sales: number; revenue: number }>;
  criticalKPIs?: Array<{ name: string; value: number; target: number; unit: string }>;
  systemAlerts?: Array<{ id: string; type: string; message: string; severity: string; createdAt: string }>;
}

export default function AdminDashboardPage() {
  const { playSound } = usePremiumSounds();
  const { user } = useAuth();
  const { isConnected: wsConnected } = useWebSocket();
  const [timeFilter, setTimeFilter] = React.useState("today");
  const [isBroadcastOpen, setIsBroadcastOpen] = React.useState(false);

  // Real-time notifications
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useAdminNotifications();

  // Broadcast users
  const {
    filteredUsers: broadcastUsers,
    segments,
    selectedSegment,
    isLoading: usersLoading,
    selectSegment,
    setSearch,
  } = useBroadcastUsers() as {
    filteredUsers: UserModel[];
    segments: UserSegment[];
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

  // Debounced WebSocket refetch (replaces immediate refetch on every message)
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
    }
  }), [handleRefresh]);

  // ── Derived data (all hooks before early return) ────────────────────────

  const safeStats = React.useMemo(() => {
    const baseStats = aggregatedData.stats ?? {};
    return {
      totalUsers: Number(baseStats.totalUsers ?? 0),
      totalSubjects: Number(baseStats.totalSubjects ?? 0),
      totalExams: Number(baseStats.totalExams ?? 0),
      totalResources: Number(baseStats.totalResources ?? 0),
      activeChallenges: Number(baseStats.activeChallenges ?? 0),
      newUsersToday: Number(baseStats.newUsersToday ?? 0),
      newUsersThisWeek: Number(baseStats.newUsersThisWeek ?? 0),
    };
  }, [aggregatedData.stats]);
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
  const safeRecentActivity = React.useMemo(
    () => normalizeRecentActivity(aggregatedData.recentActivity as DashboardData["recentActivity"]),
    [aggregatedData.recentActivity],
  );
  const safeUpcomingEvents = React.useMemo(
    () => normalizeUpcomingEvents(aggregatedData.upcomingEvents as DashboardData["upcomingEvents"]),
    [aggregatedData.upcomingEvents],
  );

  const safeCharts = React.useMemo(() => ({
    userGrowth: formatUserGrowthData((aggregatedData.charts as DashboardData["charts"])?.userGrowth),
    activity: (aggregatedData.charts as DashboardData["charts"])?.activity ?? [],
  }), [aggregatedData.charts]);

  const safeGoals = React.useMemo<DashboardGoal[]>(() => {
    const goals = aggregatedData.goals as unknown as DashboardGoal[] | undefined;
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
      }
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

  const distributionData = React.useMemo(
    () => buildDistributionData(safeStats),
    [safeStats],
  );

  const heatmapData = React.useMemo(
    () => buildHeatmapData(safeCharts.activity),
    [safeCharts.activity],
  );

  const comprehensiveStats = React.useMemo(
    () => buildComprehensiveStats({
      stats: {
        ...safeStats,
        activeStudents: Number((aggregatedData.stats as DashboardData["stats"] & { activeStudents?: number } | undefined)?.activeStudents ?? safeStats.totalUsers),
        totalTeachers: Number((aggregatedData.stats as DashboardData["stats"] & { totalTeachers?: number } | undefined)?.totalTeachers ?? 0),
        publishedCourses: Number((aggregatedData.stats as DashboardData["stats"] & { publishedCourses?: number } | undefined)?.publishedCourses ?? safeStats.totalSubjects),
        reviewCourses: Number((aggregatedData.stats as DashboardData["stats"] & { reviewCourses?: number } | undefined)?.reviewCourses ?? 0),
        draftCourses: Number((aggregatedData.stats as DashboardData["stats"] & { draftCourses?: number } | undefined)?.draftCourses ?? 0),
        dailyRevenue: Number((aggregatedData.stats as DashboardData["stats"] & { dailyRevenue?: number } | undefined)?.dailyRevenue ?? 0),
        monthlyRevenue: Number((aggregatedData.stats as DashboardData["stats"] & { monthlyRevenue?: number } | undefined)?.monthlyRevenue ?? 0),
        newSubscriptions: Number((aggregatedData.stats as DashboardData["stats"] & { newSubscriptions?: number } | undefined)?.newSubscriptions ?? 0),
        cancelledSubscriptions: Number((aggregatedData.stats as DashboardData["stats"] & { cancelledSubscriptions?: number } | undefined)?.cancelledSubscriptions ?? 0),
        pendingOrders: Number((aggregatedData.stats as DashboardData["stats"] & { pendingOrders?: number } | undefined)?.pendingOrders ?? 0),
        openTickets: Number((aggregatedData.stats as DashboardData["stats"] & { openTickets?: number } | undefined)?.openTickets ?? 0),
        moderationQueue: Number((aggregatedData.stats as DashboardData["stats"] & { moderationQueue?: number } | undefined)?.moderationQueue ?? 0),
        pendingApprovals: Number((aggregatedData.stats as DashboardData["stats"] & { pendingApprovals?: number } | undefined)?.pendingApprovals ?? 0),
        completionRate: Number((aggregatedData.stats as DashboardData["stats"] & { completionRate?: number } | undefined)?.completionRate ?? 0),
      },
      activity: safeActivity,
      topSellingCourses: aggregatedData.topSellingCourses as DashboardData["topSellingCourses"],
      criticalKPIs: aggregatedData.criticalKPIs as DashboardData["criticalKPIs"],
      systemAlerts: aggregatedData.systemAlerts as DashboardData["systemAlerts"],
    }),
    [safeStats, safeActivity, aggregatedData],
  );

  // ── Sections array (now references memoized section components) ──────────
  const sections = React.useMemo(() => [
    {
      id: "main-stats",
      content: (
        <StatsSection
          comprehensiveStats={comprehensiveStats}
          activity={safeActivity}
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          onExport={handleExport}
        />
      )
    },
    {
      id: "quick-actions",
      content: <QuickActionsSection playSound={playSound} />
    },
    {
      id: "realtime-notifications",
      content: (
        <div id="realtime-notifications-section" className="w-full">
          <RealtimeNotificationsSection
            notifications={notifications}
            unreadCount={notifications.filter((item) => !item.read).length}
            onMarkAsRead={markAsRead}
            onDismiss={dismiss}
          />
        </div>
      )
    },
    {
      id: "command-center",
      content: <div className="rounded-[2rem] border border-primary/20 bg-white/5 p-8 text-center text-gray-400">تم دمج مركز الأوامر الذكي ضمن القسم الذكي الرئيسي.</div>
    },
    {
      id: "intelligence",
      content: (
        <IntelligenceSection
          userGrowthData={safeCharts.userGrowth}
          activityData={safeCharts.activity}
          recentActivity={safeRecentActivity}
          upcomingEvents={safeUpcomingEvents}
          goals={safeGoals}
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          onRefresh={handleRefresh}
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
          isFetching={isFetching}
          playSound={playSound}
        />
      )
    },
    {
      id: "system-diagnostics",
      content: <SystemDiagnosticsSection alerts={alertData} />
    },
    {
      id: "activity-and-distribution",
      content: (
        <ActivityDistributionSection
          heatmapData={heatmapData}
          distributionData={distributionData}
        />
      )
    }
  ], [
    comprehensiveStats,
    safeActivity,
    timeFilter,
    handleTimeFilterChange,
    handleExport,
    playSound,
    notifications,
    markAsRead,
    dismiss,
    agentDashboardContext,
    pageControls,
    safeCharts,
    safeRecentActivity,
    safeUpcomingEvents,
    safeGoals,
    handleRefresh,
    isFetching,
    alertData,
    heatmapData,
    distributionData,
  ]);

  // ── Show toast when no data ─────────────────────────────────────────────
  React.useEffect(() => {
    if (!isLoading) {
      const hasPayload = Boolean(safeStats.totalUsers || safeActivity.tasksCompleted || safeRecentActivity.length);
      if (!hasPayload) {
        toast.warning("لا توجد بيانات متاحة حالياً لهذه الفترة الزمنية", {
          description: "حاول اختيار فترة زمنية أخرى أو تحديث الصفحة",
          duration: 5000,
        });
      }
    }
  }, [isLoading, safeStats.totalUsers, safeActivity.tasksCompleted, safeRecentActivity.length]);

  // ── Early returns (after all hooks) ─────────────────────────────────────
  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-12 pb-20" dir="rtl">
      <PermissionGuard permission={PERMISSIONS.DASHBOARD_VIEW} fallback={
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-10 text-center text-red-200">
          لا تملك صلاحية عرض لوحة التحكم.
        </div>
      }>
        <header className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight">لوحة التحكم الإدارية</h1>
            <p className="text-gray-400 font-medium">مرحباً بك، {user?.name || "المسؤول"}. إليك نظرة شاملة على مستجدات المنصة التعليمية.</p>
          </div>
          <div className="flex items-center gap-4">
            <AdminButton
              variant="outline"
              size="lg"
              onClick={handleRefresh}
              loading={isFetching}
              icon={RefreshCw}
              className="h-14 px-8 rounded-2xl"
            >
              تحديث البيانات
            </AdminButton>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
              آخر تحديث: {isFetching ? "جاري التحديث..." : "محدث"}
            </div>
          </div>
        </header>

        {isError && (
          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            تعذر تحميل بعض widgets. يتم عرض البيانات المتاحة حالياً، ويمكنك إعادة المحاولة لاحقاً.
          </div>
        )}

        <DraggableDashboard onOrderChange={() => {}}>{sections}</DraggableDashboard>
      </PermissionGuard>

      <BroadcastModal
        open={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
        users={broadcastUsers}
        segments={segments}
        selectedSegment={selectedSegment}
        onSelectSegment={selectSegment}
        onSearch={setSearch}
        isLoading={usersLoading}
      />
    </div>
  );
}

