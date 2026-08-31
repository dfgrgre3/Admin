"use client";

import * as React from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Download,
  Eye,
  Info,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  Timer,
  TrendingUp,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { Input as TextInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useAILogs,
  type AILogsParams,
} from "@/lib/ai/ai-hooks";
import { aiClient } from "@/lib/ai/ai-client";
import type {
  AILogEntry,
  AILogStatus,
  AILogAction,
} from "@/lib/ai/types";
import { cn } from "@/lib/utils";

// ─── Configuration Constants ───────────────────────────────

const STATUS_CONFIG: Record<
  AILogStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  success: {
    label: "ناجح",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: CheckCircle2,
  },
  error: {
    label: "خطأ",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: XCircle,
  },
  warning: {
    label: "تحذير",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: AlertTriangle,
  },
  info: {
    label: "معلومات",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: Info,
  },
};

const ACTION_CONFIG: Record<
  AILogAction,
  { label: string; color: string; icon: React.ElementType }
> = {
  copilot: { label: "مساعد إداري", color: "violet", icon: Sparkles },
  generate_content: { label: "توليد محتوى", color: "fuchsia", icon: Zap },
  review_content: { label: "مراجعة محتوى", color: "emerald", icon: CheckCircle2 },
  execute_action: { label: "تنفيذ إجراء", color: "blue", icon: Terminal },
  agent_command: { label: "أمر وكيل", color: "cyan", icon: Cpu },
  agent_execute: { label: "تنفيذ وكيل", color: "indigo", icon: Cpu },
  chat: { label: "محادثة", color: "blue", icon: Activity },
  moderation: { label: "رقابة", color: "amber", icon: AlertTriangle },
  grading: { label: "تصحيح", color: "emerald", icon: CheckCircle2 },
  forecast: { label: "تنبؤ", color: "rose", icon: TrendingUp },
};

const FILTER_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "success", label: "ناجح" },
  { value: "error", label: "خطأ" },
  { value: "warning", label: "تحذير" },
  { value: "info", label: "معلومات" },
];

// ─── Helpers ───────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}ك`;
  return n.toLocaleString("ar-EG");
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("ar-EG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Page Skeleton ──────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <Skeleton className="h-28 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Stats Cards ────────────────────────────────────────────

function StatsCards({ stats }: { stats: NonNullable<ReturnType<typeof useAILogs>["data"]>["stats"] }) {
  const cards = [
    {
      label: "إجمالي السجلات",
      value: formatNumber(stats.totalLogs),
      sub: "سجلات مكتملة",
      icon: Database,
      color: "violet" as const,
    },
    {
      label: "معدل النجاح",
      value: `${stats.successRate.toFixed(1)}%`,
      sub: "من إجمالي الاستدعاءات",
      icon: TrendingUp,
      color: "emerald" as const,
    },
    {
      label: "متوسط الزمن",
      value: formatDuration(stats.averageDurationMs),
      sub: "زمن الاستجابة",
      icon: Timer,
      color: "blue" as const,
    },
    {
      label: "أخطاء اليوم",
      value: stats.errorsToday.toLocaleString("ar-EG"),
      sub: `${formatNumber(stats.totalTokensUsed)} توكن مستخدم`,
      icon: AlertTriangle,
      color: "rose" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <m.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <AdminCard variant="glass" className="relative overflow-hidden">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30 bg-primary" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-black">{card.value}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">{card.sub}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </AdminCard>
        </m.div>
      ))}
    </div>
  );
}

// ─── Timeline Chart ─────────────────────────────────────────

function TimelineChart({
  data,
}: {
  data: Array<{ date: string; success: number; error: number; warning: number }>;
}) {
  const max = React.useMemo(() => {
    return Math.max(1, ...data.map((d) => d.success + d.error + d.warning));
  }, [data]);

  if (!data.length) {
    return (
      <AdminCard className="p-8 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">لا توجد بيانات للجدول الزمني</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard variant="glass" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            الجدول الزمني للاستدعاءات
          </h3>
          <p className="text-xs text-muted-foreground">آخر {data.length} يوم</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ناجح
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            خطأ
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            تحذير
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-40">
        {data.map((point, idx) => {
          const total = point.success + point.error + point.warning;
          const successH = (point.success / max) * 100;
          const errorH = (point.error / max) * 100;
          const warningH = (point.warning / max) * 100;
          return (
            <div
              key={point.date + idx}
              className="flex-1 flex flex-col justify-end gap-0.5 group"
              title={`${point.date}: ${point.success} ناجح، ${point.error} خطأ، ${point.warning} تحذير`}
            >
              <div
                className="bg-rose-500 rounded-t-sm transition-all hover:bg-rose-400"
                style={{ height: `${errorH}%`, minHeight: errorH > 0 ? "2px" : "0" }}
              />
              <div
                className="bg-amber-500 transition-all hover:bg-amber-400"
                style={{ height: `${warningH}%`, minHeight: warningH > 0 ? "2px" : "0" }}
              />
              <div
                className="bg-emerald-500 rounded-b-sm transition-all hover:bg-emerald-400"
                style={{ height: `${successH}%`, minHeight: successH > 0 ? "2px" : "0" }}
              />
              {total === 0 && (
                <div className="h-1 rounded-full bg-muted/30" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </AdminCard>
  );
}

// ─── Breakdown Component ────────────────────────────────────

function Breakdown({
  title,
  data,
  icon: Icon,
  color,
}: {
  title: string;
  data: Record<string, number>;
  icon: React.ElementType;
  color: string;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;

  if (!entries.length) return null;

  return (
    <AdminCard variant="glass" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-4 w-4 text-${color}-500`} />
        <h3 className="font-black text-base">{title}</h3>
      </div>
      <div className="space-y-3">
        {entries.slice(0, 5).map(([key, count]) => {
          const pct = (count / total) * 100;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold truncate">{key}</span>
                <span className="text-muted-foreground font-bold">
                  {formatNumber(count)} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full bg-${color}-500`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

// ─── Log Row ────────────────────────────────────────────────

function LogRow({
  log,
  onView,
}: {
  log: AILogEntry;
  onView: (log: AILogEntry) => void;
}) {
  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.info;
  const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.chat;
  const StatusIcon = statusConfig.icon;
  const ActionIcon = actionConfig.icon;

  return (
    <m.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <AdminCard
        variant="outline"
        className={cn(
          "p-4 cursor-pointer hover:border-primary/40 transition-all group"
        )}
        onClick={() => onView(log)}
      >
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Status & Action */}
          <div className="col-span-12 md:col-span-3 flex items-center gap-3">
            <div className={cn("rounded-xl border p-2", statusConfig.bg)}>
              <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm truncate">{actionConfig.label}</p>
              <p className="text-[10px] font-bold text-muted-foreground">
                {log.modelUsed}
              </p>
            </div>
          </div>

          {/* User */}
          <div className="col-span-6 md:col-span-3 min-w-0">
            <p className="text-xs font-bold truncate">{log.userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{log.userEmail}</p>
          </div>

          {/* Stats */}
          <div className="col-span-6 md:col-span-2 flex items-center gap-3">
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground">توكنات</p>
              <p className="text-xs font-black">{formatNumber(log.tokensUsed)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground">الزمن</p>
              <p className="text-xs font-black">{formatDuration(log.durationMs)}</p>
            </div>
          </div>

          {/* Date */}
          <div className="col-span-8 md:col-span-3 text-xs text-muted-foreground">
            <p className="font-bold">{formatDate(log.createdAt)}</p>
            <p className="text-[10px] truncate">{log.ip}</p>
          </div>

          {/* Action */}
          <div className="col-span-4 md:col-span-1 flex justify-end">
            <AdminButton
              variant="outline"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              icon={Eye}
            >
              عرض
            </AdminButton>
          </div>
        </div>

        {log.errorMessage && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2">
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {log.errorMessage}
            </p>
          </div>
        )}
      </AdminCard>
    </m.div>
  );
}

// ─── Log Detail Dialog ──────────────────────────────────────

function LogDetailDialog({
  log,
  open,
  onOpenChange,
}: {
  log: AILogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;

  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.info;
  const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.chat;
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
            تفاصيل السجل #{log.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            {actionConfig.label} • {formatDate(log.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                الحالة
              </p>
              <p className={cn("font-black mt-1", statusConfig.color)}>
                {statusConfig.label}
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                الموديل
              </p>
              <p className="font-black text-sm mt-1">{log.modelUsed}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                التوكنات
              </p>
              <p className="font-black text-sm mt-1">{log.tokensUsed.toLocaleString("ar-EG")}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                الزمن
              </p>
              <p className="font-black text-sm mt-1">{formatDuration(log.durationMs)}</p>
            </div>
          </div>

          {/* User Info */}
          <AdminCard variant="outline" className="p-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
              <User className="h-3 w-3" />
              معلومات المستخدم
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">الاسم</p>
                <p className="font-bold">{log.userName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">البريد</p>
                <p className="font-bold truncate">{log.userEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">الدور</p>
                <p className="font-bold">{log.userRole}</p>
              </div>
              <div>
                <p className="text-muted-foreground">IP</p>
                <p className="font-bold font-mono">{log.ip}</p>
              </div>
            </div>
          </AdminCard>

          {/* Prompt */}
          <div className="space-y-2">
            <Label className="text-xs font-black flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              الطلب (Prompt)
            </Label>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
                {log.prompt}
              </pre>
            </div>
          </div>

          {/* Response */}
          <div className="space-y-2">
            <Label className="text-xs font-black flex items-center gap-1">
              <Activity className="h-3 w-3" />
              الاستجابة (Response)
            </Label>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 max-h-60 overflow-y-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
                {log.response}
              </pre>
            </div>
          </div>

          {/* Error */}
          {log.errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                رسالة الخطأ
              </p>
              <p className="text-sm text-rose-600 font-bold">{log.errorMessage}</p>
            </div>
          )}

          {/* User Agent */}
          <div className="text-[10px] text-muted-foreground truncate">
            <span className="font-bold">User-Agent:</span> {log.userAgent}
          </div>
        </div>

        <DialogFooter>
          <AdminButton onClick={() => onOpenChange(false)}>إغلاق</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Filter Toolbar ─────────────────────────────────────────

function FilterToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  actionFilter,
  setActionFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  actionFilter: string;
  setActionFilter: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
}) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <TextInput
            placeholder="ابحث في السجلات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-bold"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-bold"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="all">جميع الإجراءات</option>
          {Object.entries(ACTION_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <TextInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="من تاريخ"
        />
        <TextInput
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="إلى تاريخ"
        />
      </div>
    </AdminCard>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function AiLogsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedLog, setSelectedLog] = React.useState<AILogEntry | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const params: AILogsParams = {
    status: statusFilter !== "all" ? statusFilter : (activeTab !== "all" ? activeTab : undefined),
    action: actionFilter !== "all" ? actionFilter : undefined,
    search: search.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useAILogs(params);

  // Debounced search reset to page 1
  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, actionFilter, startDate, endDate, activeTab]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await aiClient.exportAILogs(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير السجلات بنجاح");
    } catch (err) {
      toast.error((err as Error).message || "فشل تصدير السجلات");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="space-y-8 pb-20" dir="rtl">
        <PageHeader
          eyebrow="الذكاء الاصطناعي"
          title="سجلات الاستخدام"
          description="مراقبة وتحليل جميع استدعاءات الذكاء الاصطناعي في النظام"
        />
        <AdminCard className="p-12 text-center border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-black mb-2">تعذر تحميل السجلات</h3>
          <p className="text-muted-foreground mb-4">
            {(error as Error)?.message || "يرجى المحاولة مرة أخرى"}
          </p>
          <AdminButton onClick={() => refetch()} icon={ArrowUpRight}>
            إعادة المحاولة
          </AdminButton>
        </AdminCard>
      </div>
    );
  }

  const stats = data?.stats || {
    totalLogs: 0,
    successRate: 0,
    averageDurationMs: 0,
    totalTokensUsed: 0,
    errorsToday: 0,
    callsByAction: {},
    callsByModel: {},
    timelineByDay: [],
  };

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        eyebrow="الذكاء الاصطناعي"
        title="سجلات الاستخدام"
        description="مراقبة وتحليل جميع استدعاءات الذكاء الاصطناعي في النظام. تتبع الأخطاء، مراقبة الأداء، وتصدير البيانات."
      >
        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            onClick={handleExport}
            loading={exporting}
            icon={Download}
          >
            تصدير CSV
          </AdminButton>
          <AdminButton
            variant="outline"
            onClick={() => refetch()}
            loading={isFetching}
            icon={RefreshCw}
          >
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Timeline + Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TimelineChart data={stats.timelineByDay} />
        </div>
        <div className="space-y-6">
          <Breakdown
            title="الاستدعاءات حسب الإجراء"
            data={stats.callsByAction}
            icon={Activity}
            color="primary"
          />
          <Breakdown
            title="الاستدعاءات حسب الموديل"
            data={stats.callsByModel}
            icon={Cpu}
            color="violet"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50 p-1">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <FilterToolbar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Logs List */}
      {logs.length === 0 ? (
        <AdminCard className="p-16 text-center">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-black text-lg">لا توجد سجلات</p>
          <p className="text-sm text-muted-foreground mt-1">
            لم يتم العثور على سجلات تطابق عوامل التصفية
          </p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} onView={setSelectedLog} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <AdminCard variant="outline" className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground">
              عرض {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} من {total.toLocaleString("ar-EG")}
            </p>
            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                icon={ChevronRight}
              >
                السابق
              </AdminButton>
              <span className="text-xs font-bold px-2">
                صفحة {page} من {totalPages}
              </span>
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                icon={ChevronLeft}
              >
                التالي
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}