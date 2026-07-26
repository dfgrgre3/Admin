"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { BookOpen, FileText, Clock, Users, TrendingUp, Award, CheckCircle, AlertCircle } from "lucide-react";

interface CourseAnalyticsProps {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  reviewCourses: number;
  totalLessons: number;
  totalEnrollments: number;
  averageCompletion: number;
  averageRating: number;
  activeCourses: number;
  archivedCourses: number;
  className?: string;
}

export function CourseAnalytics({
  totalCourses,
  publishedCourses,
  draftCourses,
  reviewCourses,
  totalLessons,
  totalEnrollments,
  averageCompletion,
  averageRating,
  activeCourses,
  archivedCourses,
  className
}: CourseAnalyticsProps) {
  return (
    <AdminCard variant="glass" className={`border-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>تحليلات الكورسات</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>محدث تلقائياً</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="إجمالي الكورسات"
          value={totalCourses.toLocaleString()}
          icon={BookOpen}
          color="blue"
          description={`${publishedCourses} منشورة`}
        />
        <AdminStatsCard
          title="الدروس"
          value={totalLessons.toLocaleString()}
          icon={FileText}
          color="green"
          description="درس إجمالي"
        />
        <AdminStatsCard
          title="الاشتراكات"
          value={totalEnrollments.toLocaleString()}
          icon={Users}
          color="purple"
          description="طالب مشترك"
        />
        <AdminStatsCard
          title="معدل الإكمال"
          value={`${averageCompletion}%`}
          icon={CheckCircle}
          color="amber"
          description="متوسط الإكمال"
        />
      </div>

      {/* Course Status Breakdown */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">منشورة</p>
              <p className="text-xl font-black text-green-500">{publishedCourses}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">مسودة</p>
              <p className="text-xl font-black text-amber-500">{draftCourses}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">قيد المراجعة</p>
              <p className="text-xl font-black text-purple-500">{reviewCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-bold">متوسط التقييم</span>
            </div>
            <span className="text-2xl font-black text-primary">{averageRating}/5</span>
          </div>
        </div>
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-bold">كورسات نشطة</span>
            </div>
            <span className="text-2xl font-black text-primary">{activeCourses}</span>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
