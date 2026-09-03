"use client";

import * as React from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Download,
  FileClock,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ApiLogEntry, ApiLogsFilters } from "./_lib/constants";
import { generateApiLogs, getApiKeysList } from "./_lib/mock-generator";
import { computeStats } from "./_lib/stats";
import { downloadCsv, formatNumber } from "./_lib/utils";

import { ApiLogsStatsCards } from "./_components/stats-cards";
import {
  ApiLogsTimelineChart,
  ApiLogsLatencyChart,
} from "./_components/timeline-chart";
import {
  ApiEndpointsBreakdown,
  ApiKeysBreakdown,
  ApiCategoryBreakdown,
  ApiStatusBreakdown,
} from "./_components/endpoint-breakdown";
import { ApiLogsFiltersBar } from "./_components/filters-bar";
import { ApiLogsTable, ApiLogDetailDialog } from "./_components/logs-table";

// ─── Page-level constants ─────────────────────────────────────

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "2xx", label: "ناجح" },
  { value: "4xx", label: "أخطاء عميل" },
  { value: "5xx", label: "أخطاء خادم" },
];

const PAGE_SIZE = 25;

const DEFAULT_FILTERS: ApiLogsFilters = {
  search: "",
  statusGroup: "all",
  method: "all",
  category: "all",
  severity: "all",
  apiKeyId: "",
  startDate: "",
  endDate: "",
  minResponseTime: null,
  rateLimitedOnly: false,
  errorsOnly: false,
};

// ─── Helpers ─────────────────────────────────────────────────

function applyFilters(logs: ApiLogEntry[], filters: ApiLogsFilters): ApiLogEntry[] {
  return logs.filter((log) => {
    if (filters.statusGroup !== "all" && log.statusGroup !== filters.statusGroup) return false;
    if (filters.method !== "all" && log.method !== filters.method) return false;
    if (filters.category !== "all" && log.category !== filters.category) return false;
    if (filters.severity !== "all" && log.severity !== filters.severity) return false;
    if (filters.apiKeyId && log.apiKeyId !== filters.apiKeyId) return false;
    if (filters.minResponseTime !== null && log.responseTimeMs < filters.minResponseTime) return false;
    if (filters.rateLimitedOnly && !log.rateLimited) return false;
    if (filters.errorsOnly && log.statusGroup !== "4xx" && log.statusGroup !== "5xx") return false;

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      if (new Date(log.timestamp).getTime() < start) return false;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime() + 24 * 60 * 60 * 1000;
      if (new Date(log.timestamp).getTime() > end) return false;
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const haystack = [
        log.endpoint,
        log.userName,
        log.userId,
        log.ip,
        log.errorMessage,
        log.errorCode,
        log.apiKeyName,
        log.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

// ─── Page Skeleton ────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <Skeleton className="h-28 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Quick Insights Banner ────────────────────────────────────

function InsightsBanner({
  stats,
}: {
  stats: ReturnType<typeof computeStats>;
}) {
  const hasErrors = stats.byStatus["5xx"] > 0;
  const hasSlowRequests = stats.p95ResponseTimeMs > 2000;
  const hasRateLimits = stats.rateLimitedCount > 10;

  if (!hasErrors && !hasSlowRequests && !hasRateLimits) {
    return (
      <AdminCard variant="glass" className="p-4 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-sm">كل شيء يعمل بشكل ممتاز</h3>
            <p className="text-xs text-muted-foreground mt-1">
              معدل النجاح {stats.successRate.toFixed(2)}% • متوسط الاستجابة{" "}
              {Math.round(stats.avgResponseTimeMs)}ms • لا توجد مشاكل حرجة
            </p>
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard variant="glass" className="p-4 border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-500/15 p-2 text-amber-500">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm">تنبيهات الأداء</h3>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {hasErrors && (
              <li className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {stats.byStatus["5xx"]} خطأ خادم ({((stats.byStatus["5xx"] / stats.total) * 100).toFixed(2)}%)
              </li>
            )}
            {hasSlowRequests && (
              <li className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                P95 زمن الاستجابة تجاوز {Math.round(stats.p95ResponseTimeMs)}ms
              </li>
            )}
            {hasRateLimits && (
              <li className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                {stats.rateLimitedCount} طلب تم رفضه بسبب تجاوز حد المعدل
              </li>
            )}
          </ul>
        </div>
      </div>
    </AdminCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function ApiLogsPage() {
  const [logs, setLogs] = React.useState<ApiLogEntry[]>([]);
  const [filters, setFilters] = React.useState<ApiLogsFilters>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedLog, setSelectedLog] = React.useState<ApiLogEntry | null>(null);
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [seed, setSeed] = React.useState(42);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const apiKeys = React.useMemo(() => getApiKeysList(), []);

  // Initial load (simulated latency)
  React.useEffect(() => {
    setInitialLoading(true);
    const t = setTimeout(() => {
      setLogs(generateApiLogs(320, seed));
      setInitialLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [seed]);

  // Auto refresh (regenerate with new seed to simulate live data)
  React.useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      setIsRefreshing(true);
      setSeed((s) => s + 7);
      setTimeout(() => setIsRefreshing(false), 300);
    }, 8000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  // Reset page on filter change
  React.useEffect(() => {
    setPage(1);
  }, [filters, activeTab]);

  // Tab overrides status filter
  const effectiveFilters = React.useMemo<ApiLogsFilters>(() => {
    if (activeTab === "all") return filters;
    return { ...filters, statusGroup: activeTab as ApiLogsFilters["statusGroup"] };
  }, [filters, activeTab]);

  const filteredLogs = React.useMemo(
    () => applyFilters(logs, effectiveFilters),
    [logs, effectiveFilters]
  );

  const stats = React.useMemo(() => computeStats(filteredLogs), [filteredLogs]);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const pagedLogs = React.useMemo(
    () => filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredLogs, page]
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSeed((s) => s + 3);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("تم تحديث السجلات");
    }, 350);
  };

  const handleExportAll = () => {
    const rows: string[][] = [
      [
        "المعرّف",
        "الطابع الزمني",
        "الطريقة",
        "المسار",
        "كود الحالة",
        "زمن الاستجابة (ms)",
        "المستخدم",
        "IP",
      ],
      ...filteredLogs.map((l) => [
        l.id,
        l.timestamp,
        l.method,
        l.endpoint,
        String(l.statusCode),
        String(l.responseTimeMs),
        l.userName,
        l.ip,
      ]),
    ];
    downloadCsv(`api-logs-full-${new Date().toISOString().split("T")[0]}.csv`, rows);
    toast.success(`تم تصدير ${formatNumber(filteredLogs.length)} سجل`);
  };

  if (initialLoading) return <PageSkeleton />;

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        eyebrow="المطورين"
        title="سجلات API"
        description="مراقبة شاملة لجميع طلبات واجهات برمجة التطبيقات. تتبع الأداء، رصد الأخطاء، تحليل حركة المرور ومراقبة مفاتيح الوصول."
        icon={FileClock}
        badge="live"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              icon={autoRefresh ? Loader2 : Activity}
              onClick={() => setAutoRefresh((v) => !v)}
              loading={autoRefresh}
            >
              {autoRefresh ? "التحديث التلقائي مفعّل" : "تفعيل التحديث التلقائي"}
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              تحديث
            </AdminButton>
            <AdminButton variant="gradient" size="sm" icon={Download} onClick={handleExportAll}>
              تصدير الكل
            </AdminButton>
          </div>
        }
      />

      <InsightsBanner stats={stats} />

      {/* Stats Cards */}
      <ApiLogsStatsCards stats={stats} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApiLogsTimelineChart data={stats.byHour} />
        </div>
        <ApiLogsLatencyChart data={stats.byHour} />
      </div>

      {/* Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-4">
        <ApiStatusBreakdown data={stats.byStatus} total={stats.total} />
        <ApiCategoryBreakdown data={stats.byCategory} total={stats.total} />
        <ApiEndpointsBreakdown items={stats.byEndpoint} total={stats.total} />
        <ApiKeysBreakdown items={stats.mostActiveKeys} />
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50 p-1 flex-wrap h-auto">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? logs.length
                : stats.byStatus[tab.value as keyof typeof stats.byStatus] ?? 0;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
              >
                {tab.label}
                <AdminBadge
                  variant="outline"
                  status={
                    tab.value === "all"
                      ? "info"
                      : tab.value === "2xx"
                      ? "success"
                      : tab.value === "4xx"
                      ? "warning"
                      : "error"
                  }
                  className="text-[10px]"
                >
                  {formatNumber(count)}
                </AdminBadge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <ApiLogsFiltersBar
        filters={filters}
        apiKeys={apiKeys}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Logs Table */}
      <AnimatePresence mode="wait">
        <m.div
          key={`${activeTab}-${filters.search}-${filters.statusGroup}-${filters.method}-${filters.category}-${filters.severity}-${filters.apiKeyId}-${page}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <ApiLogsTable
            logs={pagedLogs}
            page={page}
            pageSize={PAGE_SIZE}
            total={filteredLogs.length}
            onPageChange={(p) => {
              setPage(p);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            onView={setSelectedLog}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </m.div>
      </AnimatePresence>

      {/* Empty footer info */}
      {filteredLogs.length > 0 && (
        <AdminCard variant="flat" className="p-3 text-center text-xs text-muted-foreground">
          يتم عرض {pagedLogs.length} من {formatNumber(filteredLogs.length)} سجل بعد تطبيق الفلاتر • آخر تحديث قبل لحظة
        </AdminCard>
      )}

      {/* Detail Dialog */}
      <ApiLogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}