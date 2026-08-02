"use client";

import * as React from "react";
import { Bell, CheckCheck, Clock3, ExternalLink, Sparkles, Trash2, ArrowRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/admin-button";
import type { RealtimeNotification } from "@/components/admin/dashboard/dashboard.types";

interface RealtimeNotificationsSectionProps {
  notifications: RealtimeNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  className?: string;
}

const notificationTypeClasses: Record<string, string> = {
  user: "bg-blue-500/10 text-blue-500",
  exam: "bg-green-500/10 text-green-500",
  system: "bg-purple-500/10 text-purple-500",
  achievement: "bg-yellow-500/10 text-yellow-500",
  payment: "bg-emerald-500/10 text-emerald-500",
  default: "bg-slate-500/10 text-slate-500",
};

const notificationLabels: Record<string, string> = {
  user: "مستخدم",
  exam: "امتحان",
  system: "نظام",
  achievement: "إنجاز",
  payment: "دفع",
  default: "إشعار",
};

export const RealtimeNotificationsSection = React.memo(function RealtimeNotificationsSection({
  notifications,
  unreadCount,
  onMarkAsRead,
  onDismiss,
  className,
}: RealtimeNotificationsSectionProps) {
  const displayNotifications = React.useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <div className={cn("rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl", className)}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">الإشعارات الفورية</h3>
            <p className="text-sm text-gray-400">تحديثات لحظية تُرسل للمستخدمين فورًا</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            {unreadCount} غير مقروءة
          </div>
          <a
            href="/admin/notifications"
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            عرض الكل
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {displayNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-sm text-gray-400">
            لا توجد إشعارات فورية حالياً.
          </div>
        ) : (
          displayNotifications.map((notification) => {
            const typeClass = notificationTypeClasses[notification.type] ?? notificationTypeClasses.default;
            return (
              <div
                key={notification.id}
                className={cn(
                  "rounded-2xl border border-white/10 bg-black/10 p-4 transition-all",
                  !notification.read && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className={cn("mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", typeClass)}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-white">{notification.title}</p>
                        {!notification.read && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                            جديد
                          </span>
                        )}
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
                          {notificationLabels[notification.type] ?? notificationLabels.default}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-400">{notification.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          <span>{new Date(notification.timestamp).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Inbox className="h-3.5 w-3.5" />
                          <span>{notification.actionUrl ? "لديه رابط مباشر" : "بدون رابط مباشر"}</span>
                        </div>
                      </div>

                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(notification.metadata).slice(0, 3).map(([key, value]) => (
                            <span key={key} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                    {!notification.read && (
                      <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        icon={CheckCheck}
                        className="h-9 px-2"
                      >
                        قراءة
                      </AdminButton>
                    )}
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      icon={Trash2}
                      className="h-9 px-2"
                    >
                      حذف
                    </AdminButton>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
