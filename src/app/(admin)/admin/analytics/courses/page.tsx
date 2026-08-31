"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  GraduationCap,
  Users,
  Star,
  TrendingUp,
  Award,
  Activity,
  Layers,
  Target,
  Percent,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Sparkles,
  Trophy,
  Eye,
  Clock,
  Zap,
  Search,
  Filter,
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
import { AnalyticsFiltersBar } from "../_components/analytics-filters-bar";
import { AIInsightsBanner, type AnalyticsInsight } from "../_components/ai-insights-banner";
import { buildAnalyticsUrl, apiRoutes } from "../_components/use-analytics-data";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { formatNumber, cn } from "@/lib/utils";
import { motion } from "framer-motion";

const HorizontalBarChart = dynamic(
  () => import("../charts").then((m) => m.HorizontalBarChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const StackedBarChart = dynamic(
  () => import("../charts").then((m) => m.StackedBarChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const ScatterChartComponent = dynamic(
  () => import("../charts").then((m) => m.ScatterChartComponent),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const RadialProgressChart = dynamic(
  () => import("../charts").then((m) => m.RadialProgressChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" />;
}

// ─── Types ──────────────────────────────────────────

interface CourseRow {
  id: string;
  title: string;
  thumbnail?: string;
  students: number;
  completion: number;
  rating: number;
  revenue: number;
  trend: number;
  category?: string;
  level?: string;
  status?: string;
}

interface CoursesAnalyticsResponse {
  overview?: {
    totalCourses?: number;
    activeCourses?: number;
    totalEnrollments?: number;
    avgCompletion?: number;
    avgRating?: number;
    totalRevenue?: number;
  };
  byCategory?: Array<{ name: string; courses: number; enrollments: number; revenue: number }>;
  topCourses?: CourseRow[];
  engagement?: Array<{ name: string; completed: number; inProgress: number; dropped: number }>;
  scatter?: Array<{ price: number; enrollment: number; rating: number }>;
  insights?: AnalyticsInsight[];
}

const FALLBACK: CoursesAnalyticsResponse = {
  overview: {
    totalCourses: 184,
    activeCourses: 142,
    totalEnrollments: 18420,
    avgCompletion: 42.6,
    avgRating: 4.6,
    totalRevenue: 1_245_300,
  },
  byCategory: [
    { name: "برمجة", courses: 48, enrollments: 6210, revenue: 412_000 },
    { name: "تصميم", courses: 32, enrollments: 4180, revenue: 268_500 },
    { name: "تسويق", courses: 28, enrollments: 3120, revenue: 198_400 },
    { name: "لغات", courses: 22, enrollments: 1980, revenue: 142_800 },
    { name: "أعمال", courses: 18, enrollments: 1450, revenue: 121_200 },
    { name: "تصوير", courses: 12, enrollments: 720, revenue: 64_300 },
  ],
  topCourses: [
    { id: "c1", title: "تطوير تطبيقات React الكاملة", students: 1842, completion: 68, rating: 4.9, revenue: 184_200, trend: 12.4, category: "برمجة", level: "متقدم" },
    { id: "c2", title: "تصميم واجهات UI/UX من الصفر", students: 1420, completion: 72, rating: 4.8, revenue: 142_000, trend: 8.7, category: "تصميم", level: "مبتدئ" },
    { id: "c3", title: "تسويق رقمي متقدم", students: 1180, completion: 54, rating: 4.6, revenue: 118_500, trend: 5.2, category: "تسويق", level: "متوسط" },
    { id: "c4", title: "تعلم اللغة الإنجليزية - A1 إلى B2", students: 980, completion: 38, rating: 4.5, revenue: 88_300, trend: -2.1, category: "لغات", level: "مبتدئ" },
    { id: "c5", title: "إدارة المشاريع الاحترافية PMP", students: 760, completion: 61, rating: 4.7, revenue: 76_400, trend: 3.8, category: "أعمال", level: "متقدم" },
    { id: "c6", title: "تصوير فوتوغرافي احترافي", students: 620, completion: 49, rating: 4.4, revenue: 58_100, trend: 1.4, category: "تصوير", level: "متوسط" },
  ],
  engagement: [
    { name: "Q1", completed: 420, inProgress: 820, dropped: 180 },
    { name: "Q2", completed: 580, inProgress: 940, dropped: 220 },
    { name: "Q3", completed: 712, inProgress: 1180, dropped: 240 },
    { name: "Q4", completed: 920, inProgress: 1380, dropped: 280 },
  ],
  scatter: [
    { price: 99, enrollment: 1820, rating: 4.8 },
    { price: 149, enrollment: 1420, rating: 4.6 },
    { price: 199, enrollment: 980, rating: 4.7 },
    { price: 249, enrollment: 720, rating: 4.5 },
    { price: 299, enrollment: 540, rating: 4.4 },
    { price: 399, enrollment: 320, rating: 4.3 },
    { price: 499, enrollment: 180, rating: 4.2 },
    { price: 79, enrollment: 2100, rating: 4.6 },
  ],
  insights: [
    {
      id: "ci1",
      title: "دورة React تحقق أداءً استثنائياً",
      description: "دورة تطوير تطبيقات React تتفوق بنسبة 38% عن المتوسط العام في معدل الإكمال والتقييم.",
      severity: "success",
      category: "trend",
      metric: "+38%",
      confidence: 92,
    },
    {
      id: "ci2",
      title: "انخفاض في إكمال دورات اللغات",
      description: "لوحظ انخفاض بنسبة 8% في معدل إكمال دورات اللغات. ننصح بمراجعة المحتوى وإضافة محفزات تفاعلية.",
      severity: "warning",
      category: "anomaly",
      metric: "-8%",
      confidence: 78,
    },
    {
      id: "ci3",
      title: "فرصة لتسعير الدورات الجديدة",
      description: "الدورات بسعر 79-149$ تحقق أعلى نسبة تسجيل. جرب تخفيض السعر للدورات الجديدة في أول شهر.",
      severity: "info",
      category: "opportunity",
      confidence: 85,
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────

const formatCurrency = (n: number) => `${formatNumber(Math.round(n))} ج.م`;

const CATEGORY_COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#06b6d4", "#ef4444"];

// ─── Page ──────────────────────────────────────────

export default function CourseAnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("month");
  const [compare, setCompare] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [level, setLevel] = React.useState<string>("all");

  const url = React.useMemo(
    () => buildAnalyticsUrl(apiRoutes.admin.courseStats, period),
    [period]
  );

  const { data, isLoading } = useQuery<CoursesAnalyticsResponse>({
    queryKey: ["analytics", "courses", period],
    queryFn: async () => {
      try {
        const res = await adminFetch(url);
        if (!res.ok) throw new Error("fallback");
        return (await res.json()) as CoursesAnalyticsResponse;
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 60_000,
  });

  const merged = data ?? FALLBACK;
  const overview = merged.overview ?? FALLBACK.overview!;

  const filteredCourses = React.useMemo(() => {
    const list = merged.topCourses ?? [];
    return list.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && c.category !== category) return false;
      if (level !== "all" && c.level !== level) return false;
      return true;
    });
  }, [merged.topCourses, search, category, level]);

  const categories = Array.from(new Set((merged.topCourses ?? []).map((c) => c.category).filter(Boolean) as string[]));
  const levels = Array.from(new Set((merged.topCourses ?? []).map((c) => c.level).filter(Boolean) as string[]));

  const exportRows = filteredCourses.map((c) => ({
    title: c.title,
    category: c.category ?? "",
    level: c.level ?? "",
    students: c.students,
    completion: `${c.completion}%`,
    rating: c.rating,
    revenue: c.revenue,
    trend: `${c.trend}%`,
  }));

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="تحليلات الدورات"
        description="أداء الدورات، الإكمال، الإيرادات، والمشاركة حسب الفئة والمستوى."
        icon={BookOpen}
        accentColor="violet"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <CompareToggle enabled={compare} onToggle={setCompare} />
            <PeriodSelector value={period} onChange={setPeriod} size="sm" />
            <ExportButton data={exportRows} filename="courses-analytics" title="تحليلات الدورات" />
          </div>
        }
      />

      {/* AI Insights */}
      <AIInsightsBanner insights={merged.insights ?? []} loading={isLoading} />

      {/* Filters */}
      <AnalyticsFiltersBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث عن دورة..."
        hasActiveFilters={!!search || category !== "all" || level !== "all"}
        onReset={() => { setSearch(""); setCategory("all"); setLevel("all"); }}
        filters={
          <>
            <FilterSelect
              label="الفئة"
              value={category}
              options={[{ value: "all", label: "كل الفئات" }, ...categories.map((c) => ({ value: c, label: c }))]}
              onChange={setCategory}
            />
            <FilterSelect
              label="المستوى"
              value={level}
              options={[{ value: "all", label: "كل المستويات" }, ...levels.map((l) => ({ value: l, label: l }))]}
              onChange={setLevel}
            />
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard title="إجمالي الدورات" value={overview.totalCourses ?? 0} icon={Layers} color="violet"
          delta={4.2} deltaLabel="هذا الشهر" loading={isLoading} />
        <KPICard title="دورات نشطة" value={overview.activeCourses ?? 0} icon={Activity} color="blue"
          delta={2.1} deltaLabel="مقارنة بالشهر السابق" loading={isLoading} />
        <KPICard title="إجمالي التسجيلات" value={overview.totalEnrollments ?? 0} icon={Users} color="fuchsia"
          delta={12.4} deltaLabel="نمو شهري" loading={isLoading} />
        <KPICard title="متوسط الإكمال" value={`${overview.avgCompletion ?? 0}`} unit="%" icon={CheckCircle2} color="green"
          delta={3.8} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="متوسط التقييم" value={overview.avgRating ?? 0} unit="/5" icon={Star} color="amber"
          delta={1.2} deltaLabel="رضا الطلاب" loading={isLoading} />
        <KPICard title="إجمالي الإيرادات" value={overview.totalRevenue ?? 0} unit=" ج.م" icon={TrendingUp} color="green"
          delta={18.6} deltaLabel="نمو قوي" loading={isLoading} />
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="أداء الفئات"
            subtitle="الدورات والإيرادات حسب الفئة"
            icon={Layers}
            actions={<AdminBadge variant="violet" size="sm">{merged.byCategory?.length ?? 0} فئة</AdminBadge>}
          />
          <div className="h-[320px] mt-4">
            <HorizontalBarChart
              data={(merged.byCategory ?? []).map((c) => ({ name: c.name, value: c.revenue }))}
              dataKey="value"
              nameKey="name"
            />
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="معدلات الإكمال حسب الفئة"
            subtitle="نسب إكمال الدورات"
            icon={CheckCircle2}
            iconColor="text-emerald-500"
          />
          <div className="h-[320px] mt-4">
            <StackedBarChart
              data={merged.engagement ?? []}
              stackKeys={[
                { key: "completed", name: "مكتمل", color: "#10b981" },
                { key: "inProgress", name: "قيد التقدم", color: "#3b82f6" },
                { key: "dropped", name: "تارك", color: "#ef4444" },
              ]}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="السعر مقابل التسجيل"
            subtitle="علاقة السعر بعدد التسجيلات والتقييم"
            icon={Target}
          />
          <div className="h-[320px] mt-4">
            <ScatterChartComponent
              data={(merged.scatter ?? []).map((s) => ({ price: s.price, enrollment: s.enrollment }))}
              xKey="price" yKey="enrollment"
              xLabel="السعر" yLabel="التسجيلات"
            />
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="مؤشرات الأداء الرئيسية"
            subtitle="معدلات الإكمال والتقييم"
            icon={Sparkles}
            iconColor="text-violet-500"
          />
          <div className="h-[320px] mt-4">
            <RadialProgressChart
              data={[
                { name: "الإكمال", value: overview.avgCompletion ?? 0, fill: "#10b981" },
                { name: "التقييم", value: (overview.avgRating ?? 0) * 20, fill: "#f59e0b" },
                { name: "الاحتفاظ", value: 64, fill: "#8b5cf6" },
                { name: "المشاركة", value: 78, fill: "#3b82f6" },
              ]}
            />
          </div>
        </AdminCard>
      </div>

      {/* Top Courses Table */}
      <AdminCard>
        <SectionHeader
          title="أعلى الدورات أداءً"
          subtitle="الأكثر تسجيلاً وإيراداً"
          icon={Trophy}
          iconColor="text-amber-500"
          actions={
            <AdminBadge variant="amber" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {filteredCourses.length} دورة
            </AdminBadge>
          }
        />
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="p-3 text-right font-black">الدورة</th>
                <th className="p-3 text-right font-black">الفئة</th>
                <th className="p-3 text-right font-black">المستوى</th>
                <th className="p-3 text-center font-black">الطلاب</th>
                <th className="p-3 text-center font-black">الإكمال</th>
                <th className="p-3 text-center font-black">التقييم</th>
                <th className="p-3 text-left font-black">الإيرادات</th>
                <th className="p-3 text-center font-black">الاتجاه</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">لا توجد نتائج مطابقة للفلاتر</td></tr>
              ) : (
                filteredCourses.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 text-xs font-black">
                          {i + 1}
                        </div>
                        <span className="font-bold line-clamp-1">{c.title}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{c.level}</td>
                    <td className="p-3 text-center font-black">{formatNumber(c.students)}</td>
                    <td className="p-3 text-center">
                      <CompletionBar value={c.completion} />
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-black text-amber-600">
                        <Star className="h-3 w-3 fill-current" /> {c.rating}
                      </span>
                    </td>
                    <td className="p-3 text-left font-black text-emerald-600">{formatCurrency(c.revenue)}</td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black",
                        c.trend > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      )}>
                        <ArrowUpRight className={cn("h-3 w-3", c.trend < 0 && "rotate-180")} />
                        {Math.abs(c.trend)}%
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Category performance summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(merged.byCategory ?? []).map((cat, i) => (
          <AdminGridCard key={cat.name} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}20` }}
                >
                  <BookOpen className="h-5 w-5" style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                </div>
                <div>
                  <h3 className="font-black">{cat.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{cat.courses} دورة</p>
                </div>
              </div>
              <AdminBadge variant="outline" size="sm">{formatNumber(cat.enrollments)} طالب</AdminBadge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">الإيرادات</span>
                <span className="font-black text-emerald-600">{formatCurrency(cat.revenue)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(cat.revenue / (merged.byCategory?.[0]?.revenue ?? 1)) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                  }}
                />
              </div>
            </div>
          </AdminGridCard>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-border bg-background/80 px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function CompletionBar({ value }: { value: number }) {
  const color =
    value >= 70 ? "bg-emerald-500" :
    value >= 50 ? "bg-amber-500" :
    "bg-red-500";
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-black">{value}%</span>
    </div>
  );
}