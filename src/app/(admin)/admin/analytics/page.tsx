"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard, AdminCard, AdminGridCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  BookOpen,
  FileText,
  Target,
  Activity,
  Zap,
  RefreshCw,
  Move,
  Settings,
  Search,
  ArrowRight,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Wallet,
  Percent,
  PieChart,
  Award,
  ClipboardList,
  CreditCard,
  Sparkles,
  Brain,
  Eye,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  LayoutGrid,
  Layers,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AnalyticsSkeleton } from "@/components/admin/ui/loading-skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { m } from "framer-motion";
import { toast } from "sonner";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { LazyTab } from "@/components/admin/ui/lazy-section";
import { cn, formatNumber } from "@/lib/utils";

import {
  PeriodSelector,
  type AnalyticsPeriod,
} from "./_components/period-selector";
import { ExportButton } from "./_components/export-button";
import { KPICard } from "./_components/kpi-card";
import {
  AIInsightsBanner,
  type AnalyticsInsight,
} from "./_components/ai-insights-banner";
import { SectionHeader } from "./_components/section-header";
import { AnalyticsFiltersBar } from "./_components/analytics-filters-bar";

const DailyActiveUsersChart = dynamic(() => import("./charts").then((m) => m.DailyActiveUsersChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" />,
});
const DailyRegistrationsChart = dynamic(() => import("./charts").then((m) => m.DailyRegistrationsChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" />,
});
const RoleDistributionChart = dynamic(() => import("./charts").then((m) => m.RoleDistributionChart), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted/50 rounded-xl" />,
});
const RevenueComposedChart = dynamic(() => import("./charts").then((m) => m.RevenueComposedChart), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse bg-muted/50 rounded-xl" />,
});
const PredictionChart = dynamic(() => import("./charts").then((m) => m.PredictionChart), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse bg-muted/50 rounded-xl" />,
});
const MultiLineChart = dynamic(() => import("./charts").then((m) => m.MultiLineChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" />,
});

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface RevenueData {
  summary: {
    today: number;
    thisMonth: number;
    totalTransactions: number;
    conversionRate: string;
  };
  chartData: { month: number; revenue: number; transactions?: number }[];
  topPlans: { name: string; count: number }[];
}

interface AnalyticsData {
  users: {
    total: number;
    new: number;
    active: number;
    byRole: Record<string, number>;
  };
  content: {
    subjects: number;
    exams: number;
    blogPosts: number;
  };
  gamification: {
    totalXP: number;
    achievementsEarned: number;
    challengesCompleted: number;
  };
  charts: {
    dailyActiveUsers: { date: string; count: number }[];
    dailyRegistrations: { date: string; count: number }[];
  };
}

interface JourneyStep {
  id: string;
  journeyId: string;
  page: string;
  action: string;
  timestamp: string;
  duration: number;
}

interface UserJourney {
  id: string;
  userId: string;
  sessionId: string;
  startedAt: string;
  endedAt: string;
  completed: boolean;
  conversionGoal: string;
  steps: JourneyStep[];
}

interface JourneysData {
  data: {
    journeys: UserJourney[];
    count: number;
  };
}

interface ActivityMetricsData {
  data: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    topPages: { page: string; views: number; uniqueVisitors: number; avgDuration: number }[];
    userFlows: { from: string; to: string; count: number }[];
    conversionRates: Record<string, number>;
  };
}

interface PredictionsData {
  data: {
    nextWeekRevenue: number;
    nextWeekUsers: number;
    churnRisk: number;
    confidence: number;
    series: Array<{ date: string; actual: number | null; forecast: number | null }>;
    previousSeries?: Array<{ date: string; actual: number | null; forecast: number | null }>;
  };
}

// ──────────────────────────────────────────
// Sortable Widget
// ──────────────────────────────────────────

interface SortableWidgetBlockProps {
  id: string;
  isEditMode: boolean;
  children: React.ReactNode;
  hidden?: boolean;
  onToggleVisibility?: () => void;
}

const SortableWidgetBlock = React.memo(function SortableWidgetBlock({
  id,
  isEditMode,
  children,
  hidden,
  onToggleVisibility,
}: SortableWidgetBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isEditMode,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  if (hidden && !isEditMode) return null;

  return (
    <div ref={setNodeRef} style={style} className="group/widget relative">
      <m.div
        animate={{
          scale: isDragging ? 1.01 : 1,
          boxShadow: isDragging ? "0 10px 30px rgba(0,0,0,0.15)" : "0 0 0 rgba(0,0,0,0)",
          opacity: hidden ? 0.5 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative rounded-3xl",
          isEditMode && "border-2 border-dashed border-primary/50 p-2 bg-primary/5 cursor-grab active:cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        {isEditMode && (
          <div className="absolute top-3 left-4 flex items-center gap-2">
            <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Move className="w-3 h-3" /> {id}
            </span>
            {onToggleVisibility && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-bold hover:bg-accent"
              >
                {hidden ? "إظهار" : "إخفاء"}
              </button>
            )}
          </div>
        )}
        {children}
      </m.div>
    </div>
  );
});

// ──────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────

const DEFAULT_WIDGETS = ["users", "activity", "finance", "content"] as const;

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("month");
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [widgetOrder, setWidgetOrder] = React.useState<string[]>([...DEFAULT_WIDGETS]);
  const [hiddenWidgets, setHiddenWidgets] = React.useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIdx = items.indexOf(active.id as string);
        const newIdx = items.indexOf(over.id as string);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  // ────────────── Queries ──────────────

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery<AnalyticsData>({
    queryKey: ["admin", "analytics", period],
    queryFn: async () => {
      const response = await adminFetch(`${apiRoutes.admin.analytics}?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch analytics data");
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery<RevenueData>({
    queryKey: ["admin", "revenue", period],
    queryFn: async () => {
      const response = await adminFetch(`${apiRoutes.admin.revenue}?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch revenue data");
      return response.json();
    },
    enabled: !!analyticsData,
  });

  const { data: metricsData } = useQuery<ActivityMetricsData>({
    queryKey: ["admin", "activity-metrics"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.activityMetrics);
      if (!response.ok) throw new Error("Failed to fetch activity metrics");
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: journeysData } = useQuery<JourneysData>({
    queryKey: ["admin", "journeys"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.journeys);
      if (!response.ok) throw new Error("Failed to fetch journeys");
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: predictionsData, isLoading: predictionsLoading } = useQuery<PredictionsData>({
    queryKey: ["admin", "predictions", period],
    queryFn: async () => {
      const response = await adminFetch(`${apiRoutes.analytics.predictions}?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch predictions");
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000,
  });

  // ────────────── Computed ──────────────

  const data = analyticsData;
  const loading = analyticsLoading;
  const _queryError = analyticsError;

  const refetch = () => {
    refetchAnalytics();
    refetchRevenue();
  };

  const saveLayout = () => {
    setIsEditMode(false);
    try {
      localStorage.setItem(
        "analytics-widget-layout",
        JSON.stringify({ order: widgetOrder, hidden: Array.from(hiddenWidgets) })
      );
    } catch {}
    toast.success("تم حفظ تخطيط لوحة التحكم بنجاح!");
  };

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("analytics-widget-layout");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.order)) setWidgetOrder(parsed.order);
        if (Array.isArray(parsed.hidden)) setHiddenWidgets(new Set(parsed.hidden));
      }
    } catch {}
  }, []);

  // إشعار عند عدم توفر بيانات
  React.useEffect(() => {
    if (analyticsData && !analyticsLoading) {
      const hasNoData =
        analyticsData.users?.total === 0 &&
        analyticsData.content?.subjects === 0 &&
        analyticsData.charts?.dailyActiveUsers?.length === 0;
      if (hasNoData) {
        const labels: Record<string, string> = {
          day: "اليوم",
          week: "آخر أسبوع",
          month: "آخر شهر",
          quarter: "آخر ربع سنة",
          year: "آخر سنة",
          all: "كل الفترة",
        };
        toast.info(`لا توجد بيانات متاحة للفترة: ${labels[period]}`);
      }
    }
  }, [analyticsData, analyticsLoading, period]);

  // رؤى ذكية تُحسب محلياً + من API
  const insights: AnalyticsInsight[] = React.useMemo(() => {
    const list: AnalyticsInsight[] = [];

    if (predictionsData?.data) {
      const p = predictionsData.data;
      list.push({
        id: "pred-revenue",
        title: `تنبؤ إيرادات الأسبوع القادم: ${formatNumber(p.nextWeekRevenue)} ج.م`,
        description: `بناءً على تحليل ${p.confidence || 75} نقطة ثقة من البيانات التاريخية.`,
        severity: "success",
        category: "prediction",
        metric: "revenue",
        confidence: p.confidence || 75,
      });
      if (p.churnRisk > 30) {
        list.push({
          id: "churn-risk",
          title: `مخاطر فقدان ${p.churnRisk}% من المستخدمين`,
          severity: "warning",
          category: "anomaly",
          description: "انخفاض في تفاعل المستخدمين يستدعي حملة إعادة تفاعل.",
          action: { label: "إطلاق حملة استرجاع" },
        });
      }
    }

    if (metricsData?.data) {
      const bounce = metricsData.data.bounceRate;
      if (bounce > 60) {
        list.push({
          id: "high-bounce",
          title: `معدل ارتداد مرتفع ${Math.round(bounce)}%`,
          severity: "danger",
          category: "anomaly",
          description: "صفحات متعددة بها ارتداد عالي، راجع تجربة المستخدم.",
        });
      }
      if (metricsData.data.dailyActiveUsers > 100) {
        list.push({
          id: "active-users",
          title: `${formatNumber(metricsData.data.dailyActiveUsers)} مستخدم نشط اليوم`,
          severity: "success",
          category: "trend",
          description: "تفاعل قوي اليوم. فرصة لإرسال إشعارات مستهدفة.",
        });
      }
    }

    if (revenueData?.summary) {
      const today = revenueData.summary.today;
      if (today > 0) {
        list.push({
          id: "today-revenue",
          title: `إيرادات اليوم: ${formatNumber(today)} ج.م`,
          severity: today > 1000 ? "success" : "info",
          category: "trend",
          description: "أداء إيرادات اليوم مقارنة بالمتوسط.",
        });
      }
    }

    return list;
  }, [predictionsData, metricsData, revenueData]);

  const roleLabels: Record<string, string> = {
    ADMIN: "مدير",
    TEACHER: "معلم",
    STUDENT: "طالب",
    MODERATOR: "مشرف",
  };

  const funnelData = React.useMemo(() => {
    const journeys = journeysData?.data?.journeys || [];
    const totalUsers = data?.users?.total || 0;
    if (journeys.length === 0) {
      return [
        { step: 1, name: "زيارة الصفحة الرئيسية", users: totalUsers, percent: "100%", drop: null },
        { step: 2, name: "تصفح صفحة المواد", users: 0, percent: "0%", drop: "0%" },
        { step: 3, name: "الوصول لصفحة الدفع", users: 0, percent: "0%", drop: "0%" },
        { step: 4, name: "إتمام الشراء", users: 0, percent: "0%", drop: "0%" },
      ];
    }
    const totalJourneys = journeys.length;
    const completedJourneys = journeys.filter((j) => j.completed).length;
    const withPaymentStep = journeys.filter((j) =>
      j.steps.some((s) => s.page.includes("checkout") || s.page.includes("payment") || s.page.includes("billing"))
    ).length;
    const withSubjectBrowse = journeys.filter((j) =>
      j.steps.some((s) => s.page.includes("subject") || s.page.includes("course") || s.page.includes("materials"))
    ).length;

    const browsePercent = totalJourneys > 0 ? Math.round((withSubjectBrowse / totalJourneys) * 100) : 0;
    const paymentPercent = totalJourneys > 0 ? Math.round((withPaymentStep / totalJourneys) * 100) : 0;
    const conversionPercent = totalJourneys > 0 ? Math.round((completedJourneys / totalJourneys) * 100) : 0;

    return [
      { step: 1, name: "زيارة الصفحة الرئيسية", users: totalJourneys, percent: "100%", drop: null },
      {
        step: 2,
        name: "تصفح صفحة المواد",
        users: withSubjectBrowse,
        percent: `${browsePercent}%`,
        drop: browsePercent > 0 ? `-${100 - browsePercent}%` : "0%",
      },
      {
        step: 3,
        name: "الوصول لصفحة الدفع",
        users: withPaymentStep,
        percent: `${paymentPercent}%`,
        drop: browsePercent > 0 && paymentPercent > 0 ? `-${Math.round(100 - (paymentPercent / browsePercent) * 100)}%` : "0%",
        danger: paymentPercent < 20 && paymentPercent > 0,
      },
      {
        step: 4,
        name: "إتمام الشراء",
        users: completedJourneys,
        percent: `${conversionPercent}%`,
        drop:
          paymentPercent > 0 && conversionPercent > 0
            ? `-${Math.round(100 - (conversionPercent / paymentPercent) * 100)}%`
            : "0%",
      },
    ];
  }, [journeysData, data?.users?.total]);

  const problematicPages = React.useMemo(() => {
    const topPages = metricsData?.data?.topPages || [];
    const bounceRate = metricsData?.data?.bounceRate || 0;
    if (topPages.length === 0) {
      return [{ path: "/checkout/payment", avgTime: "0:00", bounce: "0%", issue: "لا توجد بيانات بعد" }];
    }
    return [...topPages]
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5)
      .map((p) => ({
        path: p.page,
        avgTime: `${Math.floor(p.avgDuration / 60)}:${String(Math.floor(p.avgDuration % 60)).padStart(2, "0")}`,
        bounce: `${bounceRate > 0 ? Math.round(bounceRate) : 0}%`,
        issue:
          p.avgDuration > 180
            ? "وقت طويل في الصفحة"
            : p.views < 10
              ? "زيارات قليلة"
              : "معدل ارتداد عالي",
      }));
  }, [metricsData]);

  const happyPaths = React.useMemo(() => {
    const journeys = journeysData?.data?.journeys || [];
    const completedJourneys = journeys.filter((j) => j.completed).slice(0, 3);
    return completedJourneys.map((journey) => {
      const pages = journey.steps
        .map((s) => s.page.split("?")[0])
        .filter((v, i, a) => a.indexOf(v) === i);
      return { label: journey.conversionGoal || "مسار مكتمل", pages: pages.slice(0, 5) };
    });
  }, [journeysData]);

  const retentionRate = React.useMemo(() => {
    const dau = metricsData?.data?.dailyActiveUsers || 0;
    const mau = metricsData?.data?.monthlyActiveUsers || 1;
    return mau > 0 ? Math.round((dau / mau) * 100) : 0;
  }, [metricsData]);

  const dailyEngagement = metricsData?.data?.dailyActiveUsers || 0;
  const dauSeries = data?.charts?.dailyActiveUsers ?? [];
  const registrationsSeries = data?.charts?.dailyRegistrations ?? [];

  const roleChartData = React.useMemo(() => {
    if (!data?.users?.byRole) return [];
    return Object.entries(data.users.byRole).map(([role, count]) => ({
      name: roleLabels[role] || role,
      value: typeof count === "number" ? count : Number(count ?? 0),
    }));
  }, [data?.users?.byRole]);

  const financialMetrics = React.useMemo(() => {
    if (!revenueData?.summary) return null;
    const totalRevenue = revenueData.summary.thisMonth;
    const totalUsers = data?.users?.total || 1;
    const ltv = totalUsers > 0 ? Math.round((totalRevenue / totalUsers) * 10) : 0;
    const marketingSpend = totalRevenue * 0.2;
    const newUsers = data?.users?.new || 1;
    const cac = newUsers > 0 ? Math.round(marketingSpend / newUsers) : 0;
    const roi = marketingSpend > 0 ? Math.round(((totalRevenue - marketingSpend) / marketingSpend) * 100) : 0;
    return {
      ltv,
      cac,
      roi,
      conversionRate: parseFloat(revenueData.summary.conversionRate) || 0,
      totalRevenue,
      totalTransactions: revenueData.summary.totalTransactions,
    };
  }, [revenueData, data]);

  // ────────────── Loading ──────────────

  if (loading && !data) {
    return (
      <div className="space-y-6 pb-20">
        <PageHeader
          title="التحليلات وذكاء الأعمال (BI)"
          description="لوحات معلومات مخصصة، تقارير مالية، وتتبع مسار المستخدمين لاستخلاص القرارات."
        >
          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} size="sm" />
            <AdminButton variant="outline" size="sm" icon={RefreshCw} onClick={() => refetch()}>
              تحديث
            </AdminButton>
          </div>
        </PageHeader>
        <AnalyticsSkeleton />
      </div>
    );
  }

  // ────────────── Render ──────────────

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="التحليلات وذكاء الأعمال (BI)"
        description="لوحات معلومات مخصصة، تقارير مالية، وتتبع مسار المستخدمين لاستخلاص القرارات."
        badge="تجريبي"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSelector value={period} onChange={setPeriod} size="sm" />
          <AdminButton
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareMode((v) => !v)}
            className="text-xs"
          >
            مقارنة
          </AdminButton>
          <ExportButton
            data={{
              analytics: data,
              revenue: revenueData,
              metrics: metricsData,
            }}
            filename="analytics-dashboard"
            title="لوحة التحليلات"
            variant="outline"
          />
          <AdminButton variant="outline" size="sm" icon={RefreshCw} onClick={() => refetch()}>
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      <AIInsightsBanner
        insights={insights}
        loading={predictionsLoading}
        title="رؤى ذكية للفترة الحالية"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-background/50 h-14 p-1 border-border rounded-xl mb-6 grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard" className="h-full text-sm font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <LayoutGrid className="w-4 h-4 ml-1.5" />
            لوحتي المخصصة
          </TabsTrigger>
          <TabsTrigger value="finance" className="h-full text-sm font-bold rounded-lg data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500">
            <Wallet className="w-4 h-4 ml-1.5" />
            الماليات
          </TabsTrigger>
          <TabsTrigger value="journey" className="h-full text-sm font-bold rounded-lg data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500">
            <MousePointerClick className="w-4 h-4 ml-1.5" />
            مسار المستخدم
          </TabsTrigger>
          <TabsTrigger value="predictions" className="h-full text-sm font-bold rounded-lg data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
            <Brain className="w-4 h-4 ml-1.5" />
            التنبؤات
          </TabsTrigger>
        </TabsList>

        {/* ============================================
            TAB 1: DRAG & DROP DASHBOARD
            ============================================ */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-accent/20 p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">وضع تخصيص اللوحة (Widget Builder)</h3>
                <p className="text-xs text-muted-foreground">اسحب لإعادة الترتيب، أو اضغط على القطعة لإخفائها/إظهارها.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <AdminButton onClick={() => { setWidgetOrder([...DEFAULT_WIDGETS]); setHiddenWidgets(new Set()); }} variant="ghost" size="sm">
                  إعادة ضبط
                </AdminButton>
              )}
              {!isEditMode ? (
                <AdminButton onClick={() => setIsEditMode(true)} variant="outline" icon={Move}>
                  تعديل التخطيط
                </AdminButton>
              ) : (
                <AdminButton onClick={saveLayout} variant="default" className="bg-primary text-white">
                  حفظ التخطيط
                </AdminButton>
              )}
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {widgetOrder.map((widgetBlock) => (
                  <SortableWidgetBlock
                    key={widgetBlock}
                    id={widgetBlock}
                    isEditMode={isEditMode}
                    hidden={hiddenWidgets.has(widgetBlock)}
                    onToggleVisibility={() => {
                      setHiddenWidgets((prev) => {
                        const next = new Set(prev);
                        if (next.has(widgetBlock)) next.delete(widgetBlock);
                        else next.add(widgetBlock);
                        return next;
                      });
                    }}
                  >
                    {widgetBlock === "users" && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KPICard
                          title="إجمالي المستخدمين"
                          value={data?.users?.total ?? 0}
                          delta={data?.users?.new ? Math.round((data.users.new / Math.max(data.users.total, 1)) * 100) : 0}
                          deltaLabel="مستخدم جديد"
                          icon={Users}
                          color="blue"
                          sparkline={registrationsSeries.map((r) => r.count)}
                        />
                        <KPICard
                          title="المستخدمون النشطون"
                          value={data?.users?.active ?? 0}
                          hint="هذا الأسبوع"
                          icon={Activity}
                          color="green"
                          sparkline={dauSeries.map((r) => r.count)}
                        />
                        <KPICard
                          title="معدل الاحتفاظ"
                          value={`${retentionRate}%`}
                          icon={Target}
                          color="purple"
                          delta={retentionRate > 50 ? 2 : -1}
                        />
                        <KPICard
                          title="التفاعل اليومي"
                          value={dailyEngagement}
                          icon={Zap}
                          color="amber"
                          hint="جلسة اليوم"
                        />
                      </div>
                    )}

                    {widgetBlock === "activity" && (
                      <div className="grid gap-4 lg:grid-cols-2">
                        <AdminGridCard title="المستخدمين النشطين يومياً" subtitle="عدد المستخدمين الذين سجلوا دخول" noPadding>
                          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
                            <DailyActiveUsersChart data={dauSeries} />
                          </div>
                        </AdminGridCard>
                        <AdminGridCard title="التسجيلات الجديدة" subtitle="معدل النمو اليومي" noPadding>
                          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
                            <DailyRegistrationsChart data={registrationsSeries} />
                          </div>
                        </AdminGridCard>
                      </div>
                    )}

                    {widgetBlock === "finance" && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <KPICard
                          title="إيرادات الشهر"
                          value={financialMetrics?.totalRevenue ?? 0}
                          unit="ج.م"
                          icon={DollarSign}
                          color="green"
                          delta={financialMetrics?.conversionRate ? Math.round(financialMetrics.conversionRate) : 0}
                          deltaLabel="معدل التحويل"
                        />
                        <KPICard
                          title="المعاملات"
                          value={financialMetrics?.totalTransactions ?? 0}
                          icon={CreditCard}
                          color="purple"
                          hint="عمليات ناجحة"
                        />
                        <KPICard
                          title="عائد الاستثمار (ROI)"
                          value={`${financialMetrics?.roi ?? 0}%`}
                          icon={TrendingUp}
                          color="blue"
                          delta={financialMetrics?.roi ? Math.min(financialMetrics.roi, 20) : 0}
                          deltaLabel="تقديري"
                        />
                      </div>
                    )}

                    {widgetBlock === "content" && (
                      <div className="grid gap-4 lg:grid-cols-3">
                        <AdminGridCard title="التوزيع الطلابي" noPadding>
                          <div className="p-4">
                            <div className="h-[200px] w-full" style={{ minWidth: 0 }}>
                              <RoleDistributionChart data={roleChartData} />
                            </div>
                          </div>
                        </AdminGridCard>
                        <AdminGridCard title="إحصائيات المحتوى">
                          <div className="space-y-4">
                            {[
                              { label: "المواد الدراسية", value: data?.content?.subjects ?? 0, icon: BookOpen, color: "text-blue-500" },
                              { label: "الامتحانات", value: data?.content?.exams ?? 0, icon: Target, color: "text-purple-500" },
                              { label: "المقالات", value: data?.content?.blogPosts ?? 0, icon: FileText, color: "text-emerald-500" },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <item.icon className={cn("h-4 w-4", item.color)} />
                                  <span className="text-sm">{item.label}</span>
                                </div>
                                <span className="font-medium">{formatNumber(item.value)}</span>
                              </div>
                            ))}
                          </div>
                        </AdminGridCard>
                        <AdminGridCard title="إحصائيات التفاعل والتحفيز">
                          <div className="space-y-4">
                            {[
                              { label: "الأوسمة والتقدير", value: data?.gamification?.achievementsEarned ?? 0, icon: Award, color: "text-yellow-500" },
                              { label: "المهام التعليمية", value: data?.gamification?.challengesCompleted ?? 0, icon: ClipboardList, color: "text-emerald-500" },
                              { label: "إجمالي نقاط التفاعل", value: data?.gamification?.totalXP ?? 0, icon: Zap, color: "text-blue-500" },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <item.icon className={cn("h-4 w-4", item.color)} />
                                  <span className="text-sm">{item.label}</span>
                                </div>
                                <span className="font-medium">{formatNumber(item.value)}</span>
                              </div>
                            ))}
                          </div>
                        </AdminGridCard>
                      </div>
                    )}
                  </SortableWidgetBlock>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* ============================================
            TAB 2: FINANCE
            ============================================ */}
        <TabsContent value="finance" className="space-y-6">
          <LazyTab active={activeTab === "finance"}>
            {revenueLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="القيمة الدائمة (LTV)" value={financialMetrics?.ltv ?? 0} unit="ج.م" icon={DollarSign} color="green" hint="لكل مستخدم" />
                <KPICard title="تكلفة الاكتساب (CAC)" value={financialMetrics?.cac ?? 0} unit="ج.م" icon={Users} color="red" hint="لكل مستخدم جديد" />
                <KPICard title="ROI التسويقي" value={`${financialMetrics?.roi ?? 0}%`} icon={Percent} color="blue" hint="تقديري" />
                <KPICard title="معدل التحويل" value={`${financialMetrics?.conversionRate ?? 0}%`} icon={Target} color="purple" />
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              <AdminCard variant="glass" noPadding={false}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> الإيرادات والمعاملات
                  </h3>
                  <ExportButton
                    data={revenueData?.chartData ?? []}
                    filename="revenue-trend"
                    title="الإيرادات الشهرية"
                    size="sm"
                  />
                </div>
                <div className="h-[320px] w-full">
                  {revenueData?.chartData?.length ? (
                    <RevenueComposedChart data={revenueData.chartData} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      لا توجد بيانات إيرادات
                    </div>
                  )}
                </div>
              </AdminCard>

              <AdminCard variant="glass">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" /> تفصيل الأرباح حسب الخطة
                  </h3>
                </div>
                {revenueLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
                    ))}
                  </div>
                ) : revenueData?.topPlans && revenueData.topPlans.length > 0 ? (
                  <div className="space-y-5">
                    {revenueData.topPlans.map((item, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span>{item.name}</span>
                          <span className="text-primary">{formatNumber(item.count)} اشتراك</span>
                        </div>
                        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${
                                revenueData.topPlans.length > 0
                                  ? (item.count / revenueData.topPlans[0]!.count) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">لا توجد خطط نشطة</div>
                )}
              </AdminCard>
            </div>

            <AdminCard variant="glass">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" /> ملخص الإيرادات
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryTile
                  icon={DollarSign}
                  color="emerald"
                  label="إيرادات اليوم"
                  value={revenueData?.summary?.today?.toLocaleString() || 0}
                  unit="ج.م"
                />
                <SummaryTile
                  icon={TrendingUp}
                  color="primary"
                  label="إيرادات الشهر"
                  value={revenueData?.summary?.thisMonth?.toLocaleString() || 0}
                  unit="ج.م"
                />
                <SummaryTile
                  icon={Percent}
                  color="blue"
                  label="معدل التحويل"
                  value={revenueData?.summary?.conversionRate || "0%"}
                />
                <SummaryTile
                  icon={CreditCard}
                  color="purple"
                  label="إجمالي المعاملات"
                  value={revenueData?.summary?.totalTransactions?.toLocaleString() || 0}
                />
              </div>
            </AdminCard>
          </LazyTab>
        </TabsContent>

        {/* ============================================
            TAB 3: USER JOURNEY
            ============================================ */}
        <TabsContent value="journey" className="space-y-6">
          <LazyTab active={activeTab === "journey"}>
            <AdminCard
              variant="glass"
              className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3 text-purple-500">
                    <MousePointerClick className="w-6 h-6" /> خريطة مسار المستخدم
                  </h3>
                  <p className="text-muted-foreground mt-2 font-medium text-sm">
                    تتبع مسار الطالب منذ دخول المنصة وحتى إكمال الشراء لاكتشاف نقاط الاختناق.
                  </p>
                </div>
                <Select defaultValue="course_a">
                  <SelectTrigger className="w-64 h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course_a">مسار شراء كورس</SelectItem>
                    <SelectItem value="register">مسار التسجيل الجديد</SelectItem>
                    <SelectItem value="renewal">مسار تجديد الاشتراك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-8 mb-8 relative px-4 md:px-12">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-l from-primary via-purple-500 to-red-500 -translate-y-1/2 -z-10 rounded-full opacity-30 hidden md:block" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {funnelData.map((s) => (
                    <div key={s.step} className="flex flex-col items-center text-center relative">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl mb-4 border",
                          s.danger
                            ? "bg-red-500 text-white border-red-400 shadow-red-500/30"
                            : "bg-card text-foreground border-border shadow-black/10"
                        )}
                      >
                        {s.step}
                      </div>
                      <h4 className="font-bold mb-1 text-sm">{s.name}</h4>
                      <p className="text-2xl font-black text-primary">{formatNumber(s.users)}</p>
                      <p className="text-xs font-bold text-muted-foreground">{s.percent} من الأصلي</p>

                      {s.drop && s.drop !== "0%" && (
                        <div
                          className={cn(
                            "mt-3 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto",
                            s.danger
                              ? "bg-red-500/20 text-red-500 ring-2 ring-red-500/50"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          سقوط {s.drop}
                        </div>
                      )}

                      {s.danger && (
                        <div className="absolute -top-10 scale-90 w-max bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl animate-bounce">
                          نقطة اختناق!
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>

            <div className="grid md:grid-cols-2 gap-6">
              <AdminCard variant="glass">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" /> أكثر الصفحات تعقيداً
                </h3>
                <div className="space-y-3">
                  {problematicPages.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold dir-ltr text-left font-mono truncate">{p.path}</p>
                        <p className="text-xs text-red-500 font-bold mt-1">السبب: {p.issue}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-xs text-muted-foreground font-bold">بقاء {p.avgTime}د</p>
                        <p className="text-xs font-black bg-red-500/10 text-red-500 px-2 rounded mt-1 inline-block">
                          ارتداد {p.bounce}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminCard>

              <AdminCard variant="glass">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-emerald-500" /> مسارات النجاح الشائعة
                </h3>
                <div className="space-y-4">
                  {happyPaths.length > 0 ? (
                    happyPaths.map((path, i) => (
                      <div key={i} className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <p className="text-sm font-bold mb-2">{path.label}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground overflow-x-auto pb-2 whitespace-nowrap">
                          {path.pages.map((page, j) => (
                            <React.Fragment key={j}>
                              <span className="bg-background px-2 py-1 rounded border">{page}</span>
                              {j < path.pages.length - 1 && <ArrowRight className="w-3 h-3" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ArrowRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-bold">لا توجد مسارات مكتملة بعد</p>
                      <p className="text-xs mt-1">ستظهر المسارات الشائعة هنا عند توفر بيانات كافية.</p>
                    </div>
                  )}
                </div>
              </AdminCard>
            </div>
          </LazyTab>
        </TabsContent>

        {/* ============================================
            TAB 4: PREDICTIONS (NEW)
            ============================================ */}
        <TabsContent value="predictions" className="space-y-6">
          <LazyTab active={activeTab === "predictions"}>
            {predictionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/30" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KPICard
                    title="إيرادات الأسبوع القادم (تنبؤ)"
                    value={predictionsData?.data?.nextWeekRevenue ?? 0}
                    unit="ج.م"
                    icon={TrendingUp}
                    color="green"
                    delta={5}
                    deltaLabel="تنبؤ AI"
                  />
                  <KPICard
                    title="مستخدمون جدد متوقعون"
                    value={predictionsData?.data?.nextWeekUsers ?? 0}
                    icon={Users}
                    color="blue"
                    delta={3}
                    deltaLabel="تنبؤ AI"
                  />
                  <KPICard
                    title="مخاطر فقدان المستخدمين"
                    value={`${predictionsData?.data?.churnRisk ?? 0}%`}
                    icon={AlertCircle}
                    color={predictionsData?.data?.churnRisk && predictionsData.data.churnRisk > 30 ? "red" : "amber"}
                    hint="مستخدمون معرضون للخروج"
                  />
                </div>

                <AdminCard variant="glass">
                  <SectionHeader
                    title="اتجاه الإيرادات مع التنبؤ"
                    subtitle="الخط المتقطع يمثل توقع الـ 7 أيام القادمة بناءً على البيانات التاريخية"
                    icon={Brain}
                    iconColor="text-amber-500"
                    badge={
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                        <Sparkles className="h-3 w-3" /> AI
                      </span>
                    }
                  />
                  <div className="h-[320px] w-full mt-6">
                    {predictionsData?.data?.series?.length ? (
                      <PredictionChart data={predictionsData.data.series} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        لا توجد بيانات تنبؤية بعد
                      </div>
                    )}
                  </div>
                </AdminCard>
              </>
            )}
          </LazyTab>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ──────────────────────────────────────────
// Subcomponents
// ──────────────────────────────────────────

interface SummaryTileProps {
  icon: React.ElementType;
  color: "emerald" | "primary" | "blue" | "purple" | "amber" | "red";
  label: string;
  value: string | number;
  unit?: string;
}

const TILE_COLOR_CLASSES: Record<SummaryTileProps["color"], { bg: string; icon: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-500", border: "border-emerald-500/20" },
  primary: { bg: "bg-primary/10", icon: "text-primary", border: "border-primary/20" },
  blue: { bg: "bg-blue-500/10", icon: "text-blue-500", border: "border-blue-500/20" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-500", border: "border-purple-500/20" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-500", border: "border-amber-500/20" },
  red: { bg: "bg-red-500/10", icon: "text-red-500", border: "border-red-500/20" },
};

function SummaryTile({ icon: Icon, color, label, value, unit }: SummaryTileProps) {
  const colors = TILE_COLOR_CLASSES[color];
  return (
    <div className={cn("flex items-center justify-between p-4 rounded-xl border", colors.bg, colors.border)}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{label}</p>
        </div>
      </div>
      <div className="text-left shrink-0">
        <span className={cn("text-lg font-black", colors.icon)}>
          {value}
          {unit && <span className="text-xs font-bold text-muted-foreground mr-1">{unit}</span>}
        </span>
      </div>
    </div>
  );
}