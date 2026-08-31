"use client";

import * as React from "react";
import {
  Send,
  Users,
  Mail,
  Bell,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  ShieldAlert,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { Announcement, CHANNEL_OPTIONS, CHANNEL_VALUES, summarizeAudience } from "./types";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onComplete?: () => void;
}

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  in_app: Bell,
  push: Sparkles,
  email: Mail,
  sms: MessageSquare,
};

export function BroadcastDialog({
  open,
  onOpenChange,
  announcement,
  onComplete,
}: BroadcastDialogProps) {
  const [channels, setChannels] = React.useState<Record<string, boolean>>({
    in_app: true,
    push: false,
    email: false,
    sms: false,
  });
  const [priority, setPriority] = React.useState<"low" | "normal" | "high" | "urgent">("normal");
  const [overrideAudience, setOverrideAudience] = React.useState(false);
  const [audienceQuery, setAudienceQuery] = React.useState("");
  const [audienceSize, setAudienceSize] = React.useState<number | null>(null);
  const [loadingAudience, setLoadingAudience] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  // مزامنة الحالة عند فتح الحوار
  React.useEffect(() => {
    if (!open || !announcement) return;
    const initial: Record<string, boolean> = {};
    for (const c of CHANNEL_VALUES) {
      initial[c] = announcement.channels?.includes(c as never) ?? c === "in_app";
    }
    setChannels(initial);
    setPriority(
      announcement.priority === "HIGH"
        ? "urgent"
        : announcement.priority === "MEDIUM"
        ? "normal"
        : "low"
    );
    setOverrideAudience(false);
    setAudienceQuery("");
  }, [open, announcement]);

  // تقدير حجم الجمهور
  React.useEffect(() => {
    if (!open || !announcement || !overrideAudience) {
      setAudienceSize(null);
      return;
    }
    const ctrl = new AbortController();
    const run = async () => {
      setLoadingAudience(true);
      try {
        const params = new URLSearchParams({ limit: "1" });
        const segs = announcement.audience || ["all"];
        params.set("segment", segs.join(","));
        if (announcement.audienceGrades?.length) {
          params.set("grade", announcement.audienceGrades.join(","));
        }
        if (audienceQuery) params.set("search", audienceQuery);
        const res = await adminFetch(`${apiRoutes.admin.users}?${params.toString()}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const json = await res.json();
          const total = json?.pagination?.total ?? json?.data?.pagination?.total ?? 0;
          setAudienceSize(total);
        }
      } catch {
        // cancelled
      } finally {
        setLoadingAudience(false);
      }
    };
    void run();
    return () => ctrl.abort();
  }, [open, announcement, overrideAudience, audienceQuery]);

  const activeChannels = Object.entries(channels)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const totalEstimate =
    audienceSize ??
    (announcement?.audience?.includes("all")
      ? null
      : announcement?.audienceUserIds?.length ?? null);

  const handleSend = async () => {
    if (!announcement) return;
    if (activeChannels.length === 0) {
      toast.error("اختر قناة واحدة على الأقل");
      return;
    }
    setSending(true);
    const toastId = toast.loading("جاري إرسال البث...");
    try {
      const res = await adminFetch(apiRoutes.admin.notificationBroadcast, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementId: announcement.id,
          channels: activeChannels,
          priority,
          userIds:
            overrideAudience && announcement.audience?.includes("custom")
              ? announcement.audienceUserIds
              : undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { error?: string })?.error || "فشل في إرسال البث");
      }
      const summary = (json as { summary?: { success?: number; failed?: number } })?.summary;
      toast.success(
        `تم إرسال البث بنجاح إلى ${summary?.success ?? "المستخدمين المستهدفين"} مستخدم`,
        { id: toastId }
      );
      onComplete?.();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطأ في إرسال البث", { id: toastId });
    } finally {
      setSending(false);
    }
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/90 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Send className="h-7 w-7 text-indigo-500" />
              إعادة بث الإعلان
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              إرسال «{announcement.title}» عبر قنوات متعددة إلى جمهور مستهدف.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* ── الجمهور ──────────────────────────────────────────────────────── */}
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/2.5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm font-black">الجمهور المستهدف</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">جمهور مخصص</span>
                  <Switch
                    checked={overrideAudience}
                    onCheckedChange={setOverrideAudience}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                  {summarizeAudience(announcement.audience, {
                    grades: announcement.audienceGrades,
                    roles: [],
                  })}
                </p>
                {overrideAudience ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="بحث متقدم (اختياري)..."
                      value={audienceQuery}
                      onChange={(e) => setAudienceQuery(e.target.value)}
                      className="h-9 rounded-lg bg-white/5"
                    />
                    {loadingAudience ? (
                      <p className="text-[10px] font-bold text-muted-foreground animate-pulse">
                        جاري تقدير الجمهور...
                      </p>
                    ) : audienceSize !== null ? (
                      <p className="text-[10px] font-black flex items-center gap-1 text-primary">
                        <Target className="h-3 w-3" />
                        عدد المستهدفين التقريبي: {audienceSize.toLocaleString("ar-EG")} مستخدم
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-muted-foreground">
                    سيتم استخدام الجمهور المعرّف في الإعلان كما هو
                  </p>
                )}
                {totalEstimate && !overrideAudience && (
                  <p className="mt-2 text-[10px] font-black text-primary">
                    <Target className="inline h-3 w-3 ml-1" />
                    مستهدف: {totalEstimate.toLocaleString("ar-EG")} مستخدم
                  </p>
                )}
              </div>
            </div>

            {/* ── القنوات ──────────────────────────────────────────────────────── */}
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/2.5 p-4">
              <p className="text-sm font-black flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                قنوات الإرسال
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CHANNEL_OPTIONS.map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.value] || Bell;
                  const active = channels[ch.value];
                  return (
                    <button
                      key={ch.value}
                      type="button"
                      onClick={() =>
                        setChannels((prev) => ({ ...prev, [ch.value]: !prev[ch.value] }))
                      }
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3 text-right transition",
                        active
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/10 bg-white/2.5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl transition",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/5 text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black">{ch.label}</p>
                          <p className="text-[10px] font-bold text-muted-foreground line-clamp-1">
                            {ch.description}
                          </p>
                        </div>
                      </div>
                      {ch.recommended && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                          موصى
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── الأولوية ────────────────────────────────────────────────────── */}
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/2.5 p-4">
              <p className="text-sm font-black flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                أولوية الإرسال
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "low", label: "منخفضة", color: "slate" },
                  { v: "normal", label: "عادية", color: "blue" },
                  { v: "high", label: "عالية", color: "amber" },
                  { v: "urgent", label: "عاجلة", color: "red" },
                ].map((opt) => {
                  const active = priority === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setPriority(opt.v as never)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-black transition",
                        active
                          ? "bg-primary text-primary-foreground shadow"
                          : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* تحذيرات */}
            {channels.sms && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] font-bold text-amber-700">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  إرسال SMS يستهلك رصيد الرسائل النصية. تأكد من توفر الرصيد قبل المتابعة.
                </span>
              </div>
            )}

            {activeChannels.length > 1 && (
              <div className="flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-[10px] font-bold text-blue-700">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  سيتم الإرسال عبر {activeChannels.length} قنوات بالتوازي. قد يستغرق ذلك عدة ثوانٍ.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex justify-between gap-2 sm:gap-3">
            <AdminButton variant="outline" onClick={() => onOpenChange(false)} icon={X}>
              إلغاء
            </AdminButton>
            <AdminButton
              onClick={handleSend}
              loading={sending}
              icon={sending ? Loader2 : Send}
              disabled={activeChannels.length === 0}
            >
              إرسال البث الآن
            </AdminButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}