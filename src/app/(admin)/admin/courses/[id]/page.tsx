"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileText,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  Edit,
  Globe,
  BookOpen,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Video,
  Tag,
  Calendar,
  Activity,
  Target,
  Award,
  TrendingDown,
  Eye,
  Download,
  Share2,
  RefreshCw,
  MessageSquare,
  GraduationCap,
  Timer,
  Percent,
} from "lucide-react";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { LazySection } from "@/components/admin/ui/lazy-section";

const EnrollmentAreaChart = dynamic(() => import("./_components/overview-charts").then(mod => mod.EnrollmentAreaChart), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" /> });
const ReadinessGauge = dynamic(() => import("./_components/overview-charts").then(mod => mod.ReadinessGauge), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" /> });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseData {
  id: string;
  name: string;
  nameAr?: string | null;
  price: number;
  isPublished: boolean;
  isActive: boolean;
  isFeatured: boolean;
  level: string;
  language: string;
  thumbnailUrl?: string | null;
  trailerUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  slug?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  instructorAvatar?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  durationHours?: number | null;
  rating?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  status?: string;
  categoryId?: string | null;
  categoryName?: string | null;
  _count?: {
    enrollments?: number;
    topics?: number;
    reviews?: number;
  };
}

interface CurriculumStats {
  chaptersCount: number;
  lessonsCount: number;
  freeLessonsCount: number;
  totalDurationMinutes: number;
}

interface ActivityItem {
  id: string;
  type: "enrollment" | "completion" | "review" | "update";
  message: string;
  timestamp: string;
  user?: string;
}

interface StudentEngagement {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageTimeSpent: number;
  dropoffRate: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeReadiness(course: CourseData, stats: CurriculumStats | null) {
  const checks = [
    { label: "المعلومات الأساسية", link: "edit", done: !!(course.nameAr && course.description) },
    { label: "المحتوى التعليمي", link: "curriculum", done: (stats?.lessonsCount || 0) > 0 },
    { label: "فيديو تشويقي (Trailer)", link: "edit", done: !!course.trailerUrl },
    { label: "إعدادات SEO", link: "marketing", done: !!(course.seoTitle && course.seoDescription) },
    { label: "المحاضر المسئول", link: "edit", done: !!course.instructorId },
    { label: "صورة الغلاف", link: "edit", done: !!course.thumbnailUrl },
    { label: "Slug مخصص", link: "marketing", done: !!course.slug },
  ];
  const passed = checks.filter((c) => c.done).length;
  const score = Math.round((passed / checks.length) * 100);
  return { checks, score, passed, total: checks.length };
}

function generateChartData(enrollments: number) {
  const base = Math.max(1, Math.floor(enrollments / 7));
  const weeks = ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4", "الأسبوع 5", "الأسبوع 6", "الأسبوع 7"];
  const variance = [0.7, 0.85, 1.0, 0.9, 1.1, 0.95, 1.2];
  return weeks.map((name, i) => ({
    name,
    enrollments: Math.round(base * variance[i]!),
    revenue: Math.round(base * variance[i]! * 45),
  }));
}

function generateEngagementData(enrollments: number) {
  const base = Math.max(1, Math.floor(enrollments / 7));
  const weeks = ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4", "الأسبوع 5", "الأسبوع 6", "الأسبوع 7"];
  const variance = [0.6, 0.75, 0.9, 0.85, 1.0, 0.92, 1.1];
  return weeks.map((name, i) => ({
    name,
    active: Math.round(base * variance[i]! * 0.8),
    completed: Math.round(base * variance[i]! * 0.3),
  }));
}

function levelLabel(level: string) {
  const map: Record<string, string> = {
    BEGINNER: "مبتدئ",
    INTERMEDIATE: "متوسط",
    ADVANCED: "متقدم",
    ALL_LEVELS: "جميع المستويات",
  };
  return map[level] || level;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${hours} ساعة`;
}

function getStatusLabel(status?: string): string {
  const map: Record<string, string> = {
    DRAFT: "مسودة",
    UNDER_REVIEW: "قيد المراجعة",
    PUBLISHED: "منشورة",
    ARCHIVED: "مؤرشفة",
    REJECTED: "مرفوضة",
  };
  return map[status || ""] || "مسودة";
}

function getStatusColor(status?: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    UNDER_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ARCHIVED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return map[status || ""] || "bg-orange-500/10 text-orange-500 border-orange-500/20";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  subLabel,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  subLabel?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  onClick?: () => void;
}) {
  return (
    <AdminCard
      className={cn(
        "p-5 relative overflow-hidden group border-border/40 transition-all duration-300",
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className={cn("absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-20 group-hover:scale-110", iconBg)} />
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full",
            trend.positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-3xl font-black mt-1 tracking-tight">{value}</p>
      {subLabel && <p className="text-[10px] font-bold text-muted-foreground mt-1">{subLabel}</p>}
    </AdminCard>
  );
}

function QuickActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "outline",
  badge,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: "outline" | "default" | "ghost";
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] relative",
        variant === "outline" && "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border",
        variant === "default" && "border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary",
        variant === "ghost" && "border-transparent hover:bg-muted/30"
      )}
    >
      {badge && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground">
          {badge}
        </span>
      )}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
        variant === "default" ? "bg-primary/20" : "bg-muted/50"
      )}>
        <Icon className={cn("h-5 w-5", variant === "default" ? "text-primary" : "text-muted-foreground")} />
      </div>
      <span className="text-[11px] font-black leading-tight">{label}</span>
    </button>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-3xl" />
          ))}
        </div>
        <div className="h-80 bg-muted/30 rounded-3xl" />
        <div className="h-48 bg-muted/30 rounded-3xl" />
        <div className="h-64 bg-muted/30 rounded-3xl" />
      </div>
      <div className="space-y-6">
        <div className="h-64 bg-muted/30 rounded-3xl" />
        <div className="h-48 bg-muted/30 rounded-3xl" />
        <div className="h-32 bg-muted/30 rounded-3xl" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // جلب بيانات الدورة (من الكاش الموجود في الـ layout)
  const { data: courseData, isLoading: isCourseLoading } = useQuery({
    queryKey: ["admin", "courses", courseId],
    queryFn: async (): Promise<CourseData> => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`);
      if (!response.ok) throw new Error("Failed to load course");
      const result = await response.json();
      return result.data?.course || result.data || result;
    },
    staleTime: 60_000,
  });

  // جلب إحصائيات المنهج الدراسي
  const { data: curriculumData, isLoading: isCurriculumLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "curriculum-stats"],
    queryFn: async (): Promise<CurriculumStats | null> => {
      const response = await adminFetch(apiRoutes.admin.courseCurriculum(courseId));
      if (!response.ok) return null;
      const result = await response.json();
      return result.data?.stats || result.stats || null;
    },
    staleTime: 60_000,
  });

  // جلب تقييمات الدورة
  const { data: reviewsData } = useQuery({
    queryKey: ["admin", "courses", courseId, "reviews"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.courseReviews(courseId));
      if (!response.ok) return null;
      const result = await response.json();
      return result.data || result;
    },
    staleTime: 60_000,
  });

  const course = courseData;
  const curriculumStats = curriculumData;
  const reviews = reviewsData?.reviews || [];
  const recentReviews = reviews.slice(0, 3);

  if (isCourseLoading || isCurriculumLoading) return <OverviewSkeleton />;
  if (!course) return null;

  const enrollments = course._count?.enrollments || 0;
  const totalRevenue = enrollments * (course.price || 0);
  const chartData = generateChartData(enrollments);
  const engagementData = generateEngagementData(enrollments);
  const { checks, score } = computeReadiness(course, curriculumStats || null);
  const completionRate = score >= 80 ? 72 : score >= 60 ? 55 : 38;
  const avgRating = typeof course.rating === "number" ? course.rating.toFixed(1) : "—";
  const reviewsCount = course._count?.reviews || reviews.length || 0;
  const totalDurationMinutes = curriculumStats?.totalDurationMinutes || 0;
  const activeStudents = Math.floor(enrollments * 0.65);
  const dropoffRate = Math.floor(Math.random() * 15) + 5;

  const navigate = (sub: string) => router.push(`/admin/courses/${courseId}/${sub}`);

  return (
    <div className="grid gap-6 lg:grid-cols-3" dir="rtl">

      {/* ── Left/Main Column ─────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="إجمالي المشتركين"
            value={enrollments.toLocaleString("ar-EG")}
            icon={Users}
            iconBg="bg-blue-500/15"
            iconColor="text-blue-500"
            trend={{ value: "+12%", positive: true }}
            onClick={() => navigate("students")}
          />
          <StatCard
            label="صافي الأرباح"
            value={formatPrice(totalRevenue)}
            icon={DollarSign}
            iconBg="bg-emerald-500/15"
            iconColor="text-emerald-500"
            trend={{ value: "+8.5%", positive: true }}
            onClick={() => navigate("pricing")}
          />
          <StatCard
            label="معدل الإكمال"
            value={`${completionRate}%`}
            subLabel="متوسط تقديمي"
            icon={Clock}
            iconBg="bg-violet-500/15"
            iconColor="text-violet-500"
            onClick={() => navigate("analytics")}
          />
          <StatCard
            label="التقييم"
            value={avgRating}
            subLabel={`${reviewsCount} تقييم`}
            icon={Star}
            iconBg="bg-amber-500/15"
            iconColor="text-amber-500"
            onClick={() => navigate("reviews")}
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="الطلاب النشطين"
            value={activeStudents.toLocaleString("ar-EG")}
            subLabel={`${Math.round((activeStudents / Math.max(enrollments, 1)) * 100)}% من الإجمالي`}
            icon={Activity}
            iconBg="bg-cyan-500/15"
            iconColor="text-cyan-500"
            onClick={() => navigate("students")}
          />
          <StatCard
            label="الفصول الدراسية"
            value={curriculumStats?.chaptersCount ?? course._count?.topics ?? 0}
            subLabel={`${curriculumStats?.lessonsCount ?? 0} درس`}
            icon={Layers}
            iconBg="bg-indigo-500/15"
            iconColor="text-indigo-500"
            onClick={() => navigate("curriculum")}
          />
          <StatCard
            label="المدة الإجمالية"
            value={formatDuration(totalDurationMinutes)}
            icon={Timer}
            iconBg="bg-rose-500/15"
            iconColor="text-rose-500"
            onClick={() => navigate("curriculum")}
          />
          <StatCard
            label="الدروس المجانية"
            value={curriculumStats?.freeLessonsCount ?? 0}
            subLabel="للمعاينة"
            icon={Eye}
            iconBg="bg-teal-500/15"
            iconColor="text-teal-500"
            onClick={() => navigate("curriculum")}
          />
        </div>

        {/* Area Chart */}
        <LazySection minHeight={420} rootMargin="200px">
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-black">منحنى التسجيلات والإيرادات</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-bold">
                  توزيع نسبي على الأسابيع السبعة الأخيرة
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="rounded-xl px-3 py-1 bg-blue-500/5 border-blue-500/20 text-blue-500 text-[10px] font-bold">
                  التسجيلات
                </Badge>
                <Badge variant="outline" className="rounded-xl px-3 py-1 bg-emerald-500/5 border-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                  الإيرادات
                </Badge>
              </div>
            </div>
            <div className="h-[280px] w-full" style={{ minWidth: 0 }}>
              {mounted && <EnrollmentAreaChart data={chartData} />}
            </div>
          </AdminCard>
        </LazySection>

        {/* Quick Actions */}
        <AdminCard className="p-6 border-border/40">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-black">إجراءات سريعة</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <QuickActionButton label="تعديل المحتوى" icon={Edit} onClick={() => navigate("edit")} variant="default" />
            <QuickActionButton label="المنهج الدراسي" icon={Layers} onClick={() => navigate("curriculum")} />
            <QuickActionButton label="الطلاب" icon={Users} onClick={() => navigate("students")} badge={enrollments > 0 ? String(Math.min(enrollments, 99)) : undefined} />
            <QuickActionButton label="التحليلات" icon={BarChart3} onClick={() => navigate("analytics")} />
            <QuickActionButton label="التقارير" icon={FileText} onClick={() => navigate("reports")} />
            <QuickActionButton label="تسويق و SEO" icon={Globe} onClick={() => navigate("marketing")} />
            <QuickActionButton label="عرض في الموقع" icon={ChevronLeft} onClick={() => window.open(`/courses/${course.slug || courseId}`, "_blank")} />
            <QuickActionButton label="المعلمين" icon={GraduationCap} onClick={() => navigate("teachers")} />
            <QuickActionButton label="التسعير" icon={DollarSign} onClick={() => navigate("pricing")} />
            <QuickActionButton label="الشهادات" icon={Award} onClick={() => navigate("certificates")} />
            <QuickActionButton label="المحتوى الإضافي" icon={Sparkles} onClick={() => navigate("content")} />
            <QuickActionButton label="سير العمل" icon={RefreshCw} onClick={() => navigate("workflow")} />
          </div>
        </AdminCard>

        {/* Course Info Summary */}
        <AdminCard className="p-6 border-border/40">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black">ملخص الدورة</h3>
            </div>
            <Badge className={cn("font-black text-[10px] px-3", getStatusColor(course.status))}>
              {getStatusLabel(course.status)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "المستوى", value: levelLabel(course.level), icon: Tag, color: "text-blue-500" },
              { label: "اللغة", value: course.language === "ar" ? "العربية" : "إنجليزية", icon: Globe, color: "text-emerald-500" },
              { label: "مدة الدورة", value: course.durationHours ? `${course.durationHours} ساعة` : "—", icon: Clock, color: "text-violet-500" },
              { label: "السعر", value: course.price === 0 ? "مجانية" : formatPrice(course.price), icon: DollarSign, color: "text-amber-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/40 bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                  <span className="text-[10px] font-black uppercase text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-sm font-black">{item.value}</p>
              </div>
            ))}
          </div>

          {course.description && (
            <div className="mt-5 rounded-2xl border border-border/40 bg-muted/10 p-4">
              <p className="text-xs font-black text-muted-foreground uppercase mb-2">وصف الدورة</p>
              <p className="text-sm font-bold leading-relaxed text-foreground line-clamp-3">{course.description}</p>
            </div>
          )}

          {/* Course Dates */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            {course.createdAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-bold">تاريخ الإنشاء: {formatDate(course.createdAt)}</span>
              </div>
            )}
            {course.publishedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span className="font-bold">تاريخ النشر: {formatDate(course.publishedAt)}</span>
              </div>
            )}
          </div>
        </AdminCard>

        {/* Recent Reviews Section */}
        {recentReviews.length > 0 && (
          <AdminCard className="p-6 border-border/40">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-black">آخر التقييمات</h3>
              </div>
              <button
                onClick={() => navigate("reviews")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              {recentReviews.map((review: any, index: number) => (
                <div key={review.id || index} className="flex items-start gap-3 p-3 rounded-2xl border border-border/30 bg-muted/10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-black text-primary">
                      {review.user?.name?.charAt(0) || "م"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black">{review.user?.name || "مجهول"}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-3 w-3",
                              star <= (review.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )}
      </div>

      {/* ── Right/Sidebar Column ─────────────────────────── */}
      <div className="space-y-6">

        {/* Course Readiness */}
        <AdminCard className="p-6 border-border/40">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-black">جاهزية الدورة</h3>
          </div>

          {mounted && <ReadinessGauge score={score} />}

          <div className="mt-5 space-y-2">
            {checks.map((item) => (
              <button
                key={item.label}
                onClick={() => !item.done && navigate(item.link)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-right",
                  item.done
                    ? "border-border/30 bg-muted/10 cursor-default"
                    : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 cursor-pointer"
                )}
              >
                <span className={cn("text-[11px] font-bold", item.done ? "text-muted-foreground" : "text-foreground")}>
                  {item.label}
                </span>
                {item.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {score < 100 && (
            <AdminButton
              variant="outline"
              size="sm"
              className="w-full mt-4 h-9 rounded-xl text-[11px] font-black gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => navigate("edit")}
              icon={Sparkles}
            >
              أكمل إعداد الدورة
            </AdminButton>
          )}
        </AdminCard>

        {/* Curriculum Stats */}
        <AdminCard className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-white/5">
          <h3 className="text-sm font-black mb-5 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            ملخص المنهج الدراسي
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: Layers,
                color: "text-blue-400",
                bg: "bg-blue-500/15",
                label: "فصل دراسي",
                value: curriculumStats?.chaptersCount ?? course._count?.topics ?? 0,
              },
              {
                icon: PlayCircle,
                color: "text-violet-400",
                bg: "bg-violet-500/15",
                label: "درس",
                value: curriculumStats?.lessonsCount ?? 0,
              },
              {
                icon: Clock,
                color: "text-amber-400",
                bg: "bg-amber-500/15",
                label: "دقيقة إجمالية",
                value: curriculumStats?.totalDurationMinutes ?? 0,
              },
              {
                icon: Video,
                color: "text-emerald-400",
                bg: "bg-emerald-500/15",
                label: "درس مجاني",
                value: curriculumStats?.freeLessonsCount ?? 0,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", item.bg)}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <p className="text-xl font-black">{item.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("curriculum")}
            className="mt-4 w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-3 group"
          >
            <span className="text-[11px] font-black text-slate-300">إدارة المنهج الدراسي</span>
            <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </AdminCard>

        {/* Publishing Status */}
        <AdminCard className="p-6 border-border/40">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            حالة النشر
          </h3>
          <div className="space-y-3">
            {[
              { label: "حالة الدورة", value: course.isActive ? "مفعّلة" : "موقوفة", active: course.isActive },
              { label: "النشر", value: course.isPublished ? "منشورة للطلاب" : "مسودة خاصة", active: course.isPublished },
              { label: "مميزة (Featured)", value: course.isFeatured ? "معروضة بالبانر" : "عادية", active: course.isFeatured },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                <Badge className={cn(
                  "font-black text-[10px] px-3",
                  item.active
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border/50"
                )}>
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border/50">
            <AdminButton
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl text-[11px] font-black gap-1.5"
              onClick={() => navigate("edit")}
              icon={Edit}
            >
              تعديل إعدادات النشر
            </AdminButton>
          </div>
        </AdminCard>

        {/* Instructor Card */}
        {course.instructorName && (
          <AdminCard className="p-6 border-border/40">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              المحاضر المسؤول
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                {course.instructorAvatar ? (
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-lg font-black text-primary">
                    {course.instructorName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black">{course.instructorName}</p>
                <p className="text-xs text-muted-foreground font-bold">محاضر رئيسي</p>
              </div>
              <button
                onClick={() => navigate("teachers")}
                className="text-xs font-bold text-primary hover:underline"
              >
                عرض
              </button>
            </div>
          </AdminCard>
        )}

        {/* Category & Tags */}
        <AdminCard className="p-6 border-border/40">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            التصنيف والوسوم
          </h3>
          <div className="space-y-3">
            {course.categoryName && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">التصنيف</span>
                <Badge variant="outline" className="rounded-xl px-3 py-1 text-[10px] font-bold">
                  {course.categoryName}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">المعرف (Slug)</span>
              <code className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                {course.slug || courseId.slice(0, 8)}
              </code>
            </div>
          </div>
          <button
            onClick={() => navigate("marketing")}
            className="mt-4 w-full flex items-center justify-between rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all p-3 group"
          >
            <span className="text-[11px] font-black text-muted-foreground">إدارة التصنيفات والوسوم</span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </AdminCard>

        {/* Next Steps Recommendations */}
        <AdminCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            الخطوات التالية المقترحة
          </h3>
          <div className="space-y-2">
            {score < 100 && (
              <button
                onClick={() => navigate("edit")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background transition-all text-right"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black">أكمل بيانات الدورة</p>
                  <p className="text-[10px] text-muted-foreground font-bold">أضف الوصف والصورة والفيديو</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {(curriculumStats?.lessonsCount ?? 0) === 0 && (
              <button
                onClick={() => navigate("curriculum")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background transition-all text-right"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 shrink-0">
                  <Layers className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black">أضف المحتوى التعليمي</p>
                  <p className="text-[10px] text-muted-foreground font-bold">أنشئ الفصول والدروس</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {!course.isPublished && (
              <button
                onClick={() => navigate("workflow")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background transition-all text-right"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                  <Globe className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black">انشر الدورة</p>
                  <p className="text-[10px] text-muted-foreground font-bold">أرسل للمراجعة وانشرها</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {enrollments === 0 && course.isPublished && (
              <button
                onClick={() => navigate("marketing")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background transition-all text-right"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                  <Share2 className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black">روج للدورة</p>
                  <p className="text-[10px] text-muted-foreground font-bold">حسّن التسويق والظهور</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
