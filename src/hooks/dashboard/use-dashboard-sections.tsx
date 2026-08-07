"use client";

import * as React from "react";
import { StatsSection } from "@/components/admin/dashboard/sections/stats-section";
import { QuickActionsSection } from "@/components/admin/dashboard/sections/quick-actions-section";
import { IntelligenceSection } from "@/components/admin/dashboard/sections/intelligence-section";
import { SystemDiagnosticsSection } from "@/components/admin/dashboard/sections/system-diagnostics-section";
import { ActivityDistributionSection } from "@/components/admin/dashboard/sections/activity-distribution-section";
import { RealtimeNotificationsSection } from "@/components/admin/dashboard/sections/realtime-notifications-section";
import { CommandCenterSection } from "@/components/admin/dashboard/sections/command-center-section";
import { RevenueSection } from "@/components/admin/dashboard/sections/revenue-section";
import { GrowthSection } from "@/components/admin/dashboard/sections/growth-section";
import { RecentItemsSection } from "@/components/admin/dashboard/sections/recent-items-section";
import { ContentOverviewSection } from "@/components/admin/dashboard/sections/content-overview-section";
import { LazySection } from "@/components/admin/ui/lazy-section";
import { useAuth } from "@/contexts/auth-context";
import type { useDashboardDerivedData } from "@/hooks/dashboard/use-dashboard-derived-data";
import type { RealtimeNotification } from "@/components/admin/dashboard/dashboard.types";

type DerivedData = ReturnType<typeof useDashboardDerivedData>;

interface UseDashboardSectionsParams {
  derived: DerivedData;
  timeFilter: string;
  playSound: (sound: string) => void;
  notifications: RealtimeNotification[];
  markAsRead: (id: string) => void;
  dismiss: (id: string) => void;
  wsConnected: boolean;
  isError: boolean;
  errorCount: number;
  lastUpdated: Date | null;
  isFetching: boolean;
  onTimeFilterChange: (filter: "today" | "week" | "month" | "year") => void;
  onExport: () => void;
  onRefresh: () => void;
  onOpenBroadcast: () => void;
}

export function useDashboardSections({
  derived,
  timeFilter,
  playSound,
  notifications,
  markAsRead,
  dismiss,
  wsConnected,
  isError,
  errorCount,
  lastUpdated,
  isFetching,
  onTimeFilterChange,
  onExport,
  onRefresh,
  onOpenBroadcast,
}: UseDashboardSectionsParams) {
  const { isAuthenticated, user } = useAuth();
  const sessionRole = user?.role ? String(user.role) : undefined;

  return React.useMemo(() => {
    if (!derived.comprehensiveStats || !derived.revenue || !derived.users || !derived.teachers) {
      return [];
    }

    return [
      {
        id: "main-stats",
        content: (
          <StatsSection
            comprehensiveStats={derived.comprehensiveStats}
            activity={derived.safeActivity}
            timeFilter={timeFilter}
            onTimeFilterChange={onTimeFilterChange}
            onExport={onExport}
          />
        ),
      },
      {
        id: "revenue-overview",
        content: (
          <LazySection minHeight={260} rootMargin="250px">
            <RevenueSection revenue={derived.revenue} />
          </LazySection>
        ),
      },
      {
        id: "growth-overview",
        content: (
          <LazySection minHeight={320} rootMargin="250px">
            <GrowthSection users={derived.users} teachers={derived.teachers} />
          </LazySection>
        ),
      },
      {
        id: "quick-actions",
        content: <QuickActionsSection playSound={playSound} />,
      },
      {
        id: "realtime-notifications",
        content: (
          <div id="realtime-notifications-section" className="w-full">
            <RealtimeNotificationsSection
              notifications={notifications}
              unreadCount={notifications.filter((item) => !item.read).length}
              onMarkAsRead={markAsRead}
              onDismiss={dismiss}
            />
          </div>
        ),
      },
      {
        id: "command-center",
        content: <CommandCenterSection playSound={playSound} />,
      },
      {
        id: "intelligence",
        content: (
          <LazySection minHeight={400} rootMargin="250px">
            <IntelligenceSection
              userGrowthData={derived.safeCharts.userGrowth}
              activityData={derived.safeCharts.activity}
              recentActivity={derived.safeRecentActivity}
              upcomingEvents={derived.safeUpcomingEvents}
              goals={derived.safeGoals}
              timeFilter={timeFilter}
              onTimeFilterChange={onTimeFilterChange}
              onRefresh={onRefresh}
              onOpenBroadcast={onOpenBroadcast}
              isFetching={isFetching}
              playSound={playSound}
            />
          </LazySection>
        ),
      },
      {
        id: "recent-items",
        content: (
          <LazySection minHeight={360} rootMargin="250px">
            <RecentItemsSection
              recentOrders={derived.recentOrders}
              recentPayments={derived.recentPayments}
              recentStudents={derived.recentStudents}
              recentTeachers={derived.recentTeachers}
              recentCourses={derived.recentCourses}
            />
          </LazySection>
        ),
      },
      {
        id: "content-overview",
        content: (
          <LazySection minHeight={420} rootMargin="250px">
            <ContentOverviewSection
              exams={derived.exams}
              assignments={derived.assignments}
              announcements={derived.announcements}
              liveClasses={derived.liveClasses}
              securityAlerts={derived.securityAlerts}
            />
          </LazySection>
        ),
      },
      {
        id: "system-diagnostics",
        content: (
          <LazySection minHeight={300} rootMargin="250px">
            <SystemDiagnosticsSection
              alerts={derived.alertData}
              wsConnected={wsConnected}
              isError={isError}
              errorCount={errorCount}
              lastUpdated={lastUpdated}
              isFetching={isFetching}
              isAuthenticated={isAuthenticated}
              sessionRole={sessionRole}
              onRefresh={onRefresh}
            />
          </LazySection>
        ),
      },
      {
        id: "activity-and-distribution",
        content: (
          <LazySection minHeight={400} rootMargin="250px">
            <ActivityDistributionSection
              heatmapData={derived.heatmapData}
              distributionData={derived.distributionData}
            />
          </LazySection>
        ),
      },
    ];
  }, [
    derived,
    timeFilter,
    playSound,
    notifications,
    markAsRead,
    dismiss,
    wsConnected,
    isError,
    errorCount,
    lastUpdated,
    isFetching,
    onTimeFilterChange,
    onExport,
    onRefresh,
    onOpenBroadcast,
    isAuthenticated,
    sessionRole,
  ]);
}
