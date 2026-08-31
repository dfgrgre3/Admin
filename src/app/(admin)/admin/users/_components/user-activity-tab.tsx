"use client";

import * as React from "react";
import { ActivityList, ActivityLoadingState } from "../_tabs/_activity/activity-list";
import { ActivityStats } from "../_tabs/_activity/activity-stats";
import type { ActivityItem, UserActivityTabProps } from "../_tabs/_activity/activity-types";

export function UserActivityTab({ userId: _userId }: UserActivityTabProps) {
  const [activities] = React.useState<ActivityItem[]>([]);
  const [loading] = React.useState(false);

  if (loading) return <ActivityLoadingState />;

  return (
    <div className="space-y-4">
      <ActivityStats activities={activities} />
      <ActivityList activities={activities} />
    </div>
  );
}