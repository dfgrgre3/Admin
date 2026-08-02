"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { DashboardSkeleton } from "@/components/admin/ui/loading-skeleton";
import { DraggableDashboard } from "@/components/admin/dashboard/draggable-dashboard";
import { RealtimeNotifications } from "@/components/admin/dashboard/realtime-notifications";
import { AiCommandCenter } from "@/components/admin/dashboard/ai-command-center";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import { useDashboardRealtime } from "@/hooks/use-dashboard-realtime";
import { useWebSocket } from "@/contexts/websocket-context";
import { adminFetch } from "@/lib/api/admin-api";
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
import type { UserSegment } from "@/components/admin/broadcast/broadcast-modal";
import type { UserModel } from "@/components/admin/broadcast/types";
import { RefreshCw } from "lucide-react";

// Code-split section components
import { StatsSection } from "@/components/admin/dashboard/sections/stats-section";
import { QuickActionsSection } from "@/components/admin/dashboard/sections/quick-actions-section";
import { IntelligenceSection } from "@/components/admin/dashboard/sections/intelligence-section";
import { SystemDiagnosticsSection } from "@/components/admin/dashboard/sections/system-diagnostics-section";
import { ActivityDistributionSection } from "@/components/admin/dashboard/sections/activity-distribution-section";

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

  const { data, isLoading, refetch, isFetching } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard", timeFilter],
    queryFn: async () => {
      const response = await adminFetch(`dashboard?time=${timeFilter}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - increased from 2 for better caching
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Debounced WebSocket refetch (replaces immediate refetch on every message)
  useDashboardRealtime(refetch, 2000);

  const { exportDashboardData } = useDashboardExport(data?.stats || {});

  const handleRefresh = React.useCallback(() => {
    playSound("click");
    refetch();
  }, [playSound, refetch]);

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

  const safeStats = React.useMemo(
    () => data?.stats ?? {
      totalUsers: 0,
      totalSubjects: 0,
      totalExams: 0,
      totalResources: 0,
      activeChallenges: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
    },
    [data?.stats]
  );
  const safeTrends = React.useMemo(
    () => data?.trends ?? { userGrowth: 0, studyTime: 0 },
    [data?.trends]
  );
  const safeActivity = React.useMemo(
    () => data?.activity ?? {
      tasksCompleted: 0,
      examsTaken: 0,
      achievementsEarned: 0,
      studyMinutes: 0,
    },
    [data?.activity]
  );
  const safeRecentActivity = React.useMemo(
    () => normalizeRecentActivity(data?.recentActivity),
    [data?.recentActivity],
  );
  const safeUpcomingEvents = React.useMemo(
    () => normalizeUpcomingEvents(data?.upcomingEvents),
    [data?.upcomingEvents],
  );

  const safeCharts = React.useMemo(() => ({
    userGrowth: formatUserGrowthData(data?.charts?.userGrowth),
    activity: data?.charts?.activity ?? [],
  }), [data?.charts]);

  const safeGoals = React.useMemo(
    () => data?.goals ?? buildDefaultGoals(safeStats, safeActivity),
    [data, safeStats, safeActivity],
  );

  const alertData = React.useMemo(() => {
    if (!data) return [];
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
  }, [data, safeStats, safeActivity, safeTrends]);

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
        activeStudents: data?.stats?.activeStudents ?? safeStats.totalUsers,
        totalTeachers: data?.stats?.totalTeachers ?? 0,
        publishedCourses: data?.stats?.publishedCourses ?? safeStats.totalSubjects,
        reviewCourses: data?.stats?.reviewCourses ?? 0,
        draftCourses: data?.stats?.draftCourses ?? 0,
        dailyRevenue: data?.stats?.dailyRevenue ?? 0,
        monthlyRevenue: data?.stats?.monthlyRevenue ?? 0,
        newSubscriptions: data?.stats?.newSubscriptions ?? 0,
        cancelledSubscriptions: data?.stats?.cancelledSubscriptions ?? 0,
        pendingOrders: data?.stats?.pendingOrders ?? 0,
        openTickets: data?.stats?.openTickets ?? 0,
        moderationQueue: data?.stats?.moderationQueue ?? 0,
        pendingApprovals: data?.stats?.pendingApprovals ?? 0,
        completionRate: data?.stats?.completionRate ?? 0,
      },
      activity: safeActivity,
      topSellingCourses: data?.topSellingCourses,
      criticalKPIs: data?.criticalKPIs,
      systemAlerts: data?.systemAlerts,
    }),
    [safeStats, safeActivity, data],
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
      id: "command-center",
      content: <AiCommandCenter dashboardContext={agentDashboardContext} pageControls={pageControls} />
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
    if (!isLoading && !data) {
      toast.warning("لا توجد بيانات متاحة حالياً لهذه الفترة الزمنية", {
        description: "حاول اختيار فترة زمنية أخرى",
        duration: 5000,
      });
    }
  }, [isLoading, data]);

  // ── Early returns (after all hooks) ─────────────────────────────────────
  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-12 pb-20" dir="rtl">
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
          <RealtimeNotifications
            notifications={notifications}
            isConnected={wsConnected}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
          />
        </div>
      </header>

      <DraggableDashboard onOrderChange={() => {}}>{sections}</DraggableDashboard>

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

