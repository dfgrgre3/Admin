"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, Users, ArrowLeft, TrendingUp, Award, Star } from "lucide-react";
import { useDashboardTopCourses, type DashboardTopCourse } from "@/hooks/dashboard/use-dashboard-top-courses";

const METRIC_LABELS: Record<string, string> = {
  enrollment: "التسجيلات",
  completion: "الإكمال",
  rating: "التقييم",
};

const METRIC_ICONS: Record<string, React.ElementType> = {
  enrollment: Users,
  completion: TrendingUp,
  rating: Star,
};

function formatMetricValue(course: DashboardTopCourse, metric: string): string {
  switch (metric) {
    case "completion":
      return `${Math.round(course.value)}%`;
    case "rating":
      return course.value.toFixed(1);
    default:
      return course.value.toLocaleString("ar-EG");
  }
}

export const TopCoursesSection = React.memo(function TopCoursesSection() {
  const { courses, totalCount, metric, isLoading, isError, canViewTopCourses } = useDashboardTopCourses("enrollment");

  if (!canViewTopCourses) return null;

  const MetricIcon = METRIC_ICONS[metric] ?? Users;

  return (
    <div className="admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">الدورات الأفضل أداءً</h3>
              <p className="text-sm text-gray-400">الترتيب حسب {METRIC_LABELS[metric] ?? "الأداء"}</p>
            </div>
          </div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
          >
            عرض الكل ({totalCount.toLocaleString("ar-EG")})
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3" aria-busy="true" aria-label="جاري تحميل الدورات الأفضل">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-14 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300" role="alert">
            تعذّر تحميل الدورات الأفضل أداءً. حاول تحديث الصفحة.
          </div>
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
            لا توجد بيانات كافية لعرض ترتيب الدورات.
          </div>
        )}

        {!isLoading && !isError && courses.length > 0 && (
          <div className="space-y-2">
            {courses.map((course, index) => (
              <a
                key={course.courseId}
                href={course.actionUrl}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-black/10 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-black text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{course.title}</p>
                  <p className="truncate text-[11px] text-gray-500">{course.category || "غير مصنّفة"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <MetricIcon className="h-3.5 w-3.5" />
                    {formatMetricValue(course, metric)}
                  </div>
                  {course.deltaPercentage != null && (
                    <span
                      className={`text-[11px] font-bold ${course.deltaPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {course.deltaPercentage >= 0 ? "+" : ""}{course.deltaPercentage}%
                    </span>
                  )}
                </div>
                <Award className="h-4 w-4 text-gray-600 group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});