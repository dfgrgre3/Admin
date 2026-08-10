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
import { CourseOverviewSection } from "@/components/admin/dashboard/sections/course-overview-section";
import { TopCoursesSection } from "@/components/admin/dashboard/sections/top-courses-section";
import { OperationsSection } from "@/components/admin/dashboard/sections/operations-section";
import { LazySection } from "@/components/admin/ui/lazy-section";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";
import type { useDashboardDerivedData } from "@/hooks/dashboard/use-dashboard-derived-data";
import type { useDashboardOperations } from "@/hooks/dashboard/use-dashboard-operations";
import type { RealtimeNotification } from "@/components/admin/dashboard/dashboard.types";

type DerivedData = ReturnType<typeof useDashboardDerivedData>;
type OperationsData = ReturnType<typeof useDashboardOperations>;

interface UseDashboardSectionsParams {
  derived: DerivedData;
  operations: OperationsData;
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
  operations,
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

  // Widget-level permission gate (mirrors the Go dashboard widget permissions).
  // Sections the caller lacks permission for are omitted entirely — the payload
  // may still contain their data, but the UI never renders it (server-side
  // filtering arrives with the v1 dashboard endpoints).
  const can = React.useCallback(
    (permission: Permission) =>
      user ? hasPermission(user as Parameters<typeof hasPermission>[0], permission) : false,
    [user],
  );

  return React.useMemo(() => {
    // Each section below is independently gated. The derived-data hook already
    // supplies safe defaults for every slice, so a single missing block must not
    // blank the whole dashboard — sections render with whatever loaded.
    const { comprehensiveStats, revenue, users, teachers } = derived;

    return [
      ...(comprehensiveStats && can(PERMISSIONS.DASHBOARD_VIEW_KPIS)
        ? [{
            id: "main-stats",
            content: (
              <StatsSection
                comprehensiveStats={comprehensiveStats}
                activity={derived.safeActivity}
                timeFilter={timeFilter}
                onTimeFilterChange={onTimeFilterChange}
                onExport={onExport}
              />
            ),
          }]
        : []),
      // Operational panels sit high in the hierarchy: they surface work that
      // needs an admin decision now. Each panel is fed by its own query and is
      // permission-gated server-side, so it is safe to mount whenever any of the
      // three permissions is held.
      ...(operations.canViewAlerts || operations.canViewPending || operations.canViewHealth
        ? [{
            id: "operations",
            content: (
              <OperationsSection
                alerts={operations.alerts}
                alertsLoading={operations.alertsLoading}
                alertsError={operations.alertsError}
                onAcknowledge={(alertId) => operations.acknowledgeAlert({ alertId })}
                isAcknowledging={operations.isAcknowledging}
                showAlerts={operations.canViewAlerts}
                canAcknowledge={operations.canAcknowledgeAlerts}
                pendingActions={operations.pendingActions}
                pendingTotal={operations.pendingTotal}
                pendingLoading={operations.pendingLoading}
                pendingError={operations.pendingError}
                showPending={operations.canViewPending}
                services={operations.services}
                overallStatus={operations.overallStatus}
                healthLoading={operations.healthLoading}
                healthError={operations.healthError}
                showHealth={operations.canViewHealth}
              />
            ),
          }]
        : []),
      ...(revenue && can(PERMISSIONS.DASHBOARD_VIEW_FINANCIAL_METRICS)
        ? [{
            id: "revenue-overview",
            content: (
              <LazySection minHeight={260} rootMargin="250px">
                <RevenueSection revenue={revenue} />
              </LazySection>
            ),
          }]
        : []),
      ...(users && teachers && can(PERMISSIONS.DASHBOARD_VIEW_KPIS)
        ? [{
            id: "growth-overview",
            content: (
              <LazySection minHeight={320} rootMargin="250px">
                <GrowthSection users={users} teachers={teachers} />
              </LazySection>
            ),
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_ACCESS)
        ? [{
            id: "quick-actions",
            content: <QuickActionsSection playSound={playSound} />,
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_ACCESS)
        ? [{
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
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_ACCESS)
        ? [{
            id: "command-center",
            content: <CommandCenterSection playSound={playSound} />,
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_VIEW_LEARNING_METRICS) || can(PERMISSIONS.DASHBOARD_VIEW_KPIS)
        ? [{
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
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_VIEW_RECENT_ACTIVITY) || can(PERMISSIONS.DASHBOARD_VIEW_FINANCIAL_METRICS)
        ? [{
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
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_VIEW_TOP_COURSES)
        ? [{
            id: "top-courses",
            content: (
              <LazySection minHeight={300} rootMargin="250px">
                <TopCoursesSection />
              </LazySection>
            ),
          }]
        : []),
      ...(comprehensiveStats && can(PERMISSIONS.DASHBOARD_VIEW_CONTENT_METRICS)
        ? [{
            id: "course-overview",
            content: (
              <LazySection minHeight={220} rootMargin="250px">
                <CourseOverviewSection
                  totalCourses={derived.safeStats.totalSubjects}
                  publishedCourses={comprehensiveStats.publishedCourses}
                  draftCourses={comprehensiveStats.draftCourses}
                  reviewCourses={comprehensiveStats.reviewCourses}
                  archivedCourses={comprehensiveStats.archivedCourses}
                />
              </LazySection>
            ),
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_VIEW_CONTENT_METRICS) || can(PERMISSIONS.DASHBOARD_VIEW_ALERTS)
        ? [{
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
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_VIEW_SYSTEM_HEALTH) || can(PERMISSIONS.DASHBOARD_VIEW_ALERTS)
        ? [{
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
          }]
        : []),
      ...(can(PERMISSIONS.DASHBOARD_VIEW_LEARNING_METRICS)
        ? [{
            id: "activity-and-distribution",
            content: (
              <LazySection minHeight={400} rootMargin="250px">
                <ActivityDistributionSection
                  heatmapData={derived.heatmapData}
                  distributionData={derived.distributionData}
                />
              </LazySection>
            ),
          }]
        : []),
    ];
  }, [
    derived,
    operations,
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
    can,
  ]);
}
