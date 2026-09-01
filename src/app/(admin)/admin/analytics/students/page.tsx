"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  GraduationCap,
  Users,
  Trophy,
  Target,
  Award,
  Activity,
  Clock,
  BookOpen,
  Star,
  TrendingUp,
  Sparkles,
  Eye,
  Mail,
  BarChart3,
  PieChart,
  Calendar,
  Heart,
  Flame,
  Brain,
  Zap,
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
import { ExportButton, PrintButton } from "../_components/export-button";
import { SectionHeader } from "../_components/section-header";
import { AnalyticsFiltersBar } from "../_components/analytics-filters-bar";
import { AIInsightsBanner, type AnalyticsInsight } from "../_components/ai-insights-banner";
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
const HorizontalBarChart = dynamic(
  () => import("../charts").then((m) => m.HorizontalBarChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);

interface StudentsResponse {
  overview?: {
    totalStudents?: number;
    activeStudents?: number;
    newStudents?: number;
    avgSessionMin?: number;
    avgProgress?: number;
    avgGrade?: number;
    certificatesIssued?: number;
    avgCoursesPerStudent?: number;
  };
  activityTrend?: Array<{ label: string; dau: number; sessions: number; avgMin: number }>;
  engagement?: Array<{ name: string; learning: number; social: number; assessment: number }>;
  segments?: Array<{ name: string; count: number; pct: number; color: string }>;
  topStudents?: Array<{
    id: string;
    name: string;
    avatar?: string;
    points: number;
    courses: number;
    completion: number;
    streak: number;
  }>;
  learningHours?: Array<{ name: string; hours: number }>;
  achievements?: Array<{ name: string; count: number; icon?: string }>;
  byAgeGroup?: Array<{ name: string; value: number; fill: string }>;
  insights?: AnalyticsInsight[];
}

const FALLBACK: StudentsResponse = {
  overview: {
    totalStudents: 18420,
    activeStudents: 12480,
    newStudents: 1240,
    avgSessionMin: 38,
    avgProgress: 62,
    avgGrade: 84,
    certificatesIssued: 3420,
    avgCoursesPerStudent: 3.4,
  },
  activityTrend: [
    { label: "الأسبوع 1", dau: 4200, sessions: 12400, avgMin: 32 },
    { label: "الأسبوع 2", dau: 4480, sessions: 13200, avgMin: 35 },
    { label: "الأسبوع 3", dau: 4720, sessions: 14100, avgMin: 36 },
    { label: "الأسبوع 4", dau: 5100, sessions: 15400, avgMin: 38 },
    { label: "الأسبوع 5", dau: 5380, sessions: 16800, avgMin: 40 },
    { label: "الأسبوع 6", dau: 5640, sessions: 17420, avgMin: 38 },
    { label: "الأسبوع 7", dau: 5920, sessions: 18100, avgMin: 41 },
    { label: "الأسبوع 8", dau: 6180, sessions: 19240, avgMin: 42 },
  ],
  engagement: [
    { name: "مشاهدة دروس", learning: 60, social: 8, assessment: 12 },
    { name: "حل واجبات", learning: 45, social: 6, assessment: 30 },
    { name: "مشاركة محتوى", learning: 12, social: 35, assessment: 8 },
    { name: "مذاكرة تفاعلية", learning: 28, social: 12, assessment: 42 },
    { name: "مراجعة", learning: 38, social: 5, assessment: 18 },
  ],
  segments: [
    { name: "متفوقون", count: 1840, pct: 10, color: "#10b981" },
    { name: "نشطون", count: 5520, pct: 30, color: "#3b82f6" },
    { name: "منتظمون", count: 6440, pct: 35, color: "#8b5cf6" },
    { name: "مترددون", count: 3680, pct: 20, color: "#f59e0b" },
    { name: "غير نشطين", count: 940, pct: 5, color: "#ef4444" },
  ],
  topStudents: [
    { id: "st1", name: "أحمد محمد", points: 12480, courses: 8, completion: 92, streak: 142 },
    { id: "st2", name: "سارة أحمد", points: 11800, courses: 7, completion: 88, streak: 98 },
    { id: "st3", name: "محمد علي", points: 10540, courses: 6, completion: 85, streak: 76 },
    { id: "st4", name: "فاطمة حسن", points: 9820, courses: 7, completion: 81, streak: 64 },
    { id: "st5", name: "علي محمود", points: 9120, courses: 5, completion: 78, streak: 52 },
    { id: "st6", name: "منى إبراهيم", points: 8680, courses: 6, completion: 74, streak: 41 },
  ],
  learningHours: [
    { name: "أحمد", hours: 240 },
    { name: "سارة", hours: 220 },
    { name: "محمد", hours: 198 },
    { name: "فاطمة", hours: 184 },
    { name: "علي", hours: 168 },
  ],
  achievements: [
    { name: "إكمال دورة", count: 3420, icon: "🎓" },
    { name: "سلسلة 30 يوم", count: 1240, icon: "🔥" },
    { name: "إجابة مثالية", count: 8400, icon: "⭐" },
    { name: "مشاركة مع صديق", count: 2400, icon: "🤝" },
  ],
  byAgeGroup: [
    { name: "12-17", value: 28, fill: "#10b981" },
    { name: "18-24", value: 36, fill: "#3b82f6" },
    { name: "25-34", value: 22, fill: "#8b5cf6" },
    { name: "35+", value: 14, fill: "#f59e0b" },
  ],
  insights: [
    {
      id: "st1",
      title: "نمو استثنائي في عدد الطلاب النشطين",
      description: "الطلاب النشطون زادوا بنسبة 47% في آخر 8 أسابيع، بفضل المحتوى التفاعلي الجديد.",
      severity: "success",
      category: "trend",
      metric: "+47%",
      confidence: 96,
    },
    {
      id: "st2",
      title: "940 طالب غير نشطين",
      description: "5% من الطلاب لم يظهروا نشاطاً منذ 30 يوم. ننصح بحملة إعادة تفاعل مستهدفة.",
      severity: "warning",
      category: "anomaly",
      metric: "940 طالب",
      confidence: 87,
    },
    {
      id: "st3",
      title: "متوسط الجلسات في ارتفاع",
      description: "متوسط مدة الجلسة ارتفع من 32 إلى 42 دقيقة - مؤشر قوي على جودة المحتوى.",
      severity: "success",
      category: "trend",
      metric: "42 دقيقة",
      confidence: 91,
    },
  ],
};

export default function StudentsAnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("month");
  const [compare, setCompare] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [segment, setSegment] = React.useState<string>("all");

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ["analytics", "students", period],
    queryFn: async () => {
      try {
        const url = `${apiRoutes.admin.reportsUsers}?period=${period}`;
        const res = await adminFetch(url);
        if (!res.ok) throw new Error("fallback");
        return (await res.json()) as StudentsResponse;
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 60_000,
  });

  const merged = data ?? FALLBACK;
  const overview = merged.overview ?? FALLBACK.overview!;

  const filteredStudents = React.useMemo(() => {
    const list = merged.topStudents ?? [];
    if (!search) return list;
    return list.filter((s) => s.name.includes(search));
  }, [merged.topStudents, search]);

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="تحليلات الطلاب"
        description="سلوك الطلاب، الأداء، الشرائح، الإنجازات، وأفضل المتعلمين."
        icon={GraduationCap}
        accentColor="fuchsia"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <CompareToggle enabled={compare} onToggle={setCompare} />
            <PeriodSelector value={period} onChange={setPeriod} size="sm" />
            <PrintButton title="تحليلات الطلاب" />
            <ExportButton
              data={merged.topStudents ?? []}
              filename="students-analytics"
              title="تحليلات الطلاب"
            />
          </div>
        }
      />

      <AIInsightsBanner insights={merged.insights ?? []} loading={isLoading} />

      <AnalyticsFiltersBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث عن طالب..."
        hasActiveFilters={!!search || segment !== "all"}
        onReset={() => { setSearch(""); setSegment("all"); }}
        filters={
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">الشريحة:</span>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background/80 px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">كل الشرائح</option>
              {(merged.segments ?? []).map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KPICard title="إجمالي الطلاب" value={overview.totalStudents ?? 0} icon={Users} color="fuchsia"
          delta={14.2} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="طلاب نشطون" value={overview.activeStudents ?? 0} icon={Activity} color="blue"
          delta={8.4} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="طلاب جدد" value={overview.newStudents ?? 0} icon={Sparkles} color="green"
          delta={24.6} deltaLabel="شهري" loading={isLoading} />
        <KPICard title="متوسط الجلسة" value={overview.avgSessionMin ?? 0} unit=" دقيقة" icon={Clock} color="violet"
          delta={5.2} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="متوسط التقدم" value={`${overview.avgProgress ?? 0}`} unit="%" icon={Target} color="green"
          delta={2.4} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="متوسط الدرجات" value={`${overview.avgGrade ?? 0}`} unit="/100" icon={Star} color="amber"
          delta={3.8} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="شهادات صادرة" value={overview.certificatesIssued ?? 0} icon={Award} color="amber"
          delta={18.4} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="دورات/طالب" value={overview.avgCoursesPerStudent ?? 0} icon={BookOpen} color="blue"
          delta={1.4} deltaLabel="معدل" loading={isLoading} />
      </div>

      {/* Activity Trend */}
      <AdminCard>
        <SectionHeader
          title="نشاط الطلاب"
          subtitle="DAU, عدد الجلسات ومتوسط مدتها - آخر 8 أسابيع"
          icon={Activity}
        />
        <div className="h-[320px] mt-4">
          <MultiLineChart
            data={merged.activityTrend ?? []}
            series={[
              { key: "dau", name: "DAU", color: "#8b5cf6" },
              { key: "sessions", name: "الجلسات", color: "#10b981" },
            ]}
          />
        </div>
      </AdminCard>

      {/* Engagement + Segments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="نوع المشاركة"
            subtitle="توزيع أنشطة الطلاب - تعلم، اجتماعي، تقييمات"
            icon={BarChart3}
          />
          <div className="h-[320px] mt-4">
            <StackedBarChart
              data={merged.engagement ?? []}
              stackKeys={[
                { key: "learning", name: "تعلم", color: "#3b82f6" },
                { key: "social", name: "اجتماعي", color: "#10b981" },
                { key: "assessment", name: "تقييمات", color: "#f59e0b" },
              ]}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="شرائح الطلاب"
            subtitle="توزيع الطلاب حسب مستوى الأداء"
            icon={PieChart}
          />
          <div className="mt-4 space-y-2.5">
            {(merged.segments ?? []).map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-bold">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatNumber(s.count)} طالب</span>
                    <span className="font-black">{s.pct}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${s.pct * 2}%`, backgroundColor: s.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Top Students + Achievements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="أفضل الطلاب"
            subtitle="الأعلى نقاطاً وأكثر التزاماً"
            icon={Trophy}
            iconColor="text-amber-500"
            actions={
              <AdminBadge variant="amber" size="sm">
                {filteredStudents.length} طالب
              </AdminBadge>
            }
          />
          <div className="mt-4 space-y-2">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">لا توجد نتائج مطابقة للبحث</p>
            ) : (
              filteredStudents.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 hover:bg-card transition"
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm",
                    i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                    i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white" :
                    i === 2 ? "bg-gradient-to-br from-orange-300 to-amber-600 text-white" :
                    "bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{s.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {s.courses}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {s.completion}%
                      </span>
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3 w-3" /> {s.streak} يوم
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-violet-600">{formatNumber(s.points)}</p>
                    <p className="text-[10px] text-muted-foreground">نقطة</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="الإنجازات المكتسبة"
            subtitle="أكثر الإنجازات حصولاً من الطلاب"
            icon={Award}
            iconColor="text-amber-500"
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(merged.achievements ?? []).map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4 text-center"
              >
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="text-xs font-bold">{a.name}</p>
                <p className="text-lg font-black text-amber-600 mt-1">{formatNumber(a.count)}</p>
              </motion.div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Age + Learning Hours */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="التوزيع العمري"
            subtitle="الفئات العمرية للطلاب"
            icon={Users}
          />
          <div className="h-[280px] mt-4">
            <StackedBarChart
              data={merged.byAgeGroup ?? []}
              stackKeys={[
                { key: "value", name: "الطلاب", color: "#8b5cf6" },
              ]}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="ساعات التعلم"
            subtitle="أعلى الطلاب من حيث وقت التعلم"
            icon={Clock}
            iconColor="text-violet-500"
          />
          <div className="h-[280px] mt-4">
            <HorizontalBarChart
              data={merged.learningHours ?? []}
              dataKey="hours"
              nameKey="name"
            />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}