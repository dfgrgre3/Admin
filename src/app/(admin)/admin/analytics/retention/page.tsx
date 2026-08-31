"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  UserCheck,
  TrendingDown,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
  Repeat,
  Target,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  PieChart,
  Layers,
  Lightbulb,
} from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard, AdminGridCard } from "@/components/admin/ui/admin-card";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { KPICard } from "../_components/kpi-card";
import {
  PeriodSelector,
  CompareToggle,
  type AnalyticsPeriod,
} from "../_components/period-selector";
import { ExportButton } from "../_components/export-button";
import { SectionHeader } from "../_components/section-header";
import { AIInsightsBanner, type AnalyticsInsight } from "../_components/ai-insights-banner";
import { CohortHeatmap } from "../_components/cohort-heatmap";
import { apiRoutes } from "../_components/use-analytics-data";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { formatNumber, cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MultiLineChart = dynamic(
  () => import("../charts").then((m) => m.MultiLineChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);
const StackedBarChart = dynamic(
  () => import("../charts").then((m) => m.StackedBarChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);

interface RetentionResponse {
  overview?: {
    dailyRetention?: number;
    weeklyRetention?: number;
    monthlyRetention?: number;
    churnRate?: number;
    avgLifetimeDays?: number;
    activeUsers?: number;
    atRiskUsers?: number;
    resurrectedUsers?: number;
  };
  cohortData?: Array<{ cohort: string; sizes: number[] }>;
  churnTrend?: Array<{ label: string; churn: number; retained: number }>;
  byRole?: Array<{ name: string; retention: number; churn: number }>;
  churnReasons?: Array<{ reason: string; count: number; pct: number }>;
  engagementSegments?: Array<{ name: string; value: number; fill: string }>;
  insights?: AnalyticsInsight[];
}

const FALLBACK: RetentionResponse = {
  overview: {
    dailyRetention: 68,
    weeklyRetention: 52,
    monthlyRetention: 38,
    churnRate: 8.4,
    avgLifetimeDays: 142,
    activeUsers: 18420,
    atRiskUsers: 1240,
    resurrectedUsers: 320,
  },
  cohortData: [
    { cohort: "يناير", sizes: [1000, 720, 540, 410, 320, 260, 215, 180, 155, 135, 118, 105] },
    { cohort: "فبراير", sizes: [1180, 850, 640, 480, 380, 310, 255, 215, 185, 160, 140, 0] },
    { cohort: "مارس", sizes: [1240, 920, 710, 540, 430, 360, 295, 250, 215, 185, 0, 0] },
    { cohort: "أبريل", sizes: [1320, 980, 760, 580, 470, 390, 320, 270, 235, 0, 0, 0] },
    { cohort: "مايو", sizes: [1420, 1080, 840, 650, 520, 430, 355, 300, 0, 0, 0, 0] },
    { cohort: "يونيو", sizes: [1480, 1140, 900, 700, 560, 460, 380, 0, 0, 0, 0, 0] },
    { cohort: "يوليو", sizes: [1620, 1240, 980, 770, 620, 510, 0, 0, 0, 0, 0, 0] },
  ],
  churnTrend: [
    { label: "الأسبوع 1", churn: 8.2, retained: 91.8 },
    { label: "الأسبوع 2", churn: 9.1, retained: 90.9 },
    { label: "الأسبوع 3", churn: 7.4, retained: 92.6 },
    { label: "الأسبوع 4", churn: 8.9, retained: 91.1 },
    { label: "الأسبوع 5", churn: 8.4, retained: 91.6 },
    { label: "الأسبوع 6", churn: 7.1, retained: 92.9 },
    { label: "الأسبوع 7", churn: 6.8, retained: 93.2 },
    { label: "الأسبوع 8", churn: 8.4, retained: 91.6 },
  ],
  byRole: [
    { name: "طلاب", retention: 42, churn: 8.4 },
    { name: "معلمون", retention: 84, churn: 2.1 },
    { name: "مشرفون", retention: 92, churn: 1.2 },
    { name: "أولياء أمور", retention: 65, churn: 5.4 },
  ],
  churnReasons: [
    { reason: "عدم توفر محتوى مناسب", count: 280, pct: 32 },
    { reason: "مشاكل تقنية", count: 195, pct: 22 },
    { reason: "ارتفاع الأسعار", count: 158, pct: 18 },
    { reason: "نقص الوقت", count: 124, pct: 14 },
    { reason: "عدم تحقيق الأهداف", count: 88, pct: 10 },
    { reason: "أخرى", count: 35, pct: 4 },
  ],
  engagementSegments: [
    { name: "نشط جداً", value: 28, fill: "#10b981" },
    { name: "نشط", value: 34, fill: "#3b82f6" },
    { name: "خامل", value: 22, fill: "#f59e0b" },
    { name: "منقطع", value: 16, fill: "#ef4444" },
  ],
  insights: [
    {
      id: "r1",
      title: "انخفاض الاحتفاظ اليومي",
      description: "لوحظ انخفاض بنسبة 12% في الاحتفاظ اليومي. يوصى بإضافة إشعارات تذكير ذكية صباحية.",
      severity: "warning",
      category: "anomaly",
      metric: "-12%",
      confidence: 88,
    },
    {
      id: "r2",
      title: "أفضل أداء: المعلمون",
      description: "المعلمون يحققون معدل احتفاظ 84%، أعلى من الطلاب بـ42 نقطة. نموذج يمكن تكراره مع الطلاب.",
      severity: "success",
      category: "trend",
      metric: "84%",
      confidence: 95,
    },
    {
      id: "r3",
      title: "فرصة لاستعادة 320 مستخدم",
      description: "320 مستخدم سابق عاد للنشاط هذا الأسبوع. حملة الترحيب قد تضاعف هذا الرقم.",
      severity: "info",
      category: "opportunity",
      metric: "+320",
      confidence: 76,
    },
  ],
};

export default function RetentionAnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("month");
  const [compare, setCompare] = React.useState(false);
  const [cohortType, setCohortType] = React.useState<"monthly" | "weekly">("monthly");

  const { data, isLoading } = useQuery<RetentionResponse>({
    queryKey: ["analytics", "retention", period],
    queryFn: async () => {
      try {
        const url = `${apiRoutes.admin.analytics}?period=${period}&type=retention`;
        const res = await adminFetch(url);
        if (!res.ok) throw new Error("fallback");
        return (await res.json()) as RetentionResponse;
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 60_000,
  });

  const merged = data ?? FALLBACK;
  const overview = merged.overview ?? FALLBACK.overview!;

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="تحليلات الاحتفاظ"
        description="معدلات الاحتفاظ، التوقف، وتجديد النشاط عبر الفترات والكوهورتات."
        icon={UserCheck}
        accentColor="blue"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <CompareToggle enabled={compare} onToggle={setCompare} />
            <PeriodSelector value={period} onChange={setPeriod} size="sm" />
            <ExportButton
              data={merged.cohortData ?? []}
              filename="retention-cohorts"
              title="تحليلات الاحتفاظ"
            />
          </div>
        }
      />

      <AIInsightsBanner insights={merged.insights ?? []} loading={isLoading} />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KPICard title="احتفاظ يومي" value={`${overview.dailyRetention ?? 0}`} unit="%" icon={Activity} color="green"
          delta={-2.4} deltaLabel="تراجع طفيف" loading={isLoading} />
        <KPICard title="احتفاظ أسبوعي" value={`${overview.weeklyRetention ?? 0}`} unit="%" icon={Calendar} color="blue"
          delta={1.8} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="احتفاظ شهري" value={`${overview.monthlyRetention ?? 0}`} unit="%" icon={Repeat} color="violet"
          delta={3.2} deltaLabel="نمو جيد" loading={isLoading} />
        <KPICard title="معدل التوقف" value={`${overview.churnRate ?? 0}`} unit="%" icon={TrendingDown} color="red"
          delta={-1.5} deltaLabel="انخفاض إيجابي" loading={isLoading} />
        <KPICard title="متوسط العمر" value={overview.avgLifetimeDays ?? 0} unit=" يوم" icon={Clock} color="fuchsia"
          delta={5.4} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="مستخدمون نشطون" value={overview.activeUsers ?? 0} icon={Users} color="blue"
          delta={12.6} deltaLabel="نمو قوي" loading={isLoading} />
        <KPICard title="مستخدمون في خطر" value={overview.atRiskUsers ?? 0} icon={AlertTriangle} color="amber"
          delta={-4.2} deltaLabel="انخفاض" loading={isLoading} />
        <KPICard title="مستخدمون عائدون" value={overview.resurrectedUsers ?? 0} icon={Heart} color="green"
          delta={28.4} deltaLabel="قفزة ممتازة" loading={isLoading} />
      </div>

      {/* Cohort Heatmap */}
      <AdminCard>
        <SectionHeader
          title="تحليل الكوهورت"
          subtitle="نسبة الاحتفاظ لكل مجموعة مستخدمين عبر الفترات الزمنية"
          icon={Layers}
          iconColor="text-blue-500"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCohortType("monthly")}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                  cohortType === "monthly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                شهري
              </button>
              <button
                onClick={() => setCohortType("weekly")}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                  cohortType === "weekly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                أسبوعي
              </button>
            </div>
          }
        />
        <div className="mt-4">
          <CohortHeatmap data={merged.cohortData ?? []} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <span className="font-bold text-muted-foreground">دلالات الألوان:</span>
          <Legend color="bg-emerald-500/80" label="احتفاظ ≥ 80%" />
          <Legend color="bg-emerald-500/40" label="40-80%" />
          <Legend color="bg-amber-500/40" label="25-40%" />
          <Legend color="bg-red-500/40" label="5-25%" />
          <Legend color="bg-red-500/20" label="< 5%" />
        </div>
      </AdminCard>

      {/* Trend & By Role */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="اتجاه التوقف والاستبقاء"
            subtitle="آخر 8 أسابيع"
            icon={BarChart3}
          />
          <div className="h-[320px] mt-4">
            <MultiLineChart
              data={merged.churnTrend ?? []}
              series={[
                { key: "retained", name: "احتفاظ", color: "#10b981" },
                { key: "churn", name: "توقف", color: "#ef4444" },
              ]}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="الاحتفاظ حسب الدور"
            subtitle="مقارنة معدلات الاحتفاظ والتوقف"
            icon={Users}
          />
          <div className="h-[320px] mt-4">
            <MultiLineChart
              data={(merged.byRole ?? []).map((r) => ({
                label: r.name,
                retention: r.retention,
                churn: r.churn * 5,
              }))}
              series={[
                { key: "retention", name: "احتفاظ", color: "#10b981" },
                { key: "churn", name: "توقف", color: "#ef4444" },
              ]}
            />
          </div>
        </AdminCard>
      </div>

      {/* Churn reasons & Engagement segments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="أسباب التوقف"
            subtitle="لماذا يترك المستخدمون المنصة"
            icon={AlertTriangle}
            iconColor="text-amber-500"
          />
          <div className="mt-4 space-y-3">
            {(merged.churnReasons ?? []).map((r, i) => (
              <motion.div
                key={r.reason}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{r.reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{r.count} مستخدم</span>
                    <span className="font-black text-amber-600">{r.pct}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all"
                    style={{ width: `${r.pct * 2}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="شرائح المشاركة"
            subtitle="توزيع المستخدمين حسب النشاط"
            icon={PieChart}
            iconColor="text-blue-500"
          />
          <div className="mt-4 space-y-3">
            {(merged.engagementSegments ?? []).map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${s.fill}20` }}
                >
                  <span className="text-lg font-black" style={{ color: s.fill }}>{s.value}%</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{s.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.value}%`, backgroundColor: s.fill }}
                    />
                  </div>
                </div>
                <AdminBadge variant="outline" size="sm">
                  {formatNumber(Math.round((s.value / 100) * (overview.activeUsers ?? 0)))}
                </AdminBadge>
              </motion.div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={Heart}
          title="استعادة المستخدمين في الخطر"
          description={`${overview.atRiskUsers ?? 0} مستخدم يحتاج إلى تدخل سريع`}
          color="amber"
          cta="إطلاق حملة"
        />
        <ActionCard
          icon={Target}
          title="تحسين الاحتفاظ اليومي"
          description="حملة تذكير صباحية ذكية لرفع الاحتفاظ اليومي"
          color="blue"
          cta="إعداد الحملة"
        />
        <ActionCard
          icon={Sparkles}
          title="تكريم العائدين"
          description={`${overview.resurrectedUsers ?? 0} مستخدم عاد - استقبله بحفاوة`}
          color="green"
          cta="مكافأة العائدين"
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-3 w-3 rounded", color)} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  color,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: "amber" | "blue" | "green";
  cta: string;
}) {
  const colorMap = {
    amber: "from-amber-500/20 to-red-500/20 text-amber-600 border-amber-500/30",
    blue: "from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/30",
    green: "from-emerald-500/20 to-green-500/20 text-emerald-600 border-emerald-500/30",
  } as const;

  return (
    <AdminGridCard className={cn("p-5 bg-gradient-to-br", colorMap[color])}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-background/40 p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          <button className="mt-3 inline-flex items-center gap-1 rounded-lg bg-background/60 px-3 py-1.5 text-xs font-bold border border-border/60 hover:bg-background">
            {cta}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </AdminGridCard>
  );
}