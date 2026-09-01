"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useServiceHealthHistory } from "./_hooks/use-service-health-history";
import { ServiceStatusHeader } from "./_components/service-status-header";
import { ServiceSummaryCards } from "./_components/service-summary-cards";
import { ServiceHistoryChart } from "./_components/service-history-chart";
import { ServiceIncidentsList } from "./_components/service-incidents-list";
import type { TimeRange } from "../_types/health";

// The known service keys probed by the backend (dashboardServiceChecks in
// admin_dashboard_v1_health.go). Kept in sync manually — there is no shared
// generated type between the Go and TS codebases for this small enum.
const KNOWN_SERVICES = new Set([
  "database",
  "cache",
  "storage",
  "search",
  "queue",
  "scheduler",
  "api",
]);

const timeRanges: Array<{ value: TimeRange; label: string }> = [
  { value: "15m", label: "آخر 15 دقيقة" },
  { value: "1h", label: "آخر ساعة" },
  { value: "6h", label: "آخر 6 ساعات" },
  { value: "24h", label: "آخر 24 ساعة" },
  { value: "7d", label: "آخر 7 أيام" },
];

export default function ServiceHealthDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceKey = typeof params.service === "string" ? params.service : "";

  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<TimeRange>("1h");

  React.useEffect(() => {
    if (serviceKey && !KNOWN_SERVICES.has(serviceKey)) {
      router.replace("/admin/health");
    }
  }, [serviceKey, router]);

  const isKnownService = KNOWN_SERVICES.has(serviceKey);
  const { data, isLoading, isError, error, isFetching, refetch } = useServiceHealthHistory(
    isKnownService ? serviceKey : "",
    selectedTimeRange,
    autoRefresh
  );

  if (!isKnownService) return null;

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title={data?.service.name ?? "تفاصيل الخدمة"}
        description="سجل تاريخي حقيقي لحالة الخدمة ووقت استجابتها، مبني على فحوصات دورية فعلية"
      >
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <Link href="/admin/health">
            <AdminButton variant="outline" icon={ArrowRight}>
              رجوع لصحة النظام
            </AdminButton>
          </Link>
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
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isFetching ? "جارٍ مزامنة البيانات" : "الاتصال مستقر"}
        </p>
        <label htmlFor="service-health-auto-refresh" className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          تحديث تلقائي كل 30 ثانية
          <Switch id="service-health-auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted/30" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl border border-border bg-muted/30" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-muted/30" />
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="flex items-center gap-3 pr-4 [&>svg]:static [&>svg]:translate-y-0">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <AlertDescription className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error instanceof Error ? error.message : "تعذر تحميل سجل الخدمة."}</span>
            <AdminButton variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>إعادة المحاولة</AdminButton>
          </AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <ServiceStatusHeader serviceName={data.service.name} current={data.current} />
          <ServiceSummaryCards
            uptimePercent={data.summary.uptimePercent}
            avgLatencyMs={data.summary.avgLatencyMs}
            incidentCount={data.summary.incidentCount}
          />
          <ServiceHistoryChart history={data.history} />
          <ServiceIncidentsList history={data.history} />
        </>
      ) : null}
    </div>
  );
}
