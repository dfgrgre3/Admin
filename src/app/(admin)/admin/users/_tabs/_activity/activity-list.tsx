"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { formatDate } from "@/lib/utils";
import type { ActivityItem } from "./activity-types";
import { ActivityIcon, ActivityTypeBadge } from "./activity-badges";

interface ActivityListProps {
  activities: ActivityItem[];
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
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
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActivityTypeBadge type={activity.type} />
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
  );
}

export function ActivityLoadingState() {
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