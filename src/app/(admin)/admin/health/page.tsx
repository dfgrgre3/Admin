"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, RefreshCw, Filter } from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Components
import { OverallStatusBanner } from "./_components/overall-status-banner";
import { HealthStatsCards } from "./_components/health-stats-cards";
import { PerformanceCharts } from "./_components/performance-charts";
import { HealthTabs } from "./_components/health-tabs";

// Hooks
import { useHealthData, useExportHealthReport } from "./_hooks/useHealthData";

// Types
import type { TimeRange } from "./_types/health";

export default function KingdomHealthPage() {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<TimeRange>("1h");

  const { data: healthData, isLoading, refetch } = useHealthData(selectedTimeRange, autoRefresh);
  const exportReportMutation = useExportHealthReport();

  const handleExport = async () => {
    await exportReportMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20" dir="rtl">
        <PageHeader
          title="صحة خفايا المملكة ⚔️"
          description="مراقبة شاملة لصحة النظام والامتحانات والأمان"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const system = healthData?.system;
  const exams = healthData?.exams;
  const security = healthData?.security;
  const performance = healthData?.performance;

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title="صحة خفايا المملكة ⚔️"
        description="مراقبة شاملة لصحة النظام والامتحانات والأمان والأداء"
      >
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium"
          >
            <option value="15m">آخر 15 دقيقة</option>
            <option value="1h">آخر ساعة</option>
            <option value="6h">آخر 6 ساعات</option>
            <option value="24h">آخر 24 ساعة</option>
            <option value="7d">آخر 7 أيام</option>
          </select>
          <AdminButton
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            loading={exportReportMutation.isPending}
            className="hidden md:flex"
          >
            تصدير تقرير
          </AdminButton>
          <AdminButton
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            loading={isLoading}
          >
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      {/* Overall Status Banner */}
      {system?.overall && <OverallStatusBanner health={system.overall} />}

      {/* Quick Stats */}
      <HealthStatsCards exams={exams} security={security} performance={performance} />

      {/* Performance Charts */}
      <PerformanceCharts performance={performance} />

      {/* Tabs */}
      <HealthTabs system={system} exams={exams} security={security} performance={performance} />
    </div>
  );
}