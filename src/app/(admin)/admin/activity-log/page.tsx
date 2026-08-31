"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Search, Download, RefreshCw, Eye, Users, Clock, CalendarDays, FilterX, Info,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ActivityLogsResponse {
  data: {
    logs: ActivityLog[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    summary: { totalLogs: number; todayCount: number; weekCount: number; uniqueUsers: number };
  };
}

interface ActivityLogOptions {
  actions: string[];
  resources: string[];
}

// ─────────────────────────────────────────────
//  Display helpers
// ─────────────────────────────────────────────

function actionBadgeClass(action: string): string {
  const a = action.toLowerCase();
  if (/(login|signin|logout|signout|auth|otp|verify|2fa)/.test(a)) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  if (/(payment|pay|refund|wallet|invoice|transaction)/.test(a)) return "text-purple-500 bg-purple-500/10 border-purple-500/20";
  if (/(create|add|register|enroll|upload|publish|submit|purchase|buy|send)/.test(a)) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (/(update|edit|change|modify|approve|accept|review|reset)/.test(a)) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  if (/(delete|remove|cancel|reject|block|revoke|ban|deny|disable)/.test(a)) return "text-red-500 bg-red-500/10 border-red-500/20";
  if (/(view|read|open|get|list|export|download|search)/.test(a)) return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  return "text-violet-500 bg-violet-500/10 border-violet-500/20";
}

const RESOURCE_COLORS = [
  "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  "text-orange-500 bg-orange-500/10 border-orange-500/20",
  "text-pink-500 bg-pink-500/10 border-pink-500/20",
  "text-lime-600 bg-lime-600/10 border-lime-600/20",
  "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  "text-teal-500 bg-teal-500/10 border-teal-500/20",
];

function resourceBadgeClass(resource: string): string {
  let h = 0;
  for (let i = 0; i < resource.length; i++) h = (h * 31 + resource.charCodeAt(i)) >>> 0;
  return RESOURCE_COLORS[h % RESOURCE_COLORS.length] || "text-violet-500 bg-violet-500/10 border-violet-500/20";
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return formatFullDate(iso);
}

function parseUserAgent(ua: string): { browser: string; os: string } {
  let browser = "مجهول";
  let os = "مجهول";
  if (!ua) return { browser, os };
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/MSIE|Trident/.test(ua)) browser = "Internet Explorer";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return { browser, os };
}

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────

export default function AdminActivityLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [actionFilter, setActionFilter] = React.useState(() => searchParams.get("action") || "all");
  const [resourceFilter, setResourceFilter] = React.useState(() => searchParams.get("resource") || "all");
  const [fromDate, setFromDate] = React.useState(() => searchParams.get("from") || "");
  const [toDate, setToDate] = React.useState(() => searchParams.get("to") || "");
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [selected, setSelected] = React.useState<ActivityLog | null>(null);

  const deferredSearch = React.useDeferredValue(querySearch);

  // Any filter change should start over from page 1.
  React.useEffect(() => { setPage(1); }, [deferredSearch, actionFilter, resourceFilter, fromDate, toDate]);

  // Keep the URL shareable / restorable.
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (limit !== 10) params.set("limit", String(limit));
    if (deferredSearch) params.set("search", deferredSearch);
    if (actionFilter !== "all") params.set("action", actionFilter);
    if (resourceFilter !== "all") params.set("resource", resourceFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [page, limit, deferredSearch, actionFilter, resourceFilter, fromDate, toDate, router]);

  // Distinct actions/resources for the filter dropdowns.
  const { data: options } = useQuery({
    queryKey: ["admin", "activity-log", "options"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/activity-log/options");
      if (!response.ok) return { actions: [], resources: [] } satisfies ActivityLogOptions;
      const json = await response.json();
      return (json?.data ?? { actions: [], resources: [] }) as ActivityLogOptions;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "activity-log", page, limit, deferredSearch, actionFilter, resourceFilter, fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (resourceFilter !== "all") params.set("resource", resourceFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const response = await adminApi.fetch(`/api/admin/activity-log?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch activity log");
      return (await response.json()) as ActivityLogsResponse;
    },
    placeholderData: (previousData) => previousData,
    refetchInterval: autoRefresh ? 30000 : false,
    refetchIntervalInBackground: false,
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalLogs: 0, todayCount: 0, weekCount: 0, uniqueUsers: 0 };

  const hasActiveFilters = actionFilter !== "all" || resourceFilter !== "all" || !!fromDate || !!toDate || !!deferredSearch;

  const clearFilters = () => {
    setActionFilter("all");
    setResourceFilter("all");
    setFromDate("");
    setToDate("");
    setSearch("");
    setQuerySearch("");
  };

  const handleExport = () => {
    if (!logs.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<ActivityLog>[] = [
      { header: "المستخدم", accessor: (l) => l.userName || l.userEmail },
      { header: "البريد", accessor: (l) => l.userEmail },
      { header: "الإجراء", accessor: (l) => l.action },
      { header: "المورد", accessor: (l) => l.resource },
      { header: "معرّف المورد", accessor: (l) => l.resourceId || "-" },
      { header: "عنوان IP", accessor: (l) => l.ipAddress },
      { header: "بيانات إضافية", accessor: (l) => JSON.stringify(l.metadata || {}) },
      { header: "التاريخ", accessor: (l) => formatFullDate(l.createdAt) },
    ];
    exportToCSV(logs, cols, "activity-log");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<ActivityLog>[] = [
    {
      accessorKey: "userName",
      header: "المستخدم",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-black">
            {(row.original.userName || row.original.userEmail || "؟").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black">{row.original.userName || "مستخدم"}</p>
            <p className="max-w-[180px] truncate text-[10px] text-muted-foreground" dir="ltr">{row.original.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "الإجراء",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("whitespace-nowrap text-[11px] font-black", actionBadgeClass(row.original.action))}>
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "resource",
      header: "المورد",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("whitespace-nowrap text-[11px] font-black", resourceBadgeClass(row.original.resource))}>
          {row.original.resource}
        </Badge>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "عنوان IP",
      cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ipAddress || "-"}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "التاريخ",
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <p className="text-xs font-bold">{formatRelative(row.original.createdAt)}</p>
          <p className="text-[10px] text-muted-foreground">{formatFullDate(row.original.createdAt)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <AdminButton variant="ghost" size="icon-sm" onClick={() => setSelected(row.original)} title="عرض التفاصيل">
          <Eye className="h-4 w-4" />
        </AdminButton>
      ),
    },
  ];

  const agent = selected ? parseUserAgent(selected.userAgent) : null;

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="سجل النشاطات 📊" description="عرض جميع النشاطات والعمليات التي تمت في النظام مع إمكانية التصفية والتفاصيل." eyebrow="المراقبة" badge={summary.totalLogs.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard title="إجمالي النشاطات" value={summary.totalLogs} icon={Activity} color="blue" description="نشاط مسجل" />
        <AdminStatsCard title="اليوم" value={summary.todayCount} icon={CalendarDays} color="green" description="نشاط اليوم" />
        <AdminStatsCard title="هذا الأسبوع" value={summary.weekCount} icon={Clock} color="purple" description="آخر 7 أيام" />
        <AdminStatsCard title="مستخدمون نشطون" value={summary.uniqueUsers} icon={Users} color="amber" description="مستخدم فريد" />
      </div>

      {/* Filter bar */}
      <div className="admin-glass rounded-[2rem] border border-white/10 p-5 shadow-2xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">الإجراء</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-10 w-full rounded-xl bg-accent/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {(options?.actions || []).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">المورد</label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="h-10 w-full rounded-xl bg-accent/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {(options?.resources || []).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">من تاريخ</label>
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-accent/10 px-3 text-sm font-bold outline-none ring-primary transition focus:ring-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">إلى تاريخ</label>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-accent/10 px-3 text-sm font-bold outline-none ring-primary transition focus:ring-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <AdminButton variant="outline" icon={FilterX} onClick={clearFilters}>مسح الفلاتر</AdminButton>
            )}
            <div className="flex h-10 items-center gap-2.5 rounded-xl border border-border bg-accent/10 px-3">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} aria-label="تحديث تلقائي" />
              <span className="text-xs font-bold">تحديث تلقائي</span>
              {autoRefresh && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              )}
            </div>
          </div>
        </div>
        {autoRefresh && (
          <p className="mt-3 text-[11px] font-bold text-emerald-500">يتم تحديث السجل تلقائياً كل 30 ثانية.</p>
        )}
      </div>

      <div className="admin-glass overflow-hidden rounded-[2.5rem] border border-white/10 p-1 shadow-2xl">
        <AdminDataTable columns={columns} data={logs} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد نشاطات", description: "لم يتم العثور على أي نشاطات مطابقة للفلاتر." }} />
      </div>

      {/* Details dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[90vh] overflow-hidden rounded-[2rem] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              تفاصيل النشاط
            </DialogTitle>
            <DialogDescription>تفاصيل كاملة حول هذا الإجراء وسجله.</DialogDescription>
          </DialogHeader>
          {selected && (
            <ScrollArea className="max-h-[70vh] pr-3">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={cn("font-black", actionBadgeClass(selected.action))}>{selected.action}</Badge>
                  <Badge variant="outline" className={cn("font-black", resourceBadgeClass(selected.resource))}>{selected.resource}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">المستخدم</p>
                    <p className="mt-1 text-sm font-bold">{selected.userName || "مستخدم"}</p>
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">{selected.userEmail}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">عنوان IP</p>
                    <p className="mt-1 font-mono text-sm font-bold" dir="ltr">{selected.ipAddress || "-"}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">التاريخ</p>
                    <p className="mt-1 text-sm font-bold">{formatFullDate(selected.createdAt)}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">معرّف المورد</p>
                    <p className="mt-1 truncate font-mono text-xs font-bold" dir="ltr">{selected.resourceId || "-"}</p>
                  </div>
                </div>

                {selected.userAgent && agent && (
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">المتصفح والجهاز</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary">{agent.browser}</Badge>
                      <Badge variant="secondary">{agent.os}</Badge>
                    </div>
                    <p className="mt-2 break-all text-[10px] leading-relaxed text-muted-foreground" dir="ltr">{selected.userAgent}</p>
                  </div>
                )}

                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">بيانات إضافية</p>
                  {selected.metadata && Object.keys(selected.metadata).length > 0 ? (
                    <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-background/60 p-3 font-mono text-[11px] leading-relaxed" dir="ltr">
                      {JSON.stringify(selected.metadata, null, 2)}
                    </pre>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">لا توجد بيانات إضافية.</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
