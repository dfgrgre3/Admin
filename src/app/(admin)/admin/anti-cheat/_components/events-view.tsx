"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { m, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Activity,
  Flame,
  AlertTriangle,
  MinusCircle,
  Plus,
  Search,
  RefreshCw,
  MonitorSmartphone,
  LayoutGrid,
  List,
  Calendar,
  Download,
} from "lucide-react";

import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn, formatNumber } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { logAdminAction } from "@/lib/admin-audit";
import { ANTI_CHEAT_QUERY_KEY } from "../_lib/constants";
import { eventsToCSV, downloadFile } from "../_lib/utils";

import {
  type AntiCheatEvent,
  type AntiCheatEventsResponse,
  type AntiCheatSeverity,
  EVENT_TYPE_CONFIG,
  EVENT_TYPE_ORDER,
  formatDateTime,
  formatTime,
  getInitials,
  maskIp,
  SEVERITY_CONFIG,
  SEVERITY_ORDER,
  timeAgo,
} from "./types";
import { HeatmapView } from "./heatmap-view";

interface EventsViewProps {
  onEventsChanged?: () => void;
}

type ViewMode = "table" | "timeline" | "heatmap";

export function EventsView({ onEventsChanged }: EventsViewProps) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [querySearch, setQuerySearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [recordOpen, setRecordOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, typeFilter, severityFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [ANTI_CHEAT_QUERY_KEY, "events", page, limit, deferredSearch, typeFilter, severityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (deferredSearch) params.set("search", deferredSearch);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      const response = await adminFetch(
        `${apiRoutes.admin.antiCheatEvents}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل في جلب أحداث المراقبة");
      const json = await response.json();
      return (json.data || json) as AntiCheatEventsResponse;
    },
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  });

  const events = data?.events || [];
  const pagination = data?.pagination;
  const summary = data?.summary || {
    totalEvents: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    todayCount: 0,
    uniqueStudents: 0,
  };

  const handleExport = () => {
    if (events.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const csv = eventsToCSV(events);
    downloadFile(`anti-cheat-events-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success("تم تصدير الأحداث");
  };

  const columns: ColumnDef<AntiCheatEvent>[] = React.useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "الطالب",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-black text-primary">
              {getInitials(row.original.userName, row.original.userEmail)}
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
        accessorKey: "eventType",
        header: "نوع الحدث",
        cell: ({ row }) => {
          const cfg = EVENT_TYPE_CONFIG[row.original.eventType];
          const Icon = cfg?.icon || ShieldAlert;
          return (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 border px-2.5 py-1 font-black text-[10px]",
                cfg?.border || "border-border",
                cfg?.text || ""
              )}
            >
              <Icon className="h-3 w-3" />
              {cfg?.label || row.original.eventType}
            </Badge>
          );
        },
      },
      {
        accessorKey: "severity",
        header: "الخطورة",
        cell: ({ row }) => {
          const s = SEVERITY_CONFIG[row.original.severity] || SEVERITY_CONFIG.LOW;
          return (
            <Badge
              variant="outline"
              className={cn(
                "border px-2.5 py-1 font-black text-[10px]",
                s.border,
                s.text
              )}
            >
              <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", s.bg)} />
              {s.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "detail",
        header: "التفاصيل",
        cell: ({ row }) => (
          <span className="block max-w-[220px] truncate text-[11px] font-bold text-muted-foreground">
            {row.original.detail || "—"}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "عنوان IP",
        cell: ({ row }) => (
          <span className="font-mono text-[10px] font-bold text-muted-foreground" dir="ltr">
            {maskIp(row.original.ipAddress || "")}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "التاريخ",
        cell: ({ row }) => (
          <div>
            <p className="text-[11px] font-black">{formatTime(row.original.createdAt)}</p>
            <p className="text-[10px] font-bold text-muted-foreground">
              {timeAgo(row.original.createdAt)}
            </p>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AdminStatsCard
          title="إجمالي الأحداث"
          value={summary.totalEvents}
          icon={Activity}
          color="blue"
          description="حدث مراقبة"
        />
        <AdminStatsCard
          title="حرجة"
          value={summary.criticalCount}
          icon={Flame}
          color="red"
          description="حدث"
        />
        <AdminStatsCard
          title="عالية"
          value={summary.highCount}
          icon={AlertTriangle}
          color="rose"
          description="حدث"
        />
        <AdminStatsCard
          title="أحداث اليوم"
          value={summary.todayCount}
          icon={MinusCircle}
          color="amber"
          description="حدث خلال 24 ساعة"
        />
        <AdminStatsCard
          title="طلاب"
          value={summary.uniqueStudents}
          icon={MonitorSmartphone}
          color="purple"
          description="طالب مرتبط"
        />
      </div>

      {/* Heatmap */}
      {viewMode === "heatmap" && (
        <HeatmapView events={events} loading={isLoading} />
      )}

      {/* شريط الأدوات وأوضاع العرض */}
      <div className="admin-glass rounded-[2rem] border border-white/10 p-1 shadow-2xl">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative group w-full sm:w-56">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setQuerySearch(e.target.value);
                }}
                placeholder="ابحث عن طالب..."
                className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right"
                dir="rtl"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 w-full sm:w-44">
                <SelectValue placeholder="نوع الحدث" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                {EVENT_TYPE_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>
                    {EVENT_TYPE_CONFIG[t]?.label ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-10 w-full sm:w-36">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الخطورة</SelectItem>
                {SEVERITY_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* تبديل وضع العرض */}
            <div className="flex rounded-xl border border-border bg-card p-1">
              {[
                { mode: "table" as const, icon: List, label: "جدول" },
                { mode: "timeline" as const, icon: Calendar, label: "زمني" },
                { mode: "heatmap" as const, icon: LayoutGrid, label: "خريطة" },
              ].map((m) => (
                <button
                  key={m.mode}
                  onClick={() => setViewMode(m.mode)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-black transition",
                    viewMode === m.mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <m.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            <AdminButton
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExport}
              disabled={events.length === 0}
            >
              تصدير
            </AdminButton>

            <AdminButton
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => refetch()}
              loading={isFetching}
            />

            <AdminButton
              size="sm"
              icon={Plus}
              onClick={() => setRecordOpen(true)}
            >
              تسجيل حدث
            </AdminButton>
          </div>
        </div>

        {/* المحتوى */}
        <AnimatePresence mode="wait">
          {viewMode === "table" && (
            <m.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 pb-4"
            >
              <AdminDataTable
                columns={columns}
                data={events}
                loading={isLoading}
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
                  eventType: "نوع الحدث",
                  severity: "الخطورة",
                  detail: "التفاصيل",
                  ipAddress: "عنوان IP",
                  createdAt: "التاريخ",
                }}
                emptyMessage={{
                  title: "لا توجد أحداث",
                  description: "لم يتم تسجيل أي أحداث مراقبة مطابقة للفلاتر.",
                }}
              />
            </m.div>
          )}

          {viewMode === "timeline" && (
            <m.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4"
            >
              <TimelineView events={events} loading={isLoading} />
            </m.div>
          )}

          {viewMode === "heatmap" && (
            <m.div
              key="heatmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4"
            >
              <HeatmapView events={events} loading={isLoading} />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <RecordEventDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        onRecorded={() => {
          refetch();
          onEventsChanged?.();
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Timeline View
// ─────────────────────────────────────────────

function TimelineView({
  events,
  loading,
}: {
  events: AntiCheatEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-muted-foreground">
        <Calendar className="h-10 w-10 opacity-40" />
        <p className="mt-3 text-sm font-bold">لا توجد أحداث للعرض</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // تجميع حسب اليوم
  const grouped: Record<string, AntiCheatEvent[]> = {};
  sorted.forEach((e) => {
    const day = new Date(e.createdAt).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayEvents], gIdx) => (
        <div key={day}>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="text-xs font-black text-muted-foreground">{day}</h4>
            <div className="h-px flex-1 bg-border/60" />
            <Badge variant="outline" className="border-border bg-card text-[10px] font-black">
              {formatNumber(dayEvents.length)} حدث
            </Badge>
          </div>

          <div className="relative space-y-3">
            <div className="absolute right-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/50 via-amber-500/30 to-emerald-500/20" />
            {dayEvents.map((event, idx) => {
              const eCfg = EVENT_TYPE_CONFIG[event.eventType];
              const Icon = eCfg?.icon || ShieldAlert;
              const sCfg = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.LOW;
              return (
                <m.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (gIdx * 0.1) + (idx * 0.03) }}
                  className="relative flex gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 transition hover:border-border"
                >
                  <div
                    className={cn(
                      "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2",
                      eCfg?.border || "border-border"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", eCfg?.text)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black">
                        {eCfg?.label || event.eventType}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border px-2 py-0 text-[9px] font-black uppercase tracking-wider",
                          sCfg.border,
                          sCfg.text
                        )}
                      >
                        {sCfg.label}
                      </Badge>
                      <span className="mr-auto text-[10px] font-bold text-muted-foreground">
                        {formatTime(event.createdAt)} • {timeAgo(event.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-bold">
                      {event.userName || "طالب"}{" "}
                      <span className="text-muted-foreground">•</span>{" "}
                      <span className="text-muted-foreground">{event.examTitle || "—"}</span>
                    </p>
                    {event.detail && (
                      <p className="mt-0.5 truncate text-[11px] font-bold text-muted-foreground">
                        {event.detail}
                      </p>
                    )}
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  تسجيل حدث يدوي
// ─────────────────────────────────────────────

function FormField({
  label,
  required,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

interface RecordEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecorded?: () => void;
}

function RecordEventDialog({ open, onOpenChange, onRecorded }: RecordEventDialogProps) {
  const [userId, setUserId] = React.useState("");
  const [examId, setExamId] = React.useState("");
  const [attemptId, setAttemptId] = React.useState("");
  const [eventType, setEventType] = React.useState("TAB_SWITCH");
  const [severity, setSeverity] = React.useState<AntiCheatSeverity | "">("");
  const [detail, setDetail] = React.useState("");
  const [ipAddress, setIpAddress] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setUserId("");
      setExamId("");
      setAttemptId("");
      setDetail("");
      setIpAddress("");
      setSeverity("");
      setEventType("TAB_SWITCH");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!userId.trim()) {
      toast.error("معرّف المستخدم مطلوب");
      return;
    }
    setSubmitting(true);
    try {
      const response = await adminFetch(apiRoutes.admin.antiCheatEvents, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          examId: examId.trim() || null,
          attemptId: attemptId.trim() || null,
          eventType,
          severity: severity || undefined,
          detail: detail.trim() || null,
          ipAddress: ipAddress.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string })?.error || "فشل في تسجيل الحدث"
        );
      }
      toast.success("تم تسجيل الحدث وتحديث الحالة المرتبطة");
      logAdminAction("CREATE", "anti_cheat_event", {
        details: { eventType, userId: userId.trim() },
      });
      onOpenChange(false);
      onRecorded?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">
            تسجيل حدث مراقبة يدوي
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-muted-foreground">
            أضف حدثاً يدوياً (مثال: مخالفة رصدها المراقب) وسيتم تحديث درجة مخاطر الطالب تلقائياً.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2">
          <FormField label="معرّف المستخدم" required>
            <AdminInput
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID الخاص بالطالب"
              dir="ltr"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="معرّف الامتحان">
              <AdminInput
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                placeholder="اختياري"
                dir="ltr"
              />
            </FormField>
            <FormField label="معرّف المحاولة">
              <AdminInput
                value={attemptId}
                onChange={(e) => setAttemptId(e.target.value)}
                placeholder="اختياري"
                dir="ltr"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="نوع الحدث" required>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الحدث" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_ORDER.map((t) => (
                    <SelectItem key={t} value={t}>
                      {EVENT_TYPE_CONFIG[t]?.label ?? t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="الخطورة">
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as AntiCheatSeverity | "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="تلقائية حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="عنوان IP">
            <AdminInput
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="اختياري"
              dir="ltr"
            />
          </FormField>
          <FormField label="التفاصيل">
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="وصف الحدث الذي تم رصده..."
              className="min-h-[72px] w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </FormField>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <AdminButton variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            icon={RefreshCw}
            onClick={handleSubmit}
            loading={submitting}
          >
            تسجيل الحدث
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}