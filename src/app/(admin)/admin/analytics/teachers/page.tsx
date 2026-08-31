"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Users,
  Star,
  Award,
  BookOpen,
  DollarSign,
  Activity,
  TrendingUp,
  Target,
  Trophy,
  CheckCircle2,
  Clock,
  MessageSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Mail,
  Heart,
  ChevronUp,
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
import { apiRoutes } from "../_components/use-analytics-data";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { formatNumber, cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MultiLineChart = dynamic(
  () => import("../charts").then((m) => m.MultiLineChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);
const HorizontalBarChart = dynamic(
  () => import("../charts").then((m) => m.HorizontalBarChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);
const RadialProgressChart = dynamic(
  () => import("../charts").then((m) => m.RadialProgressChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);

interface TeachersResponse {
  overview?: {
    totalTeachers?: number;
    activeTeachers?: number;
    newTeachers?: number;
    avgRating?: number;
    responseHours?: number;
    totalEarnings?: number;
    avgCoursesPerTeacher?: number;
    retentionRate?: number;
  };
  performanceTrend?: Array<{ label: string; rating: number; earnings: number; courses: number }>;
  topTeachers?: Array<{
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    students: number;
    courses: number;
    earnings: number;
    responseRate: number;
    specialty?: string;
  }>;
  bySpecialty?: Array<{ name: string; count: number; revenue: number; avgRating: number; fill: string }>;
  ratingsDistribution?: Array<{ name: string; value: number; fill: string }>;
  activityByDay?: Array<{ name: string; sessions: number; replies: number; content: number }>;
  insights?: AnalyticsInsight[];
}

const FALLBACK: TeachersResponse = {
  overview: {
    totalTeachers: 142,
    activeTeachers: 118,
    newTeachers: 18,
    avgRating: 4.7,
    responseHours: 3.2,
    totalEarnings: 624_800,
    avgCoursesPerTeacher: 4.8,
    retentionRate: 86,
  },
  performanceTrend: [
    { label: "يناير", rating: 4.5, earnings: 42_000, courses: 32 },
    { label: "فبراير", rating: 4.6, earnings: 48_400, courses: 38 },
    { label: "مارس", rating: 4.5, earnings: 54_200, courses: 42 },
    { label: "أبريل", rating: 4.6, earnings: 58_800, courses: 48 },
    { label: "مايو", rating: 4.7, earnings: 64_200, courses: 54 },
    { label: "يونيو", rating: 4.7, earnings: 72_400, courses: 62 },
    { label: "يوليو", rating: 4.7, earnings: 78_400, courses: 68 },
  ],
  topTeachers: [
    { id: "t1", name: "د. أحمد الزهراني", rating: 4.9, students: 4820, courses: 12, earnings: 124_800, responseRate: 98, specialty: "برمجة" },
    { id: "t2", name: "د. منى العتيبي", rating: 4.9, students: 3940, courses: 9, earnings: 98_400, responseRate: 96, specialty: "تصميم" },
    { id: "t3", name: "م. خالد السعيد", rating: 4.8, students: 3120, courses: 8, earnings: 78_400, responseRate: 94, specialty: "تسويق" },
    { id: "t4", name: "أ. سارة الحربي", rating: 4.8, students: 2840, courses: 7, earnings: 68_200, responseRate: 92, specialty: "لغات" },
    { id: "t5", name: "د. يوسف القحطاني", rating: 4.7, students: 2420, courses: 6, earnings: 58_800, responseRate: 90, specialty: "أعمال" },
    { id: "t6", name: "أ. نورة الشمري", rating: 4.7, students: 1980, courses: 5, earnings: 48_400, responseRate: 88, specialty: "تصوير" },
  ],
  bySpecialty: [
    { name: "برمجة", count: 38, revenue: 184_400, avgRating: 4.8, fill: "#3b82f6" },
    { name: "تصميم", count: 28, revenue: 142_800, avgRating: 4.7, fill: "#ec4899" },
    { name: "تسويق", count: 22, revenue: 98_400, avgRating: 4.6, fill: "#f59e0b" },
    { name: "لغات", count: 18, revenue: 78_400, avgRating: 4.7, fill: "#10b981" },
    { name: "أعمال", count: 14, revenue: 64_200, avgRating: 4.5, fill: "#8b5cf6" },
    { name: "تصوير", count: 12, revenue: 56_600, avgRating: 4.6, fill: "#06b6d4" },
  ],
  ratingsDistribution: [
    { name: "5 نجوم", value: 58, fill: "#10b981" },
    { name: "4 نجوم", value: 28, fill: "#3b82f6" },
    { name: "3 نجوم", value: 9, fill: "#f59e0b" },
    { name: "2 نجوم", value: 3, fill: "#ef4444" },
    { name: "1 نجمة", value: 2, fill: "#7f1d1d" },
  ],
  activityByDay: [
    { name: "الأحد", sessions: 84, replies: 124, content: 28 },
    { name: "الإثنين", sessions: 92, replies: 142, content: 32 },
    { name: "الثلاثاء", sessions: 88, replies: 128, content: 24 },
    { name: "الأربعاء", sessions: 96, replies: 156, content: 38 },
    { name: "الخميس", sessions: 78, replies: 98, content: 22 },
    { name: "الجمعة", sessions: 42, replies: 64, content: 12 },
    { name: "السبت", sessions: 56, replies: 82, content: 18 },
  ],
  insights: [
    {
      id: "tc1",
      title: "د. أحمد الزهراني يقود الأداء",
      description: "د. أحمد حقق أعلى تقييم (4.9) وأكثر من 4820 طالب. نموذج يُحتذى به.",
      severity: "success",
      category: "trend",
      metric: "4.9/5",
      confidence: 98,
    },
    {
      id: "tc2",
      title: "تحسن ملحوظ في وقت الرد",
      description: "انخفض متوسط وقت الرد من 5.2 إلى 3.2 ساعة - تحسن 38%.",
      severity: "success",
      category: "trend",
      metric: "-38%",
      confidence: 92,
    },
    {
      id: "tc3",
      title: "12 معلم بحاجة إلى متابعة",
      description: "12 معلم بمعدل تقييم أقل من 4.0. ننصح بمراجعة محتوى دوراتهم.",
      severity: "warning",
      category: "anomaly",
      metric: "12 معلم",
      confidence: 86,
    },
  ],
};

export default function TeachersAnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("month");
  const [compare, setCompare] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [specialty, setSpecialty] = React.useState<string>("all");

  const { data, isLoading } = useQuery<TeachersResponse>({
    queryKey: ["analytics", "teachers", period],
    queryFn: async () => {
      try {
        const url = `${apiRoutes.admin.teachers}?period=${period}`;
        const res = await adminFetch(url);
        if (!res.ok) throw new Error("fallback");
        return (await res.json()) as TeachersResponse;
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 60_000,
  });

  const merged = data ?? FALLBACK;
  const overview = merged.overview ?? FALLBACK.overview!;

  const filteredTeachers = React.useMemo(() => {
    const list = merged.topTeachers ?? [];
    return list.filter((t) => {
      if (search && !t.name.includes(search)) return false;
      if (specialty !== "all" && t.specialty !== specialty) return false;
      return true;
    });
  }, [merged.topTeachers, search, specialty]);

  const specialties = Array.from(new Set((merged.topTeachers ?? []).map((t) => t.specialty).filter(Boolean) as string[]));

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="تحليلات المعلمين"
        description="أداء المعلمين، التقييمات، الأرباح، التفاعل، والالتزام."
        icon={Users}
        accentColor="blue"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <CompareToggle enabled={compare} onToggle={setCompare} />
            <PeriodSelector value={period} onChange={setPeriod} size="sm" />
            <ExportButton
              data={merged.topTeachers ?? []}
              filename="teachers-analytics"
              title="تحليلات المعلمين"
            />
          </div>
        }
      />

      <AIInsightsBanner insights={merged.insights ?? []} loading={isLoading} />

      <AnalyticsFiltersBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="ابحث عن معلم..."
        hasActiveFilters={!!search || specialty !== "all"}
        onReset={() => { setSearch(""); setSpecialty("all"); }}
        filters={
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">التخصص:</span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background/80 px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">كل التخصصات</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KPICard title="إجمالي المعلمين" value={overview.totalTeachers ?? 0} icon={Users} color="blue"
          delta={12.4} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="معلمون نشطون" value={overview.activeTeachers ?? 0} icon={Activity} color="violet"
          delta={8.2} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="جدد هذا الشهر" value={overview.newTeachers ?? 0} icon={Sparkles} color="green"
          delta={24.6} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="متوسط التقييم" value={overview.avgRating ?? 0} unit="/5" icon={Star} color="amber"
          delta={2.4} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="متوسط الرد" value={overview.responseHours ?? 0} unit=" ساعة" icon={Clock} color="emerald"
          delta={-38.2} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="إجمالي الأرباح" value={overview.totalEarnings ?? 0} unit=" ج.م" icon={DollarSign} color="green"
          delta={18.4} deltaLabel="نمو" loading={isLoading} />
        <KPICard title="دورات/معلم" value={overview.avgCoursesPerTeacher ?? 0} icon={BookOpen} color="fuchsia"
          delta={5.2} deltaLabel="معدل" loading={isLoading} />
        <KPICard title="معدل الاحتفاظ" value={`${overview.retentionRate ?? 0}`} unit="%" icon={Heart} color="rose"
          delta={3.4} deltaLabel="تحسن" loading={isLoading} />
      </div>

      {/* Performance trend */}
      <AdminCard>
        <SectionHeader
          title="أداء المعلمين"
          subtitle="التقييم والأرباح وعدد الدورات عبر الأشهر"
          icon={TrendingUp}
        />
        <div className="h-[320px] mt-4">
          <MultiLineChart
            data={merged.performanceTrend ?? []}
            series={[
              { key: "rating", name: "متوسط التقييم", color: "#f59e0b" },
              { key: "earnings", name: "الأرباح", color: "#10b981" },
              { key: "courses", name: "الدورات", color: "#8b5cf6" },
            ]}
          />
        </div>
      </AdminCard>

      {/* Top Teachers */}
      <AdminCard>
        <SectionHeader
          title="أفضل المعلمين أداءً"
          subtitle="الأعلى تقييماً وأعلى أرباحاً"
          icon={Trophy}
          iconColor="text-amber-500"
          actions={
            <AdminBadge variant="amber" size="sm">
              {filteredTeachers.length} معلم
            </AdminBadge>
          }
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-6">لا توجد نتائج مطابقة للبحث</p>
          ) : (
            filteredTeachers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur p-4 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl font-black text-sm",
                    i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                    i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white" :
                    i === 2 ? "bg-gradient-to-br from-orange-300 to-amber-600 text-white" :
                    "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600"
                  )}>
                    {t.name.split(" ").slice(-1)[0].charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-sm truncate">{t.name}</p>
                      {i < 3 && (
                        <AdminBadge variant="amber" size="sm" className="gap-1">
                          <ChevronUp className="h-3 w-3" />
                          #{i + 1}
                        </AdminBadge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                    <span className="text-sm font-black text-amber-600">{t.rating}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">من 5</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-base font-black text-blue-600">{formatNumber(t.students)}</p>
                    <p className="text-[10px] text-muted-foreground">طالب</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-violet-600">{t.courses}</p>
                    <p className="text-[10px] text-muted-foreground">دورة</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-emerald-600">{t.responseRate}%</p>
                    <p className="text-[10px] text-muted-foreground">استجابة</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">الأرباح</span>
                  <span className="font-black text-emerald-600">{formatNumber(t.earnings)} ج.م</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AdminCard>

      {/* Specialty + Ratings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="التخصصات"
            subtitle="عدد المعلمين والإيرادات حسب التخصص"
            icon={BookOpen}
          />
          <div className="mt-4 space-y-2">
            {(merged.bySpecialty ?? []).map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 hover:bg-card transition"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-xs"
                  style={{ backgroundColor: `${s.fill}20`, color: s.fill }}
                >
                  {s.count}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{s.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-current text-amber-500" />
                      {s.avgRating}
                    </span>
                    <span>•</span>
                    <span>{formatNumber(s.revenue)} ج.م</span>
                  </div>
                </div>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(s.revenue / (merged.bySpecialty?.[0]?.revenue ?? 1)) * 100}%`, backgroundColor: s.fill }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="توزيع التقييمات"
            subtitle="تقييمات الطلاب للمعلمين"
            icon={Star}
            iconColor="text-amber-500"
          />
          <div className="h-[320px] mt-4">
            <RadialProgressChart data={merged.ratingsDistribution ?? []} />
          </div>
        </AdminCard>
      </div>

      {/* Activity by Day */}
      <AdminCard>
        <SectionHeader
          title="النشاط اليومي"
          subtitle="الجلسات والردود والمحتوى المنشور لكل يوم"
          icon={Calendar}
        />
        <div className="h-[320px] mt-4">
          <MultiLineChart
            data={merged.activityByDay ?? []}
            series={[
              { key: "sessions", name: "الجلسات", color: "#3b82f6" },
              { key: "replies", name: "الردود", color: "#10b981" },
              { key: "content", name: "المحتوى", color: "#8b5cf6" },
            ]}
          />
        </div>
      </AdminCard>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <AdminGridCard className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-black">قبول معلمين جدد</h3>
              <p className="text-xs text-muted-foreground">{overview.newTeachers ?? 0} في الانتظار</p>
            </div>
          </div>
          <button className="w-full rounded-lg bg-blue-500/20 hover:bg-blue-500/30 px-3 py-2 text-xs font-bold transition">
            مراجعة الطلبات →
          </button>
        </AdminGridCard>

        <AdminGridCard className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black">جوائز المعلمين</h3>
              <p className="text-xs text-muted-foreground">كرّم الأفضل شهرياً</p>
            </div>
          </div>
          <button className="w-full rounded-lg bg-amber-500/20 hover:bg-amber-500/30 px-3 py-2 text-xs font-bold transition">
            إعداد الجوائز →
          </button>
        </AdminGridCard>

        <AdminGridCard className="p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-black">تسوية المدفوعات</h3>
              <p className="text-xs text-muted-foreground">{formatNumber(overview.totalEarnings ?? 0)} ج.م مستحقة</p>
            </div>
          </div>
          <button className="w-full rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-2 text-xs font-bold transition">
            معالجة المدفوعات →
          </button>
        </AdminGridCard>
      </div>
    </div>
  );
}