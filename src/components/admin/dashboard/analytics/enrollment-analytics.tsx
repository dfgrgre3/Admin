"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Users, UserCheck, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnrollmentAnalyticsProps {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  pendingEnrollments: number;
  newEnrollmentsToday: number;
  newEnrollmentsThisWeek: number;
  newEnrollmentsThisMonth: number;
  enrollmentGrowthRate: number;
  averageEnrollmentTime: number;
  retentionRate: number;
  className?: string;
}

export function EnrollmentAnalytics({
  totalEnrollments,
  activeEnrollments,
  completedEnrollments,
  pendingEnrollments,
  newEnrollmentsToday,
  newEnrollmentsThisWeek,
  newEnrollmentsThisMonth,
  enrollmentGrowthRate,
  averageEnrollmentTime,
  retentionRate,
  className
}: EnrollmentAnalyticsProps) {
  return (
    <AdminCard variant="glass" className={`border-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span>تحليلات الاشتراكات</span>
        </h3>
        <div className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold",
          enrollmentGrowthRate >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {enrollmentGrowthRate >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(enrollmentGrowthRate)}% نمو
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="إجمالي الاشتراكات"
          value={totalEnrollments.toLocaleString()}
          icon={Users}
          color="blue"
          description="اشتراك إجمالي"
          trend={{
            value: newEnrollmentsThisWeek,
            isPositive: newEnrollmentsThisWeek > 0,
            label: "جديد هذا الأسبوع"
          }}
        />
        <AdminStatsCard
          title="اشتراكات نشطة"
          value={activeEnrollments.toLocaleString()}
          icon={UserCheck}
          color="green"
          description="قيد الدراسة"
        />
        <AdminStatsCard
          title="مكتملة"
          value={completedEnrollments.toLocaleString()}
          icon={TrendingUp}
          color="purple"
          description="أتموا الدراسة"
        />
        <AdminStatsCard
          title="معلقة"
          value={pendingEnrollments.toLocaleString()}
          icon={Clock}
          color="amber"
          description="بانتظار الموافقة"
        />
      </div>

      {/* Enrollment Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">جديد اليوم</span>
            </div>
            <span className="text-xl font-black text-primary">{newEnrollmentsToday}</span>
          </div>
        </div>
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">جديد هذا الشهر</span>
            </div>
            <span className="text-xl font-black text-primary">{newEnrollmentsThisMonth}</span>
          </div>
        </div>
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">متوسط مدة الاشتراك</span>
            </div>
            <span className="text-xl font-black text-primary">{averageEnrollmentTime} يوم</span>
          </div>
        </div>
      </div>

      {/* Retention Rate */}
      <div className="mt-4 p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">معدل الاحتفاظ</p>
              <p className="text-2xl font-black text-green-500">{retentionRate}%</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">نسبة الطلاب الذين يكملون الكورسات</p>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
