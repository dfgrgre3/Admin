"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { ActivityFeed, UpcomingEvents } from "@/components/admin/dashboard/widgets";
import { Activity, Calendar, Clock, Bell } from "lucide-react";

interface ActivitySectionProps {
  recentActivity: Array<{
    id: string;
    userId: string;
    type: "exam" | "user" | "achievement" | "task" | "post" | "comment";
    title: string;
    description: string;
    timestamp: Date;
    user?: {
      name: string;
      avatar: string;
    };
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: Date;
    type: "exam" | "challenge" | "announcement";
  }>;
  onRefresh?: () => void;
  loading?: boolean;
}

export function ActivitySection({
  recentActivity,
  upcomingEvents,
  onRefresh,
  loading = false
}: ActivitySectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Activity Feed */}
      <div className="lg:col-span-2">
        <AdminCard variant="glass" className="border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span>نشاط المنصة الأخير</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>محدث تلقائياً</span>
            </div>
          </div>
          <ActivityFeed activities={recentActivity} onRefresh={onRefresh} loading={loading} />
        </AdminCard>
      </div>

      {/* Upcoming Events */}
      <div>
        <AdminCard variant="glass" className="border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span>الأحداث القادمة</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span>تنبيهات</span>
            </div>
          </div>
          <UpcomingEvents events={upcomingEvents} />
          {upcomingEvents.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                لا توجد فعاليات مجدولة
              </p>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
