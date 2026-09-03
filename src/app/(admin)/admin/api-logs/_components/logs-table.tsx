"use client";

import * as React from "react";
import { motion as m } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Eye,
  Globe,
  KeyRound,
  RefreshCw,
  Search,
  ServerCrash,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge, RoleBadge } from "@/components/admin/ui/admin-badge";
import { Input as TextInput } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { ApiLogEntry } from "../_lib/constants";
import {
  STATUS_CONFIG,
  METHOD_CONFIG,
  SEVERITY_CONFIG,
  CATEGORY_CONFIG,
} from "../_lib/constants";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatTimestamp,
  downloadCsv,
  relativeTime,
} from "../_lib/utils";

interface LogsTableProps {
  logs: ApiLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onView: (log: ApiLogEntry) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ApiLogsTable({
  logs,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
  onRefresh,
  isRefreshing,
}: LogsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExport = () => {
    const rows: string[][] = [
      [
        "المعرّف",
        "الطابع الزمني",
        "الطريقة",
        "المسار",
        "الفئة",
        "كود الحاة",
        "زمن الاستجابة (ms)",
        "حجم الطلب (B)",
        "حجم الاستجابة (B)",
        "المستخدم",
        "الدور",
        "IP",
        "مفتاح API",
        "خطأ",
      ],
      ...logs.map((l) => [
        l.id,
        l.timestamp,
        l.method,
        l.endpoint,
        CATEGORY_CONFIG[l.category]?.label ?? l.category,
        String(l.statusCode),
        String(l.responseTimeMs),
        String(l.requestSize),
        String(l.responseSize),
        l.userName,
        l.userRole,
        l.ip,
        l.apiKeyName ?? "",
        l.errorMessage ?? "",
      ]),
    ];
    downloadCsv(`api-logs-${new Date().toISOString().split("T")[0]}.csv`, rows);
    toast.success("تم تصدير السجلات إلى CSV");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-muted-foreground">
          عرض {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} من {formatNumber(total)} سجل
        </p>
        <div className="flex gap-2">
          <AdminButton variant="outline" size="sm" onClick={handleExport} icon={Download}>
            تصدير CSV
          </AdminButton>
          <AdminButton variant="outline" size="sm" onClick={onRefresh} icon={RefreshCw} loading={isRefreshing}>
            تحديث
          </AdminButton>
        </div>
      </div>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <AdminCard className="p-16 text-center">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-black text-lg">لا توجد سجلات</p>
            <p className="text-sm text-muted-foreground mt-1">
              لم يتم العثور على سجلات تطابق عوامل التصفية الحالية
            </p>
          </AdminCard>
        ) : (
          logs.map((log) => <ApiLogRow key={log.id} log={log} onView={onView} />)
        )}
      </div>

      {total > pageSize && (
        <AdminCard variant="outline" className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-muted-foreground">
              صفحة {page} من {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                icon={ChevronRight}
              >
                السابق
              </AdminButton>
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                icon={ChevronLeft}
              >
                التالي
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

// ─── Single Log Row ──────────────────────────────────────────

function ApiLogRow({ log, onView }: { log: ApiLogEntry; onView: (log: ApiLogEntry) => void }) {
  const statusCfg = STATUS_CONFIG[log.statusGroup];
  const methodCfg = METHOD_CONFIG[log.method];
  const severityCfg = SEVERITY_CONFIG[log.severity];
  const StatusIcon =
    log.statusGroup === "2xx"
      ? CheckCircle2
      : log.statusGroup === "3xx"
      ? Globe
      : log.statusGroup === "4xx"
      ? AlertTriangle
      : XCircle;

  const isSlow = log.responseTimeMs > 1000;
  const isVerySlow = log.responseTimeMs > 2500;

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
    >
      <AdminCard
        variant="outline"
        className={cn(
          "p-4 cursor-pointer hover:border-primary/40 transition-all group",
          log.statusGroup === "5xx" && "border-rose-500/30 hover:border-rose-500/50",
          log.severity === "critical" && "border-red-500/40 hover:border-red-500/60"
        )}
        onClick={() => onView(log)}
      >
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Status + Method */}
          <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
            <div className={cn("rounded-xl border p-2 shrink-0", statusCfg.bg)}>
              <StatusIcon className={cn("h-4 w-4", statusCfg.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-black",
                    methodCfg.bg,
                    methodCfg.color
                  )}
                >
                  {log.method}
                </span>
                <span className="font-mono font-black text-sm truncate" title={log.endpoint}>
                  {log.endpoint}
                </span>
                <AdminBadge variant="outline" status={log.statusGroup === "2xx" ? "success" : log.statusGroup === "5xx" ? "error" : log.statusGroup === "4xx" ? "warning" : "info"} className="text-[10px]">
                  {log.statusCode}
                </AdminBadge>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-bold">{CATEGORY_CONFIG[log.category]?.label ?? log.category}</span>
                {log.cached && (
                  <AdminBadge variant="outline" status="info" className="text-[9px]">
                    CACHE
                  </AdminBadge>
                )}
                {log.rateLimited && (
                  <AdminBadge variant="outline" status="error" className="text-[9px]">
                    RATE-LIMIT
                  </AdminBadge>
                )}
              </div>
            </div>
          </div>

          {/* Latency + Bytes */}
          <div className="col-span-6 md:col-span-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground">الزمن</p>
              <p
                className={cn(
                  "text-xs font-black",
                  isVerySlow ? "text-rose-500" : isSlow ? "text-amber-500" : "text-emerald-500"
                )}
              >
                {formatDuration(log.responseTimeMs)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground">الحجم</p>
              <p className="text-xs font-black">{formatBytes(log.requestSize + log.responseSize)}</p>
            </div>
            <div className="text-center hidden lg:block">
              <p className="text-[10px] font-black text-muted-foreground">الخطورة</p>
              <p className={cn("text-xs font-black", severityCfg.color)}>{severityCfg.label}</p>
            </div>
          </div>

          {/* User */}
          <div className="col-span-6 md:col-span-3 min-w-0">
            <div className="flex items-center gap-2">
              {log.userRole === "SYSTEM" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20">
                  نظام
                </span>
              ) : (
                <RoleBadge role={log.userRole} />
              )}
            </div>
            <p className="mt-1 text-xs font-bold truncate">{log.userName}</p>
            {log.apiKeyName && (
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <KeyRound className="h-2.5 w-2.5" />
                {log.apiKeyName}
              </p>
            )}
          </div>

          {/* Date + Action */}
          <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-2">
            <div className="text-right">
              <p className="text-xs font-bold">{formatTimestamp(log.timestamp, true)}</p>
              <p className="text-[10px] text-muted-foreground">{relativeTime(log.timestamp)}</p>
            </div>
            <AdminButton
              variant="outline"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              icon={Eye}
              onClick={(e) => {
                e.stopPropagation();
                onView(log);
              }}
            >
              تفاصيل
            </AdminButton>
          </div>
        </div>

        {log.errorMessage && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2">
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-mono">{log.errorCode}</span> — {log.errorMessage}
            </p>
          </div>
        )}
      </AdminCard>
    </m.div>
  );
}

// ─── Detail Dialog ───────────────────────────────────────────

export function ApiLogDetailDialog({
  log,
  open,
  onOpenChange,
}: {
  log: ApiLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;
  const statusCfg = STATUS_CONFIG[log.statusGroup];
  const methodCfg = METHOD_CONFIG[log.method];
  const severityCfg = SEVERITY_CONFIG[log.severity];

  const fakeRequestPayload = JSON.stringify(
    {
      headers: {
        "x-request-id": log.id,
        "content-type": "application/json",
        "x-api-key": log.apiKeyId ? `${log.apiKeyId}.***` : null,
      },
      query: { include: "metadata", locale: "ar-EG" },
      body:
        log.method === "GET"
          ? null
          : {
              action: "primary",
              data: { id: log.userId, scope: "self", page: 1 },
            },
    },
    null,
    2
  );

  const fakeResponsePayload = JSON.stringify(
    {
      status: log.statusCode,
      ok: log.statusGroup === "2xx",
      meta: {
        requestId: log.id,
        durationMs: log.responseTimeMs,
        cached: log.cached,
        rateLimited: log.rateLimited,
      },
      data:
        log.statusGroup === "4xx" || log.statusGroup === "5xx"
          ? { error: log.errorCode, message: log.errorMessage }
          : {
              id: `res_${log.id.slice(-6)}`,
              createdAt: log.timestamp,
              processed: true,
            },
    },
    null,
    2
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-1 text-xs font-black",
                methodCfg.bg,
                methodCfg.color
              )}
            >
              {log.method}
            </span>
            <span className="font-mono">{log.endpoint}</span>
            <AdminBadge variant="outline" status={log.statusGroup === "2xx" ? "success" : log.statusGroup === "5xx" ? "error" : log.statusGroup === "4xx" ? "warning" : "info"}>
              {log.statusCode} {statusCfg.label}
            </AdminBadge>
            <AdminBadge variant="outline" status={log.severity === "critical" ? "error" : log.severity === "error" ? "error" : log.severity === "warning" ? "warning" : "info"}>
              خطورة: {severityCfg.label}
            </AdminBadge>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span>{formatTimestamp(log.timestamp, true)}</span>
            <span>•</span>
            <span>{relativeTime(log.timestamp)}</span>
            <span>•</span>
            <span>{formatDuration(log.responseTimeMs)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetaCell label="الفئة" value={CATEGORY_CONFIG[log.category]?.label ?? log.category} icon={<Globe className="h-3 w-3" />} />
            <MetaCell label="حجم الطلب" value={formatBytes(log.requestSize)} />
            <MetaCell label="حجم الاستجابة" value={formatBytes(log.responseSize)} />
            <MetaCell label="المفتاح" value={log.apiKeyName ?? "—"} icon={<KeyRound className="h-3 w-3" />} />
          </div>

          {/* User & Network */}
          <AdminCard variant="outline" className="p-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
              <User className="h-3 w-3" />
              معلومات المتصل والشبكة
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">المستخدم</p>
                <p className="font-bold truncate">{log.userName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">الدور</p>
                {log.userRole === "SYSTEM" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20">
                    نظام
                  </span>
                ) : (
                  <RoleBadge role={log.userRole} />
                )}
              </div>
              <div>
                <p className="text-muted-foreground">عنوان IP</p>
                <p className="font-bold font-mono" dir="ltr">{log.ip}</p>
              </div>
              <div>
                <p className="text-muted-foreground">الدولة</p>
                <p className="font-bold">{log.country ?? "—"}</p>
              </div>
              <div className="col-span-2 md:col-span-4">
                <p className="text-muted-foreground">User-Agent</p>
                <p className="font-bold font-mono text-[11px] truncate" dir="ltr">{log.userAgent}</p>
              </div>
            </div>
          </AdminCard>

          {/* Request */}
          <div className="space-y-2">
            <Label className="text-xs font-black flex items-center gap-1">
              <ServerCrash className="h-3 w-3" />
              تفاصيل الطلب
            </Label>
            <pre
              dir="ltr"
              className="text-[11px] font-mono whitespace-pre-wrap break-words leading-relaxed rounded-xl border border-border bg-muted/30 p-3 max-h-56 overflow-y-auto"
            >
              {fakeRequestPayload}
            </pre>
          </div>

          {/* Response */}
          <div className="space-y-2">
            <Label className="text-xs font-black flex items-center gap-1">
              <Shield className="h-3 w-3" />
              الاستجابة
            </Label>
            <pre
              dir="ltr"
              className={cn(
                "text-[11px] font-mono whitespace-pre-wrap break-words leading-relaxed rounded-xl border p-3 max-h-56 overflow-y-auto",
                log.statusGroup === "2xx"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-rose-500/30 bg-rose-500/5"
              )}
            >
              {fakeResponsePayload}
            </pre>
          </div>

          {/* Error */}
          {log.errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                تفاصيل الخطأ — <span className="font-mono">{log.errorCode}</span>
              </p>
              <p className="text-sm text-rose-600 font-bold">{log.errorMessage}</p>
              {log.rateLimited && (
                <p className="mt-2 text-[11px] font-bold text-rose-500">
                  تم تفعيل حد المعدل على هذا المفتاح
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <AdminButton onClick={() => onOpenChange(false)}>إغلاق</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetaCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="font-black text-sm mt-1 truncate">{value}</p>
    </div>
  );
}