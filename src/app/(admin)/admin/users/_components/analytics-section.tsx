"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, ChartBar, ChartDonut, ChartMultiLine } from "@/components/shared/charts";
import { Bookmark } from "lucide-react";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { EmptyState } from "@/components/shared/empty-state";

export function AnalyticsSection() {
  const { data: analytics, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "users", "analytics"],
    queryFn: () => adminUsersApi.getAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">تحليلات المستخدمين</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
              <div className="h-[200px] bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">تحليلات المستخدمين</h3>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "تعذر تحميل التحليلات. يرجى التأكد من تشغيل الخادم."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">تحليلات المستخدمين</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            محدث مباشر
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-sm">نمو المستخدمين</h4>
            <span className="text-xs text-green-500 font-bold">+12%</span>
          </div>
          <ChartLine
            data={analytics.growth || []}
            dataKey="users"
            color="#3b82f6"
            height={200}
          />
        </div>

        {/* Registration Trend */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-sm">اتجاه التسجيل</h4>
            <span className="text-xs text-green-500 font-bold">+8%</span>
          </div>
          <ChartBar
            data={analytics.registrations || []}
            dataKey="registrations"
            color="#10b981"
            height={200}
          />
        </div>

        {/* Users by Role */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-sm">المستخدمين حسب الدور</h4>
            <span className="text-xs text-muted-foreground">إجمالي الأدوار</span>
          </div>
          <ChartDonut
            data={analytics.roles || []}
            dataKey="value"
            height={200}
          />
        </div>

        {/* Users by Country */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-sm">المستخدمين حسب الدولة</h4>
            <span className="text-xs text-muted-foreground">أعلى 10 دول</span>
          </div>
          <ChartBar
            data={analytics.countries || []}
            dataKey="users"
            color="#f97316"
            height={200}
            horizontal
          />
        </div>
      </div>

      {/* Login Activity */}
      <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black text-sm">نشاط تسجيل الدخول</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">آخر 30 يوم</span>
            <span className="text-xs text-green-500 font-bold">+15%</span>
          </div>
        </div>
        <ChartMultiLine
          data={analytics.loginActivity || []}
          lines={[
            { dataKey: "logins", color: "#3b82f6", name: "تسجيلات الدخول" },
          ]}
          height={200}
        />
      </div>
    </div>
  );
}