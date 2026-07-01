"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Users,
  BookOpen,
  Award,
  DollarSign,
  Download,
  FileText,
  Activity,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { cn } from "@/lib/utils";

export default function CourseReportsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const reports = React.useMemo(
    () => [
      {
        title: "تقرير ملخص الدورة",
        description:
          "ملخص شامل يتضمن بيانات الطلاب، المحتوى، الإيرادات، ومؤشرات الأداء العامة للدورة.",
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        reportId: "course-summary",
        filename: `course-${courseId}-summary.pdf`,
      },
      {
        title: "تقرير الطلاب المسجلين",
        description:
          "قائمة تفصيلية للطلاب مع نسب الإنجاز، آخر النشاطات، والدرجات إن وجدت.",
        icon: Users,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        reportId: "course-students",
        filename: `course-${courseId}-students.pdf`,
      },
      {
        title: "تقرير أداء الدرجات",
        description:
          "إحصائيات درجات الدروس والامتحانات، توزيع الدرجات، وملخص النتائج.",
        icon: Award,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        reportId: "course-grades",
        filename: `course-${courseId}-grades.pdf`,
      },
      {
        title: "تقرير الإيرادات والمبيعات",
        description:
          "تقرير مالي يتضمن المبيعات، التحويلات، الإيرادات المتوقعة، وتفاصيل الدفعات.",
        icon: DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        reportId: "course-revenue",
        filename: `course-${courseId}-revenue.pdf`,
      },
    ],
    [courseId]
  );

  const stats = React.useMemo(
    () => [
      {
        label: "الطلاب المسجلين",
        value: "1,248",
        change: "+12%",
        trend: "up",
        icon: Users,
        color: "text-blue-500",
      },
      {
        label: "الدروس المكتملة",
        value: "85%",
        change: "+5%",
        trend: "up",
        icon: BookOpen,
        color: "text-violet-500",
      },
      {
        label: "متوسط الدرجات",
        value: "4.2/5",
        change: "+0.3",
        trend: "up",
        icon: Award,
        color: "text-amber-500",
      },
      {
        label: "متوقع الإيرادات",
        value: "89,500 ج.م",
        change: "+11%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-500",
      },
    ],
    []
  );

  const recentActivity = React.useMemo(
    () => [
      { action: "تسجيل 12 طالب جديد", time: "منذ ساعتين" },
      { action: "إتمام 8 دروس", time: "منذ 4 ساعات" },
      { action: "تحديث الدرجات للامتحان الأخير", time: "أمس" },
      { action: "إضافة كوبون جديد للدورة", time: "منذ يومين" },
      { action: "تحديث محتوى الوحدة الرابعة", time: "منذ 3 أيام" },
    ],
    []
  );

  const getReportUrl = (reportId: string) => {
    const base = apiRoutes.admin.report as any;
    const executeUrl = typeof base === "function" ? base(reportId) : `${base}/${reportId}`;
    // في حال كانت نقطة النهاية تتطلب تنفيذ أولاً:
    const exportUrl = `${executeUrl}/export?courseId=${encodeURIComponent(courseId)}`;
    return exportUrl;
  };

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
          <Badge variant="outline" className="h-10 rounded-xl px-4 font-bold">
            معرف الدورة: {courseId}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <AdminCard key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn("p-2 rounded-xl bg-muted/50", stat.color)}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                  stat.trend === "up"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
                )}
              >
                <ArrowUpRight className="ml-1 h-3 w-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
          </AdminCard>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {reports.map((report, i) => (
          <AdminCard key={i} className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-2xl shrink-0",
                  report.bg,
                  report.color
                )}
              >
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-black">{report.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <AdminButton
                    variant="outline"
                    className="gap-2 rounded-xl h-9 px-4 font-bold text-xs"
                    onClick={() => {
                      const url = getReportUrl(report.reportId);
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    تنزيل التقرير
                  </AdminButton>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    تنسيق PDF
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Recent Activity */}
      <AdminCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black">النشاط الأخير</h3>
            <p className="text-xs text-muted-foreground">
              آخر التحديثات والأحداث في هذه الدورة
            </p>
          </div>
          <Badge variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-black">
            <Activity className="ml-2 h-3.5 w-3.5" />
            مباشر
          </Badge>
        </div>

        <div className="space-y-4">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary/70" />
                <span className="text-xs font-bold">{item.action}</span>
              </div>
              <span className="text-[10px] font-black text-muted-foreground">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}