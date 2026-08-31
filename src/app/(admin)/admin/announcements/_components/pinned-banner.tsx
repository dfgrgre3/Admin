"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Pin, X, ExternalLink, AlertTriangle, Info, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import type { Announcement } from "./types";

interface PinnedBannerProps {
  /** معرّف الإعلان أو المعرّف الديناميكي حسب الفلتر */
  announcementId?: string;
  /** عند تفعيل الوضع preview يعرض دائماً */
  preview?: boolean;
  /** دالة تنادى عند الإغلاق (dismiss) */
  onDismiss?: (id: string) => void;
  /** معرّف جلسة لتتبع إخفاء المستخدم */
  sessionKey?: string;
  className?: string;
}

type BannerPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_META: Record<BannerPriority, { icon: React.ElementType; color: string }> = {
  LOW: { icon: Info, color: "bg-blue-500/10 border-blue-500/30 text-blue-700" },
  MEDIUM: { icon: Megaphone, color: "bg-slate-500/10 border-slate-500/30 text-slate-700" },
  HIGH: { icon: AlertTriangle, color: "bg-amber-500/10 border-amber-500/30 text-amber-700" },
  URGENT: { icon: AlertTriangle, color: "bg-red-500/10 border-red-500/30 text-red-700" },
};

const PRIORITY_DEFAULT: { icon: React.ElementType; color: string } = {
  icon: Megaphone,
  color: "bg-slate-500/10 border-slate-500/30 text-slate-700",
};

/**
 * مكوّن Banner المثبت الذي يظهر في أعلى الصفحة الرئيسية
 * يعرض الإعلانات التي تم تعليمها كمثبتة (pinned)
 * مع احترام إذن المستخدم لإخفائها (dismiss)
 */
export function PinnedBanner({
  announcementId,
  preview = false,
  onDismiss,
  sessionKey = "announcement-dismissed",
  className,
}: PinnedBannerProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  // تحميل قائمة المُخفية من sessionStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(sessionKey);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setDismissed(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, [sessionKey]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "pinned", announcementId ?? "all"],
    queryFn: async () => {
      const url = announcementId
        ? `/api/admin/announcements/${announcementId}`
        : `/api/admin/announcements?pinned=true&status=published&limit=5`;
      const res = await adminFetch(url);
      if (!res.ok) return { items: [] as Announcement[] };
      const json = await res.json();
      const items: Announcement[] =
        (json?.data?.items as Announcement[]) ||
        (json?.data?.announcements as Announcement[]) ||
        (json?.items as Announcement[]) ||
        (json?.announcements as Announcement[]) ||
        [];
      return { items };
    },
    enabled: preview || !!announcementId,
    staleTime: 30000,
  });

  const items = React.useMemo(
    () => (data?.items || []).filter((a) => !dismissed.has(a.id)),
    [data, dismissed]
  );

  const handleDismiss = React.useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(sessionKey, JSON.stringify([...next]));
          } catch {
            // ignore
          }
        }
        return next;
      });
      onDismiss?.(id);
    },
    [onDismiss, sessionKey]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)} dir="rtl">
      {items.map((a) => {
        const meta = PRIORITY_META[a.priority] || PRIORITY_DEFAULT;
        const Icon = meta.icon;
        const cleanContent = (a.content || "").replace(/<[^>]+>/g, "").slice(0, 120);
        return (
          <div
            key={a.id}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border p-3 transition-all",
              meta.color
            )}
            role="alert"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/40 backdrop-blur">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Pin className="h-3 w-3 opacity-70" />
                <p className="text-xs font-black">{a.title}</p>
                {a.priority === "HIGH" && (
                  <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                    عاجل
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[10px] font-bold opacity-80">
                {cleanContent}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {a.link && (
                <a
                  href={a.link}
                  className="flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-[10px] font-black transition hover:bg-black/20"
                >
                  <ExternalLink className="h-3 w-3" />
                  افتح
                </a>
              )}
              <button
                type="button"
                onClick={() => handleDismiss(a.id)}
                className="rounded-md p-1 transition hover:bg-black/10"
                aria-label="إغلاق"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Hook مبسّط لاستخدام Banner مع منطق الإظهار/الإخفاء
 */
export function usePinnedBanner(announcementId?: string) {
  const [dismissed, setDismissed] = React.useState(false);

  const dismiss = React.useCallback(() => setDismissed(true), []);

  return {
    isVisible: !dismissed,
    dismiss,
    PinnedBannerComponent: (props: Omit<PinnedBannerProps, "announcementId" | "onDismiss">) =>
      dismissed ? null : (
        <PinnedBanner
          announcementId={announcementId}
          onDismiss={dismiss}
          {...props}
        />
      ),
  };
}