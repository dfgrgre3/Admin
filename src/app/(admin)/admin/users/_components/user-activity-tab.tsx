"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, TrendingUp, Award, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "study" | "exam" | "achievement" | "course_completed" | "login";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface UserActivityTabProps {
  userId: string;
}

type ActivityBadgeVariant = "default" | "secondary" | "outline";

export function UserActivityTab({ userId: _userId }: UserActivityTabProps) {
  const [activities] = React.useState<ActivityItem[]>([]);
  const [loading] = React.useState(false);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "study":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "exam":
        return <Activity className="h-5 w-5 text-purple-500" />;
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />;
      case "course_completed":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "login":
        return <Clock className="h-5 w-5 text-cyan-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: ActivityBadgeVariant }> = {
      study: { label: "دراسة", variant: "default" },
      exam: { label: "اختبار", variant: "secondary" },
      achievement: { label: "إنجاز", variant: "default" },
      course_completed: { label: "إكمال كورس", variant: "default" },
      login: { label: "تسجيل دخول", variant: "outline" },
    };
    const badge = badges[type] || { label: type, variant: "outline" };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي الأنشطة</p>
              <p className="text-2xl font-black">{activities.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">جلسات دراسة</p>
              <p className="text-2xl font-black">
                {activities.filter((a) => a.type === "study").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">اختبارات</p>
              <p className="text-2xl font-black">
                {activities.filter((a) => a.type === "exam").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إنجازات</p>
              <p className="text-2xl font-black">
                {activities.filter((a) => a.type === "achievement").length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Activity Timeline */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">سجل النشاط</h3>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا يوجد نشاط بعد</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getActivityBadge(activity.type)}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}