"use client";

import * as React from "react";
import { Announcements } from "@/components/admin/dashboard/announcements/announcements";
import { LatestExamsAssignments } from "@/components/admin/dashboard/latest/latest-exams-assignments";
import { LiveClasses } from "@/components/admin/dashboard/live/live-classes";
import { SecurityAlerts } from "@/components/admin/dashboard/security/security-alerts";
import type {
  DashboardAnnouncementItem,
  DashboardAssignmentItem,
  DashboardExamItem,
  DashboardLiveClass,
  DashboardSecurityAlert,
} from "@/lib/dashboard-payload-mapper";

interface ContentOverviewSectionProps {
  exams: DashboardExamItem[];
  assignments: DashboardAssignmentItem[];
  announcements: DashboardAnnouncementItem[];
  liveClasses: DashboardLiveClass[];
  securityAlerts: DashboardSecurityAlert[];
}

export const ContentOverviewSection = React.memo(function ContentOverviewSection({
  exams,
  assignments,
  announcements,
  liveClasses,
  securityAlerts,
}: ContentOverviewSectionProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <LiveClasses classes={liveClasses} />
        <SecurityAlerts alerts={securityAlerts} />
      </div>
      <LatestExamsAssignments exams={exams} assignments={assignments} />
      <Announcements announcements={announcements} />
    </div>
  );
});
