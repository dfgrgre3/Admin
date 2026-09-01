"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Ban,
  CheckCircle2,
  FileX2,
  Clock,
  Activity,
  ListChecks,
  ShieldCheck,
  BarChart3,
  Filter as FilterIcon,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn, formatNumber } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { logAdminAction } from "@/lib/admin-audit";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

import {
  type AntiCheatFlag,
  type AntiCheatFlagResponse,
  type AntiCheatStatus,
  STATUS_CONFIG,
  STATUS_ORDER,
  riskLevel,
  formatDateTime,
  AntiCheatEvent,
} from "./_components/types";
import { StatsCards } from "./_components/stats-cards";
import { FlagDetailDialog } from "./_components/flag-detail-dialog";
import { EventsView } from "./_components/events-view";
import { TrendChart } from "./_components/trend-chart";
import { HeatmapView } from "./_components/heatmap-view";
import { FilterDrawer } from "./_components/filter-drawer";
import { useAntiCheatFilters } from "./_hooks/use-anti-cheat-filters";
import { REFRESH_INTERVALS } from "./_lib/constants";
import { summarizeFlagsByDay } from "./_lib/utils";
import { AnimatePresence, m } from "framer-motion";

// ─────────────────────────────────────────────
//  شريط التنقل بين الصفحات الفرعية
// ─────────────────────────────────────────────
const SUB_PAGES = [
  {
    href: "/admin/anti-cheat",
    label: "الحالات",
    icon: ShieldAlert,
    color: "text-red-500",
    description: "مراجعة حالات الغش",
  },
  {
    href: "/admin/anti-cheat/policies",
    label: "السياسات والقواعد",
    icon: ListChecks,
    color: "text-blue-500",
    description: "إدارة قواعد الكشف",
  },
  {
    href: "/admin/anti-cheat/analytics",
    label: "التحليلات",
    icon: BarChart3,
    color: "text-purple-500",
    description: "إحصاءات وتقارير متقدمة",
  },
  {
    href: "/admin/anti-cheat/whitelist",
    label: "القائمة البيضاء",
    icon: ShieldCheck,
    color: "text-emerald-500",
    description: "الاستثناءات والتصاريح",
  },
];

// ─────────────────────────────────────────────
//  مكون بطاقة التنقل الفرعي
// ─────────────────────────────────────────────
function SubPageNav({ current }: { current: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SUB_PAGES.map((p) => {
        const isActive = current === p.href;
        const Icon = p.icon;
        return (
          <Link
            key={p.href}
            href={p.href}
            className={cn(
              "admin-glass group relative overflow-hidden rounded-2xl border p-4 transition-all",
              "hover:scale-[1.02] hover:shadow-xl",
              isActive
                ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10",
                    p.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black">{p.label}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className={cn(
                  "h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
                  isActive && "opacity-100"
                )}
              />
            </div>
            {isActive && (
              <m.div
                layoutId="subnav-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-transparent"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  الصفحة الرئيسية
// ─────────────────────────────────────────────
export default function AntiCheatPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.LIVE_MONITOR_VIEW);

  const [tab, setTab] = React.useState<"flags" | "events">("flags");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);

  // ── نظام الفلاتر المتقدم ──
  const filterHook = useAntiCheatFilters();
  const { filters, deferredSearch, isActive, activeCount } = filterHook;

  // ── فلتر المخاطر كرقم (للتوافق مع الـ API) ──
  const minRiskParam = filters.minRisk === "all" ? "all" : filters.minRisk;

  const [detailFlagId, setDetailFlagId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // إعادة الصفحة للأولى عند تغيير أي فلتر
  React.useEffect(() => {
    setPage(1);
  }, [
    deferredSearch,
    filters.status,
    filters.minRisk,
    filters.severity,
    filters.eventType,
    filters.dateFrom,
    filters.dateTo,
  ]);

  // ── جلب البيانات ──
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "anti-cheat",
      "flags",
      page,
      limit,
      deferredSearch,
      filters.status,
      minRiskParam,
      filters.severity,
      filters.eventType,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (deferredSearch) params.set("search", deferredSearch);
      if (filters.status !== "all") params.set("status", filters.status);
      if (minRiskParam !== "all")
        params.set("minRisk", String(minRiskParam));
      if (filters.severity !== "all") params.set("severity", filters.severity);
      if (filters.eventType !== "all")
        params.set("eventType", filters.eventType);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const response = await adminFetch(
        `${apiRoutes.admin.antiCheat}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل في جلب حالات الغش");
      const json = await response.json();
      return (json.data || json) as AntiCheatFlagResponse;
    },
    placeholderData: (prev) => prev,
    refetchInterval: REFRESH_INTERVALS.FLAGS,
  });

  const flags = data?.flags || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  // ── حساب الإحصاءات الفرعية ──
  const statusBreakdown = React.useMemo<Record<AntiCheatStatus, number>>(() => {
    const out = {} as Record<AntiCheatStatus, number>;
    STATUS_ORDER.forEach((s) => (out[s] = 0));
    flags.forEach((f) => {
      out[f.status] = (out[f.status] ?? 0) + 1;
    });
    return out;
  }, [flags]);
  const weeklyData = React.useMemo<{ date: string; flags: number; events?: number }[]>(
    () => {
      const fromSummary = summary?.weeklyTrend;
      if (fromSummary && fromSummary.length > 0) return fromSummary;
      const fallback = summarizeFlagsByDay(flags);
      return fallback.map((d) => ({ date: d.date, flags: d.count }));
    },
    [summary, flags]
  );

  // ── التحديث الشامل ──
  const refreshAll = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat"] });
    refetch();
  }, [queryClient, refetch]);

  // ── تغيير حالة ──
  const handleStatusChange = React.useCallback(
    async (flag: AntiCheatFlag, status: AntiCheatStatus) => {
      if (!canManage) return;
      const toastId = toast.loading(
        `جاري تحديث حالة «${flag.userName || flag.userEmail}»...`
      );
      try {
        const response = await adminFetch(apiRoutes.admin.antiCheatFlag(flag.id), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error || "فشل تحديث الحالة");
        }
        toast.success(`تم تحديث الحالة إلى «${STATUS_CONFIG[status].label}»`, {
          id: toastId,
        });
        logAdminAction("UPDATE", "anti_cheat_flag", {
          entityId: flag.id,
          entityName: flag.userName || flag.userEmail,
          details: { status },
        });
        refreshAll();
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "خطأ في الاتصال بالخادم",
          { id: toastId }
        );
      }
    },
    [canManage, refreshAll]
  );

  // ── تحديث جماعي ──
  const handleBulkStatus = async (
    selected: AntiCheatFlag[],
    status: AntiCheatStatus
  ) => {
    if (!canManage || selected.length === 0) return;
    const toastId = toast.loading(
      `تطبيق «${STATUS_CONFIG[status].label}» على ${selected.length} حالة...`
    );
    let success = 0;
    for (const flag of selected) {
      try {
        const response = await adminFetch(
          apiRoutes.admin.antiCheatFlag(flag.id),
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );
        if (response.ok) success++;
      } catch {
        // تجاهل فشل فردي
      }
    }
    toast.success(`تم تحديث ${success} حالة من أصل ${selected.length}`, {
      id: toastId,
    });
    logAdminAction("UPDATE", "anti_cheat_flag_bulk", {
      details: { status, count: success },
    });
    refreshAll();
  };

  // ── فلتر سريع حسب الحالة ──
  const handleQuickStatusFilter = (status: AntiCheatStatus) => {
    if (filters.status === status) {
      filterHook.setStatus("all");
    } else {
      filterHook.setStatus(status);
    }
  };

  // ── تصدير CSV ──
  const handleExport = () => {
    const columns: ExportColumn<AntiCheatFlag>[] = [
      { header: "الطالب", accessor: (r) => r.userName || "" },
      { header: "البريد الإلكتروني", accessor: (r) => r.userEmail || "" },
      { header: "الامتحان", accessor: (r) => r.examTitle || "" },
      { header: "درجة المخاطر", accessor: (r) => r.riskScore },
      { header: "الحالة", accessor: (r) => STATUS_CONFIG[r.status]?.label || r.status },
      { header: "عدد الأحداث", accessor: (r) => r.eventCount },
      { header: "آخر نشاط", accessor: (r) => r.lastEventAt || "" },
      { header: "تاريخ الاكتشاف", accessor: (r) => r.createdAt },
      { header: "عنوان IP", accessor: (r) => r.ipAddress || "" },
    ];
    exportToCSV(flags, columns, `anti-cheat-flags-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("تم تصدير الحالات إلى ملف CSV");
  };

  // ── أعمدة الجدول ──
  const columns: ColumnDef<AntiCheatFlag>[] = React.useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "الطالب",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
              {(row.original.userName || row.original.userEmail || "؟").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black">
                {row.original.userName || "طالب"}
              </p>
              <p className="truncate text-[10px] font-bold text-muted-foreground" dir="ltr">
                {row.original.userEmail}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "examTitle",
        header: "الامتحان",
        cell: ({ row }) => (
          <span className="block max-w-[160px] truncate text-xs font-bold text-muted-foreground">
            {row.original.examTitle || "—"}
          </span>
        ),
      },
      {
        accessorKey: "riskScore",
        header: "درجة المخاطر",
        cell: ({ row }) => {
          const score = row.original.riskScore;
          const level = riskLevel(score);
          return (
            <div className="w-32">
              <div className="mb-1.5 flex items-center justify-between">
                <span className={cn("text-xs font-black", level.text)}>
                  {formatNumber(score)}
                </span>
                <span className="text-[9px] font-black uppercase text-muted-foreground/70">
                  {level.label}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <m.div
                  className={cn("h-full rounded-full", level.bar)}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, score)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "eventCount",
        header: "الأحداث",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-black">{row.original.eventCount}</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status] || STATUS_CONFIG.OPEN;
          const isSelected = filters.status === row.original.status;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickStatusFilter(row.original.status);
              }}
              className={cn(
                "rounded-md transition-all",
                isSelected && "ring-2 ring-primary ring-offset-1"
              )}
            >
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 border-2 px-2.5 py-1 font-black text-[10px] uppercase tracking-wider",
                  cfg.border,
                  cfg.text
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                {cfg.label}
              </Badge>
            </button>
          );
        },
      },
      {
        accessorKey: "lastEventAt",
        header: "آخر نشاط",
        cell: ({ row }) => (
          <span className="text-[11px] font-bold text-muted-foreground">
            {formatDateTime(row.original.lastEventAt || row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "تاريخ الاكتشاف",
        cell: ({ row }) => (
          <span className="text-[11px] font-bold text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        enableSorting: false,
        cell: ({ row }) => {
          const flag = row.original;
          return (
            <RowActions
              row={flag}
              onView={() => {
                setDetailFlagId(flag.id);
                setDetailOpen(true);
              }}
              extraActions={[
                {
                  icon: Clock,
                  label: "قيد المراجعة",
                  onClick: (f) => handleStatusChange(f, "UNDER_REVIEW"),
                },
                {
                  icon: CheckCircle2,
                  label: "تبرئة",
                  onClick: (f) => handleStatusChange(f, "CLEARED"),
                },
                {
                  icon: FileX2,
                  label: "رفض الحالة",
                  onClick: (f) => handleStatusChange(f, "DISMISSED"),
                },
                {
                  icon: Ban,
                  label: "حظر / إبطال",
                  variant: "destructive",
                  onClick: (f) => handleStatusChange(f, "BLOCKED"),
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, handleStatusChange, filters.status]
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="مكافحة الغش"
        description="مراقبة حالات الغش في الامتحانات ومراجعة الأدلة واتخاذ القرارات."
        eyebrow="مركز التحكم"
        badge={`${formatNumber(summary?.totalFlags ?? 0)} حالة غش`}
        meta={
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            مفتوحة: {formatNumber(summary?.open ?? 0)} — أحداث اليوم:{" "}
            {formatNumber(summary?.todayEvents ?? 0)}
          </div>
        }
      >
        <AdminButton
          variant="outline"
          icon={Download}
          size="sm"
          onClick={handleExport}
          disabled={flags.length === 0}
        >
          تصدير CSV
        </AdminButton>
        <AdminButton
          variant="outline"
          icon={RefreshCw}
          size="sm"
          onClick={refreshAll}
          loading={isFetching}
        >
          تحديث
        </AdminButton>
      </PageHeader>

      {/* ── التنقل بين الصفحات الفرعية ── */}
      <SubPageNav current="/admin/anti-cheat" />

      {/* ── بطاقات الإحصاءات ── */}
      <StatsCards
        summary={
          summary || {
            totalFlags: 0,
            open: 0,
            underReview: 0,
            cleared: 0,
            dismissed: 0,
            blocked: 0,
            highRisk: 0,
            uniqueStudents: 0,
            totalEvents: 0,
            criticalEvents: 0,
            todayEvents: 0,
          }
        }
        loading={!summary}
      />

      {/* ── رسوم بيانية: الترند + الهيت ماب ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrendChart data={weeklyData} loading={!summary} />
        </div>
        <HeatmapView
          flags={flags}
          loading={isLoading}
        />
      </div>

      {/* ── فلاتر سريعة حسب الحالة ── */}
      <div className="admin-glass flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 p-3">
        <span className="text-xs font-black text-muted-foreground ml-2">
          <Sparkles className="inline h-3.5 w-3.5 ml-1" />
          فلتر سريع:
        </span>
        {STATUS_ORDER.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = statusBreakdown[s] || 0;
          const isSelected = filters.status === s;
          return (
            <button
              key={s}
              onClick={() => handleQuickStatusFilter(s)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-all",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? cn("border-primary shadow-lg", cfg.bg, cfg.text)
                  : cn("border-white/10 bg-white/5 hover:bg-white/10", cfg.text)
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
              <span className="rounded-md bg-black/30 px-1.5 text-[10px] font-black">
                {formatNumber(count)}
              </span>
            </button>
          );
        })}
      </div>

      <Tabs
        defaultValue="flags"
        value={tab}
        onValueChange={(v) => setTab(v as "flags" | "events")}
      >
        <div className="admin-glass rounded-[2rem] border border-white/10 p-1 shadow-2xl">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="flags">
                حالات الغش
                {summary && summary.open > 0 && (
                  <span className="mr-1.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-black text-red-500">
                    {formatNumber(summary.open)}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="events">
                الأحداث التفصيلية
              </TabsTrigger>
            </TabsList>

            {tab === "flags" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative group w-full sm:w-56">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => filterHook.setSearch(e.target.value)}
                    placeholder="ابحث عن طالب..."
                    className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right"
                    dir="rtl"
                  />
                </div>

                {/* زر الفلاتر المتقدمة */}
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className={cn(
                    "relative flex h-10 items-center gap-2 rounded-xl border-2 px-3 text-xs font-black transition-all",
                    "hover:scale-105 active:scale-95",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FilterIcon className="h-4 w-4" />
                  فلاتر متقدمة
                  {activeCount > 0 && (
                    <span className="rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-black text-primary-foreground">
                      {activeCount}
                    </span>
                  )}
                </button>

                {/* عرض الفلاتر النشطة كـ chips */}
                {isActive && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {filters.status !== "all" && (
                      <FilterChip
                        label="الحالة"
                        value={STATUS_CONFIG[filters.status].label}
                        onRemove={() => filterHook.setStatus("all")}
                      />
                    )}
                    {filters.minRisk !== "all" && (
                      <FilterChip
                        label="المخاطر"
                        value={`≥ ${filters.minRisk}`}
                        onRemove={() => filterHook.setMinRisk("all")}
                      />
                    )}
                    {filters.severity !== "all" && (
                      <FilterChip
                        label="الخطورة"
                        value={filters.severity}
                        onRemove={() => filterHook.setSeverity("all")}
                      />
                    )}
                    {filters.eventType !== "all" && (
                      <FilterChip
                        label="نوع الحدث"
                        value={filters.eventType}
                        onRemove={() => filterHook.setEventType("all")}
                      />
                    )}
                    {(filters.dateFrom || filters.dateTo) && (
                      <FilterChip
                        label="الفترة"
                        value={`${filters.dateFrom || "..."} → ${filters.dateTo || "..."}`}
                        onRemove={() => {
                          filterHook.updateFilter("dateFrom", undefined);
                          filterHook.updateFilter("dateTo", undefined);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <m.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="flags" className="p-4 pt-0">
                <AdminDataTable
                  columns={columns}
                  data={flags}
                  loading={isLoading}
                  selectable={canManage}
                  serverSide
                  totalRows={pagination?.total || 0}
                  pageCount={pagination?.totalPages || 1}
                  currentPage={page}
                  onPageChange={setPage}
                  onPageSizeChange={setLimit}
                  pageSize={limit}
                  columnLabels={{
                    userName: "الطالب",
                    examTitle: "الامتحان",
                    riskScore: "درجة المخاطر",
                    eventCount: "الأحداث",
                    status: "الحالة",
                    lastEventAt: "آخر نشاط",
                    createdAt: "تاريخ الاكتشاف",
                    actions: "الإجراءات",
                  }}
                  bulkActions={[
                    {
                      label: "تبرئة",
                      icon: CheckCircle2,
                      variant: "default",
                      onClick: (selected) => handleBulkStatus(selected, "CLEARED"),
                    },
                    {
                      label: "رفض",
                      icon: FileX2,
                      variant: "outline",
                      onClick: (selected) => handleBulkStatus(selected, "DISMISSED"),
                    },
                    {
                      label: "حظر",
                      icon: Ban,
                      variant: "destructive",
                      onClick: (selected) => handleBulkStatus(selected, "BLOCKED"),
                    },
                  ]}
                  emptyMessage={{
                    title: isActive
                      ? "لا توجد نتائج مطابقة"
                      : "لا توجد حالات غش",
                    description: isActive
                      ? "حاول تعديل الفلاتر أو إعادة التعيين."
                      : "لم يتم رصد أي مخالفات. النظام نظيف.",
                  }}
                />
              </TabsContent>

              <TabsContent value="events" className="p-4 pt-0">
                <EventsView onEventsChanged={refreshAll} />
              </TabsContent>
            </m.div>
          </AnimatePresence>
        </div>
      </Tabs>

      <FlagDetailDialog
        flagId={detailFlagId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onChanged={refreshAll}
      />

      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        flags={flags}
        events={[] as AntiCheatEvent[]}
        onApply={(applied) => {
          filterHook.setStatus(applied.status);
          filterHook.setSeverity(applied.severity);
          filterHook.setEventType(applied.eventType as typeof filters.eventType);
          filterHook.setMinRisk(applied.minRisk);
          filterHook.updateFilter("dateFrom", applied.dateFrom || undefined);
          filterHook.updateFilter("dateTo", applied.dateTo || undefined);
        }}
        current={{
          status: filters.status,
          severity: filters.severity,
          eventType: filters.eventType,
          minRisk: filters.minRisk,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  شريحة الفلتر النشط
// ─────────────────────────────────────────────
function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <m.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-black text-primary"
    >
      <span className="text-[9px] text-muted-foreground">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="rounded p-0.5 transition hover:bg-primary/20"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </m.span>
  );
}
