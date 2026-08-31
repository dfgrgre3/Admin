"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { m, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  X,
  Eye,
  ScrollText,
  CheckCircle2,
  Ban,
  FileX2,
  User,
  GraduationCap,
  Camera,
  ExternalLink,
  Copy as CopyIcon,
  AlertCircle,
  Sparkles,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn, formatNumber } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { logAdminAction } from "@/lib/admin-audit";

import {
  ANTI_CHEAT_QUERY_KEY,
} from "../_lib/constants";
import {
  type AntiCheatFlagDetail,
  type AntiCheatStatus,
  EVENT_TYPE_CONFIG,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  formatDateTime,
  getInitials,
  riskLevel,
  timeAgo,
} from "./types";
import { EvidenceViewer } from "./evidence-viewer";

interface FlagDetailDialogProps {
  flagId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const REVIEW_ACTIONS: {
  status: AntiCheatStatus;
  label: string;
  icon: React.ElementType;
  className: string;
  confirm?: string;
  shortLabel: string;
}[] = [
  {
    status: "UNDER_REVIEW",
    label: "قيد المراجعة",
    shortLabel: "مراجعة",
    icon: Eye,
    className: "border-purple-500/40 text-purple-500 hover:bg-purple-500/10",
  },
  {
    status: "CLEARED",
    label: "تبرئة",
    shortLabel: "تبرئة",
    icon: CheckCircle2,
    className: "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10",
    confirm: "سيتم اعتبار الطالب غير مذنب وإغلاق الحالة.",
  },
  {
    status: "DISMISSED",
    label: "رفض الحالة",
    shortLabel: "رفض",
    icon: FileX2,
    className: "border-slate-500/40 text-slate-500 hover:bg-slate-500/10",
    confirm: "سيتم إغلاق الحالة دون أي تأثير على الطالب.",
  },
  {
    status: "BLOCKED",
    label: "حظر / إبطال",
    shortLabel: "حظر",
    icon: Ban,
    className: "border-red-500/40 text-red-500 hover:bg-red-500/10",
    confirm: "سيتم إبطال محاولة الطالب وتطبيق عقوبة الغش.",
  },
];

export function FlagDetailDialog({
  flagId,
  open,
  onOpenChange,
  onChanged,
  onNavigate,
  hasNext,
  hasPrev,
}: FlagDetailDialogProps) {
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState<AntiCheatStatus | null>(null);
  const [activeTab, setActiveTab] = React.useState<"evidence" | "timeline" | "details">(
    "evidence"
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: [ANTI_CHEAT_QUERY_KEY, "flag", flagId],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.antiCheatFlag(flagId as string));
      if (!response.ok) throw new Error("فشل في جلب تفاصيل الحالة");
      const json = await response.json();
      return (json.data || json) as AntiCheatFlagDetail;
    },
    enabled: open && Boolean(flagId),
  });

  const flag = data?.flag;
  const events = data?.events || [];

  React.useEffect(() => {
    if (open && flag?.reviewNote) setNote(flag.reviewNote);
    if (!open) setActiveTab("evidence");
  }, [open, flag?.reviewNote]);

  const handleStatusChange = async (status: AntiCheatStatus) => {
    if (!flagId) return;
    setSubmitting(status);
    try {
      const response = await adminFetch(apiRoutes.admin.antiCheatFlag(flagId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: note.trim() || null }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string })?.error || "فشل تحديث الحالة");
      }
      toast.success(`تم تحديث الحالة إلى «${STATUS_CONFIG[status].label}»`);
      logAdminAction("UPDATE", "anti_cheat_flag", {
        entityId: flagId,
        entityName: flag?.userName || flag?.userEmail,
        details: { status, reviewNote: note.trim() || null },
      });
      await refetch();
      onChanged?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("تم النسخ"));
  };

  const level = riskLevel(flag?.riskScore ?? 0);
  const statusConfig = flag ? STATUS_CONFIG[flag.status] : STATUS_CONFIG.OPEN;

  const eventCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <m.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10"
              >
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </m.div>
              <div>
                <DialogTitle className="text-xl font-black">
                  تفاصيل حالة الغش
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground">
                  مراجعة الأدلة والأحداث والبت في الحالة
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {flag && (
                <Badge
                  variant="outline"
                  className={cn(
                    "border-2 px-3 py-1 font-black text-[10px] uppercase tracking-widest",
                    statusConfig.border,
                    statusConfig.text
                  )}
                >
                  <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", statusConfig.dot)} />
                  {statusConfig.label}
                </Badge>
              )}
              {onNavigate && hasPrev && (
                <button
                  onClick={() => onNavigate("prev")}
                  className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  title="السابق"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              {onNavigate && hasNext && (
                <button
                  onClick={() => onNavigate("next")}
                  className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  title="التالي"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* تبويبات داخلية */}
          {flag && (
            <div className="mt-4 flex gap-2 border-b border-border/40 pb-0">
              {[
                { id: "evidence", label: "الأدلة والتحليل", icon: Sparkles },
                { id: "timeline", label: "الخط الزمني", icon: ScrollText, count: events.length },
                { id: "details", label: "التفاصيل الكاملة", icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-black transition",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px]">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogHeader>

        {isLoading && !data ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !flag ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShieldAlert className="h-12 w-12 opacity-40" />
            <p className="text-sm font-bold">تعذر تحميل تفاصيل الحالة</p>
            <AdminButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              إغلاق
            </AdminButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* العمود الأيمن: معلومات الطالب والامتحان */}
            <div className="space-y-4 border-b border-border/60 p-6 lg:col-span-2 lg:border-b-0 lg:border-l">
              <StudentCard
                flag={flag}
                onCopy={copyToClipboard}
              />

              <ExamCard flag={flag} />

              <RiskScoreCard flag={flag} level={level} eventCount={flag.eventCount} />

              {/* ملاحظات سريعة */}
              {flag.reason && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    <AlertCircle className="h-3.5 w-3.5" /> سبب التنبيه
                  </p>
                  <p className="text-xs font-bold leading-6 text-amber-500/90">
                    {flag.reason}
                  </p>
                </div>
              )}

              {flag.reviewNote && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                    <Eye className="h-3.5 w-3.5" /> ملاحظة المراجعة السابقة
                  </p>
                  <p className="text-xs font-bold leading-6">{flag.reviewNote}</p>
                  {flag.reviewedAt && (
                    <p className="mt-2 text-[10px] font-bold text-muted-foreground">
                      بواسطة {flag.reviewerName || "مراجع"} • {timeAgo(flag.reviewedAt)}
                    </p>
                  )}
                </div>
              )}

              {flag.examId && (
                <AdminButton
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  className="w-full"
                  onClick={() => copyToClipboard(flag.examId!)}
                >
                  نسخ معرّف الامتحان
                </AdminButton>
              )}
            </div>

            {/* العمود الأيسر: المحتوى */}
            <div className="lg:col-span-3">
              <ScrollArea className="max-h-[60vh]">
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "evidence" && (
                      <m.div
                        key="evidence"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EvidenceViewer detail={data} loading={isLoading} />
                      </m.div>
                    )}

                    {activeTab === "timeline" && (
                      <m.div
                        key="timeline"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TimelineView events={events} />
                      </m.div>
                    )}

                    {activeTab === "details" && (
                      <m.div
                        key="details"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DetailsView
                          flag={flag}
                          eventCounts={eventCounts}
                          onCopy={copyToClipboard}
                        />
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* ── لوحة المراجعة ── */}
        {flag && (
          <div className="border-t border-border/60 bg-card/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                اتخاذ قرار بشأن الحالة
              </p>
              {flag.status === "BLOCKED" && (
                <Badge
                  variant="outline"
                  className="border-red-500/40 bg-red-500/10 text-[10px] font-black text-red-500"
                >
                  <Ban className="mr-1 h-3 w-3" /> الحالة مغلقة (محظورة)
                </Badge>
              )}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب ملاحظة المراجعة (تظهر في التقارير والسجلات)..."
              className="min-h-[64px] w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {REVIEW_ACTIONS.map((action) => {
                const disabled =
                  submitting !== null || flag.status === action.status;
                return (
                  <AdminButton
                    key={action.status}
                    variant="outline"
                    size="sm"
                    icon={action.icon}
                    className={cn("border-2", action.className)}
                    loading={submitting === action.status}
                    disabled={disabled}
                    onClick={() => handleStatusChange(action.status)}
                  >
                    {action.label}
                  </AdminButton>
                );
              })}
            </div>
            <AnimatePresence>
              {submitting && (
                <m.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] font-bold text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  {REVIEW_ACTIONS.find((a) => a.status === submitting)?.confirm}
                </m.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
//  مكونات فرعية
// ─────────────────────────────────────────────

function StudentCard({
  flag,
  onCopy,
}: {
  flag: import("./types").AntiCheatFlag;
  onCopy: (text: string) => void;
}) {
  return (
    <m.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border border-border/70 bg-card/60 p-5"
    >
      <p className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        <User className="h-4 w-4" /> الطالب
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-black text-primary">
          {getInitials(flag.userName, flag.userEmail)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black">
            {flag.userName || "طالب"}
          </p>
          <p className="truncate text-[11px] font-bold text-muted-foreground" dir="ltr">
            {flag.userEmail}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
        <InfoRow
          label="معرّف المستخدم"
          value={flag.userId}
          mono
          onCopy={() => onCopy(flag.userId)}
        />
        <InfoRow
          label="عنوان IP"
          value={flag.ipAddress || "—"}
          mono
          onCopy={flag.ipAddress ? () => onCopy(flag.ipAddress) : undefined}
        />
        <InfoRow label="تاريخ الاكتشاف" value={formatDateTime(flag.createdAt)} />
      </div>
    </m.div>
  );
}

function ExamCard({ flag }: { flag: import("./types").AntiCheatFlag }) {
  return (
    <m.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border/70 bg-card/60 p-5"
    >
      <p className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        <GraduationCap className="h-4 w-4" /> الامتحان
      </p>
      <p className="text-sm font-black">{flag.examTitle || "غير محدد"}</p>
      {flag.examId && (
        <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
          <InfoRow label="معرّف الامتحان" value={flag.examId} mono />
          {flag.attemptId && (
            <InfoRow label="معرّف المحاولة" value={flag.attemptId} mono />
          )}
        </div>
      )}
    </m.div>
  );
}

function RiskScoreCard({
  flag,
  level,
  eventCount,
}: {
  flag: import("./types").AntiCheatFlag;
  level: import("./types").RiskLevel;
  eventCount: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className={cn("rounded-2xl border-2 p-5", level.bg, level.text.replace("text-", "border-"))}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
          درجة المخاطر
        </p>
        <Badge variant="outline" className={cn("border-current/40 bg-current/10 font-black text-[10px]", level.text)}>
          {level.label}
        </Badge>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn("text-5xl font-black", level.text)}>
          {formatNumber(flag.riskScore)}
        </span>
        <span className="text-xs font-black opacity-70">/ 100</span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-foreground/10">
        <m.div
          className={cn("h-full rounded-full", level.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, flag.riskScore)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-black opacity-80">
        <span>{eventCount} حدث مراقبة</span>
        <span>{flag.lastEventAt ? timeAgo(flag.lastEventAt) : "—"}</span>
      </div>
    </m.div>
  );
}

function TimelineView({ events }: { events: import("./types").AntiCheatEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-12 text-muted-foreground">
        <ScrollText className="h-10 w-10 opacity-40" />
        <p className="mt-3 text-sm font-bold">لا توجد أحداث مسجلة</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500/50 via-amber-500/30 to-emerald-500/20" />
      <div className="space-y-3">
        {sorted.map((event, idx) => {
          const eCfg = EVENT_TYPE_CONFIG[event.eventType];
          const Icon = eCfg?.icon || ShieldAlert;
          const sCfg = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.LOW;
          return (
            <m.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative flex gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 transition hover:border-border hover:bg-card"
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
                  <span className="text-sm font-black">
                    {eCfg?.label || event.eventType}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("border px-2 py-0 text-[9px] font-black uppercase tracking-wider", sCfg.border, sCfg.text)}
                  >
                    {sCfg.label}
                  </Badge>
                  <span className="mr-auto text-[10px] font-bold text-muted-foreground">
                    {timeAgo(event.createdAt)}
                  </span>
                </div>
                {event.detail && (
                  <p className="mt-1.5 text-xs font-bold text-muted-foreground">
                    {event.detail}
                  </p>
                )}
                {eCfg?.description && (
                  <p className="mt-1 text-[10px] font-bold text-muted-foreground/70">
                    {eCfg.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted-foreground/60">
                  <span dir="ltr" className="font-mono">{event.ipAddress || "—"}</span>
                  <span>{formatDateTime(event.createdAt)}</span>
                </div>
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
}

function DetailsView({
  flag,
  eventCounts,
  onCopy,
}: {
  flag: import("./types").AntiCheatFlag;
  eventCounts: Record<string, number>;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
        <p className="mb-3 text-xs font-black">البيانات الوصفية</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <InfoRow label="ID الحالة" value={flag.id} mono onCopy={() => onCopy(flag.id)} />
          <InfoRow label="تاريخ التحديث" value={formatDateTime(flag.updatedAt)} />
          <InfoRow label="تاريخ المراجعة" value={formatDateTime(flag.reviewedAt)} />
          <InfoRow
            label="وكيل المتصفح"
            value={flag.reviewedAt ? "— متاح في الـmetadata —" : "—"}
            mono
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
        <p className="mb-3 text-xs font-black">ملخص أنواع الأحداث</p>
        {Object.keys(eventCounts).length === 0 ? (
          <p className="py-6 text-center text-xs font-bold text-muted-foreground">
            لا توجد بيانات
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(eventCounts).map(([type, count]) => {
              const cfg =
                type in EVENT_TYPE_CONFIG
                  ? EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG]
                  : undefined;
              const Icon = cfg?.icon || ShieldAlert;
              return (
                <div
                  key={type}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5",
                    cfg?.border || "border-border"
                  )}
                >
                  <Icon className={cn("h-4 w-4", cfg?.text)} />
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold">
                      {cfg?.label || type}
                    </p>
                    <p className="text-xs font-black">{count}×</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "text-[11px] font-black text-foreground/80 text-end",
            mono && "font-mono text-[10px]"
          )}
        >
          {value}
        </span>
        {onCopy && value && value !== "—" && (
          <button
            onClick={onCopy}
            className="rounded p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <CopyIcon className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}