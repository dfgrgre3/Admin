"use client";

import * as React from "react";
import { RecentSection } from "@/components/admin/dashboard/recent/recent-items";
import type { DashboardRecentItem } from "@/lib/dashboard-payload-mapper";

interface RecentItemsSectionProps {
  recentOrders: DashboardRecentItem[];
  recentPayments: DashboardRecentItem[];
  recentStudents: DashboardRecentItem[];
  recentTeachers: DashboardRecentItem[];
  recentCourses: DashboardRecentItem[];
}

export const RecentItemsSection = React.memo(function RecentItemsSection(props: RecentItemsSectionProps) {
  return <RecentSection {...props} />;
});
