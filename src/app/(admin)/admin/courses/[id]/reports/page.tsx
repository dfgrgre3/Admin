"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  BookOpen,
  Award,
  DollarSign,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { parseContentDispositionFilename } from "@/lib/export-utils";
import { cn, formatPrice } from "@/lib/utils";

interface OverviewStats {
  totalEnrollments: number;
  activeStudents: number;
  completedStudents: number;
  completionRate: number;
  dropoffRate: number;
  totalRevenue: number;
  avgScore: number | null;
  gradedResults: number;
  growth: { enrollments: number };
}

export default function CourseReportsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "overview-stats"],
    queryFn: async (): Promise<OverviewStats | null> => {
      const response = await adminFetch(apiRoutes.admin.courseOverviewStats(courseId));
      if (!response.ok) return null;
      const result = await response.json();
      return result.data?.stats || result.stats || null;
    },
    staleTime: 60_000,
  });

  const cards = React.useMemo(
    () => [
      {
        label: "الطلاب المسجلين",
        value: stats ? stats.totalEnrollments.toLocaleString("ar-EG") : "—",
        change: stats?.growth?.enrollments ?? null,
        icon: Users,
        color: "text-blue-500",
      },
      {
        label: "متوسط الإنجاز",
        value: stats ? `${stats.completionRate}%` : "—",
        change: null,
        icon: BookOpen,
        color: "text-violet-500",
      },
      {
        label: "متوسط الدرجات",
        value:
          stats && stats.avgScore !== null && stats.avgScore !== undefined
            ? `${stats.avgScore}%`
            : "لا توجد نتائج",
        change: null,
        icon: Award,
        color: "text-amber-500",
      },
      {
        label: "الإيرادات المقدرة",
        value: stats ? formatPrice(stats.totalRevenue) : "—",
        change: null,
        icon: DollarSign,
        color: "text-emerald-500",
      },
    ],
    [stats]
  );

  const handleStudentsExport = React.useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await adminFetch(
        `${apiRoutes.admin.courseStudents(courseId)}/export`
      );
      if (!response.ok) throw new Error("تعذر تصدير تقرير الطلاب");

      const filename = parseContentDispositionFilename(
        response.headers.get("content-disposition"),
        `course-students-${new Date().toISOString().slice(0, 10)}.csv`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير تقرير الطلاب");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsExporting(false);
    }
  }, [courseId, isExporting]);

  const reports = React.useMemo(
    () => [
      {
        title: "تقرير الطلاب المسجلين",
        description:
          "قائمة تفصيلية للطلاب مع نسب الإنجاز، عدد الدروس المكتملة، وآخر نشاط لكل طالب.",
        icon: Users,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        format: "CSV",
        available: true,
        onDownload: handleStudentsExport,
      },
      {
        title: "تقرير ملخص الدورة",
        description:
          "ملخص شامل يتضمن بيانات الطلاب، المحتوى، الإيرادات، ومؤشرات الأداء العامة للدورة.",
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        format: "PDF",
        available: false,
      },
      {
        title: "تقرير أداء الدرجات",
        description:
          "إحصائيات درجات الامتحانات، توزيع الدرجات، وملخص نتائج الطلاب.",
        icon: Award,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        format: "PDF",
        available: false,
      },
      {
        title: "تقرير الإيرادات والمبيعات",
        description:
          "تقرير مالي يتضمن المبيعات وتفاصيل الدفعات — يحتاج ربط بوابة الدفع.",
        icon: DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        format: "PDF",
        available: false,
      },
    ],
    [handleStudentsExport]
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="h-10 rounded-xl px-4 border-primary/20 bg-primary/5 text-primary font-bold"
          >
            <BarChart3 className="ml-2 h-4 w-4" />
            تقارير وتحليلات
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <AdminCard key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl bg-muted/50", card.color)}>
                <card.icon className="h-5 w-5" />
              </div>
              {!isLoading && card.change !== null && (
                <div
                  className={cn(
                    "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                    card.change >= 0
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  )}
                >
                  {card.change >= 0 ? (
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="ml-1 h-3 w-3" />
                  )}
                  {card.change > 0 ? "+" : ""}
                  {card.change}%
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              {card.label}
            </p>
            <h3 className="text-2xl font-black mt-1">
              {isLoading ? "..." : card.value}
            </h3>
          </AdminCard>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {reports.map((report, i) => (
          <AdminCard key={i} className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-2xl shrink-0", report.bg, report.color)}>
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black">{report.title}</h3>
                  {!report.available && (
                    <Badge
                      variant="outline"
                      className="h-6 rounded-lg px-2 text-[10px] font-black text-muted-foreground"
                    >
                      قريباً
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <AdminButton
                    variant="outline"
                    className="gap-2 rounded-xl h-9 px-4 font-bold text-xs"
                    disabled={!report.available || isExporting}
                    onClick={report.onDownload}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {report.available && isExporting ? "جارٍ التصدير..." : "تنزيل التقرير"}
                  </AdminButton>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    تنسيق {report.format}
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
