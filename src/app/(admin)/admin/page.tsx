"use client";

import * as React from "react";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/admin/ui/loading-skeleton";
import { useQuery } from "@tanstack/react-query";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  EnhancedStatsCards,
  QuickStatsRow,
} from "@/components/admin/dashboard/enhanced-stats-cards";
import {
  ActivityFeed,
  UpcomingEvents,
} from "@/components/admin/dashboard/widgets";
import dynamic from "next/dynamic";
import { DraggableDashboard } from "@/components/admin/dashboard/draggable-dashboard";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";
import { useAuth } from "@/contexts/auth-context";
import type { UserSegment } from "@/components/admin/broadcast/broadcast-modal";
import { ComprehensiveStats } from "@/components/admin/dashboard/comprehensive-stats";
import { useDashboardExport } from "@/lib/export-utils";
import { buildComprehensiveStats } from "@/lib/dashboard-data";

const BroadcastModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { useBroadcastUsers } from "@/hooks/use-broadcast-users";
import type { UserModel } from "@/components/admin/broadcast/types";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";

// ── Consistent loading placeholder for dynamic chart imports ──
const CHART_SKELETON = (
  <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-[2rem] border border-white/10" />
);

const UserGrowthChart = dynamic(() => import("@/components/admin/dashboard/user-growth-chart").then(mod => mod.UserGrowthChart), {
  ssr: false,
  loading: () => CHART_SKELETON
});
const ActivityChart = dynamic(() => import("@/components/admin/dashboard/activity-chart").then(mod => mod.ActivityChart), {
  ssr: false,
  loading: () => CHART_SKELETON
});
const ActivityHeatmap = dynamic(() => import("@/components/admin/dashboard/activity-heatmap").then(mod => mod.ActivityHeatmap), {
  ssr: false,
  loading: () => CHART_SKELETON
});
const DistributionChart = dynamic(() => import("@/components/admin/dashboard/distribution-chart").then(mod => mod.DistributionChart), {
  ssr: false,
  loading: () => CHART_SKELETON
});
const SystemPulse = dynamic(() => import("@/components/admin/dashboard/system-pulse").then(mod => mod.SystemPulse), {
  ssr: false,
  loading: () => CHART_SKELETON
});

import { SmartAlerts, generateSmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import { GoalsKPIs } from "@/components/admin/dashboard/goals-kpis";
import { GlobalSearch } from "@/components/admin/dashboard/global-search";
import { QuickFilters } from "@/components/admin/dashboard/advanced-filters";
import { RealtimeNotifications } from "@/components/admin/dashboard/realtime-notifications";
import {
  RefreshCw,
  UserPlus,
  BookOpen,
  FileText,
  Settings,
  Bell,
  Users,
  Target,
  Award,
  Clock,
  Zap,
  Calendar,
  TrendingUp,
  Activity,
  Megaphone,
  ClipboardList
} from "lucide-react";
import { AiCommandCenter } from "@/components/admin/dashboard/ai-command-center";
import { useWebSocket } from "@/contexts/websocket-context";

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

const STYLES = {
   glass: "admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden",
   glow: "absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none",
   card: "admin-card p-6 flex flex-col gap-4",
   statsValue: "text-4xl font-black font-mono tracking-tighter"
};

const quickActionsConfig = [
  { title: "إضافة مستخدم", icon: UserPlus, href: "/admin/users?action=new", color: "blue" },
  { title: "مادة جديدة", icon: BookOpen, href: "/admin/subjects?action=new", color: "green" },
  { title: "إنشاء اختبار", icon: FileText, href: "/admin/exams?action=new", color: "purple" },
  { title: "مهمة جديدة", icon: ClipboardList, href: "/admin/challenges?action=new", color: "orange" },
  { title: "الإعدادات", icon: Settings, href: "/admin/settings", color: "gray" },
  { title: "تنبيه عام", icon: Bell, href: "/admin/notifications?action=new", color: "rose" },
] as const;

const quickActionColorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  purple: "bg-purple-500/10 text-purple-500",
  orange: "bg-orange-500/10 text-orange-500",
  gray: "bg-gray-500/10 text-gray-500",
  rose: "bg-rose-500/10 text-rose-500",
};

export default function AdminDashboardPage() {
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
    staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { exportDashboardData, exportTopCourses } = useDashboardExport(data?.stats || {});

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

  // ── Derived data ──────────────────────────────────────────────────────────
  // All hooks MUST be declared before any early return (Rules of Hooks).

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
        timestamp: a.createdAt || a.timestamp || new Date().toISOString(),
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
    return (data as any)?.goals ?? [
      { id: "1", title: "مستخدمين جدد", current: safeStats.newUsersThisWeek, target: 1000, unit: "مستخدم", category: "users", priority: "medium" },
      { id: "2", title: "دراسة مجمعة", current: Math.round(safeActivity.studyMinutes / 60), target: 5000, unit: "ساعة", category: "engagement", priority: "high" },
    ];
  }, [data, safeStats.newUsersThisWeek, safeActivity.studyMinutes]);

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

    // Map existing activity sessions to YYYY-MM-DD
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

    // Generate 84 days (12 weeks) of records
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]!;
      const count = activityMap.get(dateStr) || 0;
      result.push({ date: dateStr, count });
    }
    return result;
  }, [safeCharts.activity]);

  const comprehensiveStats = React.useMemo(
    () => buildComprehensiveStats({
      stats: {
        ...safeStats,
        activeStudents: (data as any)?.stats?.activeStudents ?? safeStats.totalUsers,
        totalTeachers: (data as any)?.stats?.totalTeachers ?? 0,
        publishedCourses: (data as any)?.stats?.publishedCourses ?? safeStats.totalSubjects,
        reviewCourses: (data as any)?.stats?.reviewCourses ?? 0,
        draftCourses: (data as any)?.stats?.draftCourses ?? 0,
        dailyRevenue: (data as any)?.stats?.dailyRevenue ?? 0,
        monthlyRevenue: (data as any)?.stats?.monthlyRevenue ?? 0,
        newSubscriptions: (data as any)?.stats?.newSubscriptions ?? 0,
        cancelledSubscriptions: (data as any)?.stats?.cancelledSubscriptions ?? 0,
        pendingOrders: (data as any)?.stats?.pendingOrders ?? 0,
        openTickets: (data as any)?.stats?.openTickets ?? 0,
        moderationQueue: (data as any)?.stats?.moderationQueue ?? 0,
        pendingApprovals: (data as any)?.stats?.pendingApprovals ?? 0,
        completionRate: (data as any)?.stats?.completionRate ?? 75,
      },
      activity: safeActivity,
      topSellingCourses: (data as any)?.topSellingCourses,
      criticalKPIs: (data as any)?.criticalKPIs,
      systemAlerts: (data as any)?.systemAlerts,
    }),
    [safeStats, safeActivity, data,]
  );

  const sections = React.useMemo(() => [
    {
      id: "main-stats",
      content: (
        <ComprehensiveStats
          stats={comprehensiveStats}
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          onExport={handleExport}
        />
      )
    },
    {
      id: "quick-stats",
      content: (
        <QuickStatsRow stats={[
          { label: "ساعة دراسة مجمعة", value: Math.round(safeActivity.studyMinutes / 60), icon: Clock, color: "blue" },
          { label: "مهمة مكتملة", value: safeActivity.tasksCompleted, icon: Target, color: "green" },
          { label: "إنجاز تعليمي", value: safeActivity.achievementsEarned, icon: Award, color: "yellow" },
          { label: "اختبار تم أداؤه", value: safeActivity.examsTaken, icon: FileText, color: "purple" },
        ]} />
      )
    },
    {
      id: "quick-actions",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           {quickActionsConfig.map((action, i) => (
             <a
               key={i}
               href={action.href}
               onMouseEnter={() => playSound('hover')}
               onClick={() => playSound('click')}
               className={STYLES.glass + " p-6 flex flex-col items-center justify-center gap-4 group hover:border-primary/50 transition-all"}
             >
                 <div className={cn("p-4 rounded-2xl border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all", quickActionColorClasses[action.color] ?? quickActionColorClasses.blue)}>
                    <action.icon className="w-7 h-7" />
                 </div>
                <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{action.title}</span>
             </a>
           ))}
        </div>
      )
    },
    {
      id: "command-center",
      content: <AiCommandCenter dashboardContext={agentDashboardContext} pageControls={pageControls} />
    },
    {
       id: "intelligence",
       content: (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3 space-y-8">
              <div className="flex flex-wrap items-center gap-6">
                <GlobalSearch 
                  placeholder="ابحث في المستخدمين، المواد، الاختبارات..."
                  className="flex-1 min-w-[300px] h-16 rounded-2xl bg-card border border-border text-foreground font-bold focus:border-primary/50"
                  onFocus={() => playSound('hover')}
                />
                <QuickFilters
                  filters={[
                    { id: "today", label: "اليوم", icon: Clock, active: timeFilter === "today", onClick: () => { playSound('click'); setTimeFilter("today"); } },
                    { id: "week", label: "هذا الأسبوع", icon: Calendar, active: timeFilter === "week", onClick: () => { playSound('click'); setTimeFilter("week"); } },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={STYLES.glass} id="growth-chart">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-2">
                       <TrendingUp className="h-5 w-5 text-primary" />
                       <span>نمو المنصة</span>
                    </h3>
                  </div>
                  <UserGrowthChart data={safeCharts.userGrowth} />
                </div>
                <div className={STYLES.glass} id="activity-chart">
                   <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-2">
                       <Zap className="h-5 w-5 text-amber-500" />
                       <span>نشاط المستخدمين</span>
                    </h3>
                  </div>
                  <ActivityChart data={safeCharts.activity} />
                </div>
              </div>

              <div className={STYLES.glass}>
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-black">نشاط المنصة الأخير</h3>
                </div>
                <ActivityFeed activities={safeRecentActivity} onRefresh={handleRefresh} loading={isFetching} />
              </div>
           </div>

           <div className="space-y-8">
              <div className={STYLES.glass + " border-primary/20"}>
                 <div className="flex items-center gap-3 mb-8">
                    <Calendar className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-black">الأحداث القادمة</h3>
                 </div>
                 <UpcomingEvents events={safeUpcomingEvents} />
                 {safeUpcomingEvents.length === 0 && (
                   <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">لا توجد فعاليات مجدولة</p>
                   </div>
                 )}
              </div>

              <div id="goals-kpis">
                <GoalsKPIs 
                  goals={safeGoals}
                />
              </div>

              <div className="bg-card/50 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                 <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <Megaphone className="w-12 h-12 text-primary" />
                    <h4 className="font-black text-lg">مركز الإشعارات العام</h4>
                    <p className="text-xs text-gray-400 font-medium">إرسال تنبيه إداري عاجل لكافة المستخدمين والطلاب.</p>
                    <AdminButton 
                      variant="premium" 
                      className="w-full rounded-2xl h-12"
                      onClick={() => setIsBroadcastOpen(true)}
                    >
                      إرسال بث تنبيهي
                    </AdminButton>
                 </div>
              </div>
            </div>
         </div>
        )
    },
    {
      id: "system-diagnostics",
      content: (
        <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل تشخيصات النظام</div>}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SystemPulse />
            <SmartAlerts 
              alerts={alertData} 
              title="التنبيهات والتحليلات الذكية"
              className="h-full"
            />
          </div>
        </ErrorBoundary>
      )
    },
    {
      id: "activity-and-distribution",
      content: (
        <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل الرسوم البيانية</div>}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ActivityHeatmap 
                data={heatmapData} 
                title="خريطة دراسة ونشاط الطلاب" 
                color="purple" 
                className="h-full"
              />
            </div>
            <div>
              <DistributionChart 
                data={distributionData} 
                title="توزيع المحتوى التعليمي" 
                description="عرض لنسب تصنيف المحتوى الدراسي"
                className="h-full"
                height={260}
              />
            </div>
          </div>
        </ErrorBoundary>
      )
    }
  ], [comprehensiveStats, safeStats, safeActivity, safeTrends, safeCharts, safeRecentActivity, safeUpcomingEvents, alertData, agentDashboardContext, pageControls, heatmapData, distributionData, timeFilter, playSound, handleRefresh, isFetching]);

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
