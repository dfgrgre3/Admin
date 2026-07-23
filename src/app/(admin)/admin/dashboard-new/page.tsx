"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import { useWebSocket } from "@/contexts/websocket-context";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import type { UserSegment } from "@/components/admin/broadcast/broadcast-modal";
import type { UserModel } from "@/components/admin/broadcast/types";
import { adminFetch } from "@/lib/api/admin-api";
import { DashboardSkeleton } from "@/components/admin/ui/loading-skeleton";
import { DashboardHeader } from "@/components/admin/dashboard/layout/dashboard-header";
import { DashboardLayout, SystemDiagnosticsSection } from "@/components/admin/dashboard/layout/dashboard-layout";
import { MainStatsCard } from "@/components/admin/dashboard/stats/main-stats-card";
import { ChartsSection } from "@/components/admin/dashboard/charts/charts-section";
import { ActivitySection } from "@/components/admin/dashboard/activity/activity-section";
import { AiSection } from "@/components/admin/dashboard/ai/ai-section";
import { QuickActions, BroadcastActionCard } from "@/components/admin/dashboard/actions/quick-actions";
import { BroadcastModal } from "@/components/admin/broadcast/broadcast-modal";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";
import { generateSmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import dynamic from "next/dynamic";

const BroadcastModalDynamic = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
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
}

export default function NewAdminDashboardPage() {
  const { playSound } = usePremiumSounds();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = React.useState("today");
  const { isConnected: wsConnected, socket } = useWebSocket();
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
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  React.useEffect(() => {
    if (!socket) return;
    const handleWsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && (
          data.type.startsWith('admin_') || 
          data.type === 'admin_notification' ||
          data.type === 'broadcast-completed' ||
          data.type === 'notification' || 
          data.type === 'activity'
        )) {
          refetch();
        }
      } catch (err) {
        // ignore
      }
    };
    socket.addEventListener('message', handleWsMessage);
    return () => {
      socket.removeEventListener('message', handleWsMessage);
    };
  }, [socket, refetch]);

  const handleRefresh = React.useCallback(() => {
    playSound("click");
    refetch();
  }, [playSound, refetch]);

  const handleTimeFilterChange = React.useCallback((filter: "today" | "week" | "month" | "year") => {
    playSound("click");
    setTimeFilter(filter);
  }, [playSound]);

  // Derived data
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
    () =>
      (data?.recentActivity ?? []).map((a: any) => ({
        ...a,
        timestamp: a.createdAt ? new Date(a.createdAt) : new Date(),
        type: (a.type as any) || "user",
      })),
    [data?.recentActivity],
  );

  const safeUpcomingEvents = React.useMemo(
    () =>
      (data?.upcomingEvents ?? []).map((e: any) => ({
        ...e,
        date: e.date ? new Date(e.date) : new Date(),
      })),
    [data?.upcomingEvents],
  );

  const ARABIC_MONTHS = React.useMemo(
    () => [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ],
    []
  );

  const safeCharts = React.useMemo(() => {
    const rawGrowth = data?.charts?.userGrowth ?? [];
    const formattedGrowth = rawGrowth.map((item: any) => {
      const monthNum = typeof item.month === "number" ? item.month : parseInt(item.month, 10);
      const name = (monthNum >= 1 && monthNum <= 12) ? ARABIC_MONTHS[monthNum - 1] : String(item.month);
      return { ...item, month: name };
    });
    return {
      userGrowth: formattedGrowth,
      activity: data?.charts?.activity ?? [],
    };
  }, [data?.charts, ARABIC_MONTHS]);

  const safeGoals = React.useMemo(() => {
    return [
      { id: "1", title: "مستخدمين جدد", current: safeStats.newUsersThisWeek, target: 1000, unit: "مستخدم", category: "users" as const, priority: "medium" as const },
      { id: "2", title: "دراسة مجمعة", current: Math.round(safeActivity.studyMinutes / 60), target: 5000, unit: "ساعة", category: "engagement" as const, priority: "high" as const },
    ];
  }, [safeStats.newUsersThisWeek, safeActivity.studyMinutes]);

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

  const distributionData = React.useMemo(() => {
    return [
      { name: "المواد الدراسية", value: safeStats.totalSubjects, color: "#10b981" },
      { name: "الامتحانات", value: safeStats.totalExams, color: "#8b5cf6" },
      { name: "المصادر التعليمية", value: safeStats.totalResources, color: "#3b82f6" },
    ];
  }, [safeStats]);

  const heatmapData = React.useMemo(() => {
    const today = new Date();
    const result: Array<{ date: string; count: number }> = [];

    const activityMap = new Map<string, number>();
    if (safeCharts.activity) {
      safeCharts.activity.forEach((act: any) => {
        if (act.day && act.day.includes("/")) {
          const [dayStr, monthStr] = act.day.split("/");
          const year = today.getFullYear();
          const d = new Date(year, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
          const dateKey = d.toISOString().split("T")[0];
          if (dateKey) {
            activityMap.set(dateKey, act.sessions || 0);
          }
        }
      });
    }

    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]!;
      const count = activityMap.get(dateStr) || 0;
      result.push({ date: dateStr, count });
    }
    return result;
  }, [safeCharts.activity]);

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

  const pageControls = React.useMemo(() => ({
    refreshDashboard: handleRefresh,
    openBroadcast: () => setIsBroadcastOpen(true),
    setTimeFilter: handleTimeFilterChange,
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
  }), [handleRefresh, handleTimeFilterChange]);

  const comprehensiveStats = React.useMemo(() => ({
    totalUsers: safeStats.totalUsers,
    activeStudents: safeStats.totalUsers,
    totalTeachers: 0,
    newUsersToday: safeStats.newUsersToday,
    newUsersThisWeek: safeStats.newUsersThisWeek,
    totalSubjects: safeStats.totalSubjects,
    publishedCourses: safeStats.totalSubjects,
    reviewCourses: 0,
    draftCourses: 0,
    totalExams: safeStats.totalExams,
    totalResources: safeStats.totalResources,
    activeChallenges: safeStats.activeChallenges,
    completedTasks: safeActivity.tasksCompleted,
    studyMinutes: safeActivity.studyMinutes,
    examsTaken: safeActivity.examsTaken,
    achievementsEarned: safeActivity.achievementsEarned,
    completionRate: 75,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    newSubscriptions: 0,
    cancelledSubscriptions: 0,
    pendingOrders: 0,
    openTickets: 0,
    moderationQueue: 0,
    pendingApprovals: 0,
  }), [safeStats, safeActivity]);

  const sections = React.useMemo(() => [
    {
      id: "main-stats",
      content: (
        <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل الإحصائيات</div>}>
          <MainStatsCard
            stats={comprehensiveStats}
            timeFilter={timeFilter}
            onTimeFilterChange={handleTimeFilterChange}
          />
        </ErrorBoundary>
      )
    },
    {
      id: "quick-actions",
      content: (
        <QuickActions playSound={playSound} />
      )
    },
    {
      id: "charts",
      content: (
        <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل الرسوم البيانية</div>}>
          <ChartsSection
            userGrowthData={safeCharts.userGrowth}
            activityData={safeCharts.activity}
            heatmapData={heatmapData}
            distributionData={distributionData}
          />
        </ErrorBoundary>
      )
    },
    {
      id: "activity",
      content: (
        <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل النشاط</div>}>
          <ActivitySection
            recentActivity={safeRecentActivity}
            upcomingEvents={safeUpcomingEvents}
            onRefresh={handleRefresh}
            loading={isFetching}
          />
        </ErrorBoundary>
      )
    },
    {
      id: "ai",
      content: (
        <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل الذكاء الاصطناعي</div>}>
          <AiSection
            dashboardContext={agentDashboardContext}
            pageControls={pageControls}
            goals={safeGoals}
            alerts={alertData}
          />
        </ErrorBoundary>
      )
    },
    {
      id: "broadcast",
      content: (
        <BroadcastActionCard
          onOpen={() => setIsBroadcastOpen(true)}
          playSound={playSound}
        />
      )
    },
    {
      id: "system-diagnostics",
      content: <SystemDiagnosticsSection />
    },
  ], [
    comprehensiveStats,
    timeFilter,
    handleTimeFilterChange,
    playSound,
    safeCharts,
    heatmapData,
    distributionData,
    safeRecentActivity,
    safeUpcomingEvents,
    handleRefresh,
    isFetching,
    agentDashboardContext,
    pageControls,
    safeGoals,
    alertData
  ]);

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div className="text-center py-20 text-gray-400 font-bold">لا توجد بيانات متاحة حالياً.</div>;

  return (
    <div className="space-y-12 pb-20" dir="rtl">
      <DashboardHeader
        userName={user?.name || undefined}
        onRefresh={handleRefresh}
        isFetching={isFetching}
        notifications={notifications}
        isConnected={wsConnected}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDismiss={dismiss}
      />

      <DashboardLayout sections={sections} />

      <BroadcastModalDynamic
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
