"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Download, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { OverallStatusBanner } from "./_components/overall-status-banner";
import { HealthStatsCards } from "./_components/health-stats-cards";
import { HealthTabs } from "./_components/health-tabs";
import { useExportHealthReport, useHealthData } from "./_hooks/useHealthData";
import type { TimeRange } from "./_types/health";

const PerformanceCharts = dynamic(
  () => import("./_components/performance-charts").then((mod) => mod.PerformanceCharts),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full animate-pulse rounded-2xl bg-muted/30" />,
  }
);

const timeRanges: Array<{ value: TimeRange; label: string }> = [
  { value: "15m", label: "آخر 15 دقيقة" },
  { value: "1h", label: "آخر ساعة" },
  { value: "6h", label: "آخر 6 ساعات" },
  { value: "24h", label: "آخر 24 ساعة" },
  { value: "7d", label: "آخر 7 أيام" },
];

export default function KingdomHealthPage() {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<TimeRange>("1h");
  const {
    data: healthData,
    dataUpdatedAt,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useHealthData(selectedTimeRange, autoRefresh);
  const exportReportMutation = useExportHealthReport();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20" dir="rtl">
        <PageHeader title="صحة خفايا المملكة" description="مراقبة شاملة لصحة النظام والامتحانات والأمان" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-border bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  const system = healthData?.system;
  const performance = healthData?.performance;
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title="صحة خفايا المملكة"
        description="لوحة لحظية لمراقبة جاهزية الخدمات والأداء والأمان والامتحانات"
      >
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <select
            aria-label="النطاق الزمني"
            value={selectedTimeRange}
            onChange={(event) => setSelectedTimeRange(event.target.value as TimeRange)}
            className="h-10 min-w-40 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-medium sm:flex-none"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <AdminButton
            variant="outline"
            icon={Download}
            onClick={() => exportReportMutation.mutate(selectedTimeRange)}
            loading={exportReportMutation.isPending}
          >
            تصدير CSV
          </AdminButton>
          <AdminButton
            variant="outline"
            icon={RefreshCw}
            onClick={() => refetch()}
            loading={isFetching}
          >
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {isError ? <WifiOff className="h-5 w-5 text-destructive" /> : <Wifi className="h-5 w-5 text-emerald-500" />}
          <div>
            <p className="text-sm font-bold">{isError ? "الاتصال متعذر" : isFetching ? "جارٍ مزامنة البيانات" : "الاتصال مستقر"}</p>
            <p className="text-xs text-muted-foreground">
              {updatedAt ? `آخر تحديث: ${updatedAt.toLocaleString("ar-EG")}` : "لم يكتمل أي تحديث بعد"}
            </p>
          </div>
        </div>
        <label htmlFor="health-auto-refresh" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          تحديث تلقائي كل 30 ثانية
          <Switch id="health-auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
        </label>
      </div>

      {isError && (
        <Alert variant="destructive" className="flex items-center gap-3 pr-4 [&>svg]:static [&>svg]:translate-y-0">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <AlertDescription className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error instanceof Error ? error.message : "تعذر تحميل بيانات المراقبة."}</span>
            <AdminButton variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>إعادة المحاولة</AdminButton>
          </AlertDescription>
        </Alert>
      )}

      {healthData && (
        <>
          {system?.overall && <OverallStatusBanner health={system.overall} />}
          <HealthStatsCards exams={healthData.exams} security={healthData.security} performance={performance} />
          <PerformanceCharts performance={performance} autoRefresh={autoRefresh} />
          <HealthTabs
            system={system}
            exams={healthData.exams}
            security={healthData.security}
            performance={performance}
          />
        </>
      )}
    </div>
  );
}
