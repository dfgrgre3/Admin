"use client";

import * as React from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { AdminCard } from "../ui/admin-card";
import { AdminButton, IconButton } from "../ui/admin-button";
import { AdminBadge } from "../ui/admin-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Target,
  Clock,
  Calendar,
  FileText,
  Award,
  MessageSquare,
  Activity,
  ChevronLeft,
  RefreshCw,
  ClipboardList,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

// Activity Feed Widget
interface ActivityItem {
  id: string;
  type: "user" | "exam" | "achievement" | "task" | "post" | "comment";
  title: string;
  description?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

const activityConfig: Record<ActivityItem["type"], { icon: LucideIcon; color: string; bg: string; label: string }> = {
  user: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", label: "مستخدم جديد" },
  exam: { icon: Target, color: "text-green-500", bg: "bg-green-500/10", label: "امتحان" },
  achievement: { icon: Award, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "إنجاز" },
  task: { icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-500/10", label: "مهمة تعليمية" },
  post: { icon: FileText, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "منشور" },
  comment: { icon: MessageSquare, color: "text-pink-500", bg: "bg-pink-500/10", label: "تعليق" },
};


export const ActivityFeed = React.memo(function ActivityFeed({
  activities,
  title = "آخر النشاطات",
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  onRefresh,
  loading = false,
  className,
}: ActivityFeedProps) {
  // Memoize display activities to prevent unnecessary re-renders
  const displayActivities = React.useMemo(() => {
    if (!activities || activities.length === 0) return [];
    return activities.slice(0, maxItems);
  }, [activities, maxItems]);

  const isLoading = React.useMemo(() => loading, [loading]);
  const isEmpty = React.useMemo(() => !isLoading && displayActivities.length === 0, [isLoading, displayActivities]);

  // activityConfig is a module-level constant — no memoization needed
  const configMemo = activityConfig;

  return (
    <AdminCard className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <IconButton
              icon={RefreshCw}
              label="تحديث"
              variant="ghost"
              size="icon-sm"
              onClick={onRefresh}
              className={loading ? "animate-spin" : ""}
            />
          )}
          {showViewAll && onViewAll && (
            <AdminButton variant="ghost" size="sm" onClick={onViewAll}>
              عرض الكل
              <ChevronLeft className="h-4 w-4 mr-1" />
            </AdminButton>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {loading ? (
          // Loading skeleton
          Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">لا توجد نشاطات حديثة</p>
          </div>
        ) : (
          displayActivities.map((activity) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50",
                )}
              >
                {activity.user ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback>
                      {activity.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.bg)}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>

                <AdminBadge variant="outline" size="sm" className="flex-shrink-0">
                  {config.label}
                </AdminBadge>
              </div>
            );
          })
        )}
      </div>
    </AdminCard>
  );
});

// Upcoming Events Widget
interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  type: "exam" | "event" | "deadline" | "meeting" | "challenge" | "announcement";
  location?: string;
  participants?: number;
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const eventConfig = {
  exam: { icon: Target, color: "text-red-500", bg: "bg-red-500/10", label: "اختبار" },
  event: { icon: Calendar, color: "text-green-500", bg: "bg-green-500/10", label: "فعالية" },
  deadline: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "موعد نهائي" },
  meeting: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", label: "اجتماع إداري" },
  challenge: { icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-500/10", label: "تحدي" },
  announcement: { icon: Megaphone, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "إعلان" },
} as const;

export const UpcomingEvents = React.memo(function UpcomingEvents({
  events,
  title = "جدول المواعيد",
  maxItems = 4,
  className,
}: UpcomingEventsProps) {
  const displayEvents = React.useMemo(
    () => events.slice(0, maxItems),
    [events, maxItems]
  );

  return (
    <div className={cn("admin-glass p-8 border-primary/10", className)}>
      {/* Header with count badge */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-xl flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <span>{title}</span>
        </h3>
        <div className="p-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black tracking-widest text-primary uppercase">
           {events.length} موعد
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-4">
        {displayEvents.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-bold italic">لا توجد مواعيد قادمة حالياً...</div>
        ) : (
          displayEvents.map((event) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const eventDate = new Date(event.date);
            const isToday = eventDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 transition-all hover:bg-white/10 hover:border-primary/30 group",
                  isToday && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110", config.bg)}>
                  <Icon className={cn("h-6 w-6", config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <p className="text-sm font-black truncate">{event.title}</p>
                     <span className={cn("text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-muted/50", config.color)}>{config.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold flex items-center gap-2">
                    <span className="text-primary/70">{eventDate.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric" })}</span>
                    {event.location && (
                      <>
                        <span className="opacity-20">⬢</span>
                        <span className="flex items-center gap-1 italic"><Target className="w-3 h-3" /> {event.location}</span>
                      </>
                    )}
                  </p>
                </div>

                {isToday && (
                  <div className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 animate-pulse"></span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});



