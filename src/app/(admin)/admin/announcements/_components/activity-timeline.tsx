"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  Clock,
  User,
  History,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";

export interface AnnouncementActivity {
  id: string;
  action: string;
  actor?: { id: string; name: string | null; avatar?: string | null } | null;
  details?: Record<string, unknown>;
  createdAt: string;
}

interface ActivityTimelineProps {
  announcementId: string;
  className?: string;
}

const ACTION_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  CREATE: { label: "تم إنشاء الإعلان", icon: Plus, color: "bg-blue-500/15 text-blue-500" },
  UPDATE: { label: "تم تعديل الإعلان", icon: Edit, color: "bg-amber-500/15 text-amber-500" },
  DELETE: { label: "تم حذف الإعلان", icon: Trash2, color: "bg-red-500/15 text-red-500" },
  PUBLISH: { label: "تم نشر الإعلان", icon: Eye, color: "bg-emerald-500/15 text-emerald-500" },
  UNPUBLISH: { label: "تم إخفاء الإعلان", icon: EyeOff, color: "bg-slate-500/15 text-slate-500" },
  BROADCAST: { label: "إعادة بث الإعلان", icon: Send, color: "bg-indigo-500/15 text-indigo-500" },
  RESEND: { label: "إعادة إرسال الإشعار", icon: RefreshCw, color: "bg-violet-500/15 text-violet-500" },
};

const DEFAULT_META = { label: "إجراء", icon: Activity, color: "bg-white/10 text-muted-foreground" };

export function ActivityTimeline({ announcementId, className }: ActivityTimelineProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "announcements", "activity", announcementId],
    queryFn: async () => {
      const res = await adminFetch(
        `/api/admin/announcements/${announcementId}/activity`
      );
      if (!res.ok) {
        // fallback graceful: endpoint قد لا يكون موجوداً بعد
        return { activities: [] as AnnouncementActivity[] };
      }
      const json = await res.json();
      return {
        activities:
          (json?.data?.activities as AnnouncementActivity[]) ||
          (json?.activities as AnnouncementActivity[]) ||
          [],
      };
    },
    staleTime: 60000,
  });

  const activities = data?.activities || [];

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center gap-2 text-xs font-black text-muted-foreground">
        <History className="h-4 w-4" />
        سجل النشاط
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2.5 p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] font-bold text-amber-700">
          تعذّر تحميل سجل النشاط.
        </div>
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-8 text-center text-xs font-bold text-muted-foreground">
          <Activity className="h-6 w-6 opacity-40" />
          لا توجد أنشطة مسجلة بعد
        </div>
      )}

      {!isLoading && activities.length > 0 && (
        <ol className="relative space-y-2 border-r-2 border-white/5 pr-4">
          {activities.map((act, i) => {
            const meta = ACTION_META[act.action] || DEFAULT_META;
            const Icon = meta.icon;
            const isLast = i === activities.length - 1;
            return (
              <li key={act.id} className="relative">
                {!isLast && (
                  <span className="absolute -right-[calc(1rem+5px)] top-9 h-full w-px bg-white/10" />
                )}
                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/2.5 p-3 transition hover:bg-white/5">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      meta.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black">{meta.label}</p>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                    {act.actor && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <User className="h-3 w-3" />
                        بواسطة {act.actor.name || "النظام"}
                      </p>
                    )}
                    {act.details && Object.keys(act.details).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(act.details).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}