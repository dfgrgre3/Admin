"use client";

import * as React from "react";
import DOMPurify from "dompurify";
import {
  CalendarDays,
  Clock,
  X,
  Megaphone,
  Smartphone,
  Tablet,
  Monitor,
  Users,
  Eye,
  MousePointerClick,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import {
  Announcement,
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  getAnnouncementStatus,
  getAnnouncementStatusLabel,
  summarizeAudience,
} from "./types";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

/** محتوى الإعلان كما سيظهر للمستخدمين */
export function AnnouncementPreviewContent({
  announcement,
  compact = false,
  showMeta = true,
}: {
  announcement: Announcement;
  compact?: boolean;
  showMeta?: boolean;
}) {
  const config = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.INFO;
  const priority = PRIORITY_CONFIG[announcement.priority] || PRIORITY_CONFIG.MEDIUM;
  const Icon = config.icon;
  const safeContent = React.useMemo(
    () => DOMPurify.sanitize(announcement.content || ""),
    [announcement.content]
  );

  const status = getAnnouncementStatus(announcement);
  const statusLabel = getAnnouncementStatusLabel(status);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-b from-card to-muted/40 shadow-inner",
        config.borderClass,
        compact ? "p-4" : "p-5"
      )}
      dir="rtl"
    >
      <div
        className={cn(
          "absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-25",
          config.bgClass
        )}
      />

      <div className="relative space-y-3">
        {/* رأس الإشعار */}
        {showMeta && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl border shrink-0",
                  config.bgClass,
                  config.borderClass
                )}
              >
                <Icon className={cn("h-5 w-5", config.textClass)} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-muted-foreground">منصة ثانوي</p>
                <p className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {announcement.createdAt
                    ? formatDateTime(announcement.createdAt)
                    : "الآن"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black",
                priority.badgeClass,
                "bg-white/5"
              )}
            >
              أولوية {priority.label}
            </span>
          </div>
        )}

        {/* العنوان */}
        <div>
          <h3 className="text-lg font-black tracking-tight leading-snug">
            {announcement.title}
          </h3>
          {status !== "active" && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              حالة الإعلان: {statusLabel}
            </p>
          )}
        </div>

        {/* المحتوى */}
        {safeContent && (
          <div
            className={cn(
              "text-sm leading-7 text-muted-foreground [&_a]:text-primary [&_a]:underline prose prose-sm dark:prose-invert max-w-none",
              compact && "line-clamp-6 text-xs leading-6"
            )}
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        )}

        {/* رابط CTA إن وُجد */}
        {announcement.link && (
          <a
            href={announcement.link}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-black text-primary hover:underline"
          >
            اعرف المزيد
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

type Viewport = "mobile" | "tablet" | "desktop";

const VIEWPORT_META: Record<
  Viewport,
  { label: string; icon: React.ElementType; width: string; height: string }
> = {
  mobile: { label: "جوال", icon: Smartphone, width: "max-w-[320px]", height: "h-[560px]" },
  tablet: { label: "لوحي", icon: Tablet, width: "max-w-[600px]", height: "h-[480px]" },
  desktop: { label: "سطح المكتب", icon: Monitor, width: "max-w-full", height: "h-[420px]" },
};

function EngagementSimulator({ announcement }: { announcement: Announcement }) {
  const m = announcement.metrics;
  if (!m) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/2.5 p-3 text-[10px] font-bold text-muted-foreground">
        إحصائيات التفاعل غير متاحة حالياً لهذا الإعلان.
      </div>
    );
  }
  const ctr =
    m.views > 0 ? Math.min(100, Math.round((m.clicks / m.views) * 100)) : 0;
  const readRate =
    m.delivered > 0 ? Math.min(100, Math.round((m.read / m.delivered) * 100)) : 0;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <MetricTile
        icon={Eye}
        label="مشاهدات"
        value={m.views.toLocaleString("ar-EG")}
        color="blue"
      />
      <MetricTile
        icon={MousePointerClick}
        label="نقرات"
        value={m.clicks.toLocaleString("ar-EG")}
        color="amber"
      />
      <MetricTile
        icon={Users}
        label="تم التسليم"
        value={m.delivered.toLocaleString("ar-EG")}
        color="violet"
      />
      <MetricTile
        icon={CheckCircle2}
        label="معدل القراءة"
        value={`${readRate}%`}
        color="green"
      />
      <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-4">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span>معدل النقر (CTR)</span>
          <span className="text-primary">{ctr}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all"
            style={{ width: `${Math.min(100, ctr)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "blue" | "amber" | "violet" | "green";
}) {
  const bg = {
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500",
    violet: "bg-violet-500/10 text-violet-500",
    green: "bg-emerald-500/10 text-emerald-500",
  }[color];

  return (
    <div className="rounded-xl border border-white/5 bg-white/2.5 p-3">
      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground">
        <span className={cn("rounded-lg p-1.5", bg)}>
          <Icon className="h-3 w-3" />
        </span>
        {label}
      </div>
      <p className="mt-1 text-base font-black tabular-nums">{value}</p>
    </div>
  );
}

export function PreviewDialog({ open, onOpenChange, announcement }: PreviewDialogProps) {
  const [viewport, setViewport] = React.useState<Viewport>("mobile");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card/90 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <Megaphone className="h-6 w-6 text-blue-500" />
              معاينة الإعلان
            </DialogTitle>
          </DialogHeader>

          {announcement ? (
            <div className="space-y-6">
              {/* ── محدد حجم الشاشة ───────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  معاينة على أحجام الشاشات
                </p>
                <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                  {(Object.keys(VIEWPORT_META) as Viewport[]).map((v) => {
                    const meta = VIEWPORT_META[v];
                    const Icon = meta.icon;
                    const active = viewport === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setViewport(v)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black transition",
                          active
                            ? "bg-primary text-primary-foreground shadow"
                            : "text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── إطار المعاينة ──────────────────────────────────────────── */}
              <div className="flex justify-center">
                {viewport === "mobile" && (
                  <div className="rounded-[2.5rem] border-[6px] border-neutral-900 bg-neutral-950 shadow-2xl overflow-hidden">
                    <div className="relative flex items-center justify-center py-3">
                      <div className="h-5 w-24 rounded-full bg-neutral-900" />
                    </div>
                    <div className="bg-neutral-900 px-3 pb-6">
                      <AnnouncementPreviewContent announcement={announcement} compact />
                    </div>
                  </div>
                )}

                {viewport === "tablet" && (
                  <div className="rounded-2xl border-[6px] border-neutral-900 bg-neutral-950 shadow-2xl overflow-hidden w-full max-w-[600px]">
                    <div className="bg-neutral-900 px-4 py-3">
                      <AnnouncementPreviewContent announcement={announcement} />
                    </div>
                  </div>
                )}

                {viewport === "desktop" && (
                  <div className="w-full rounded-xl border border-white/10 bg-neutral-950 shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-white/5 bg-white/2.5 px-4 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="mr-3 text-[10px] font-bold text-muted-foreground">
                        منصة ثانوي — لوحة الإعلانات
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-3 p-4">
                      <div className="col-span-8">
                        <AnnouncementPreviewContent announcement={announcement} />
                      </div>
                      <div className="col-span-4 space-y-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-[10px] font-black text-muted-foreground">
                            إعلان جانبي
                          </p>
                          <p className="mt-1 text-xs font-bold opacity-60">
                            محتوى إضافي للوحة الرئيسية
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── التفاصيل + الجمهور + التفاعل ─────────────────────────────── */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-black text-muted-foreground mb-1">
                    تاريخ النشر
                  </p>
                  <p className="font-bold flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-black text-muted-foreground mb-1">
                    الحالة
                  </p>
                  <p className="font-bold">
                    {announcement.isActive ? (
                      <span className="text-emerald-500">منشور للمستخدمين</span>
                    ) : (
                      <span className="text-muted-foreground">مخفي حالياً</span>
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-black text-muted-foreground mb-1">
                    الجمهور
                  </p>
                  <p className="text-xs font-bold line-clamp-2">
                    {summarizeAudience(announcement.audience, {
                      grades: announcement.audienceGrades,
                    })}
                  </p>
                </div>
              </div>

              {announcement.scheduledAt && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-[10px] font-bold text-blue-700">
                  <Clock className="h-3.5 w-3.5" />
                  مجدول للنشر في: {formatDateTime(announcement.scheduledAt)}
                </div>
              )}

              {announcement.expiresAt && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] font-bold text-amber-700">
                  <CalendarDays className="h-3.5 w-3.5" />
                  ينتهي في: {formatDateTime(announcement.expiresAt)}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  إحصائيات التفاعل
                </p>
                <EngagementSimulator announcement={announcement} />
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm font-bold text-muted-foreground">
              لا يوجد إعلان للمعاينة
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <AdminButton variant="outline" icon={X} onClick={() => onOpenChange(false)}>
              إغلاق
            </AdminButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}