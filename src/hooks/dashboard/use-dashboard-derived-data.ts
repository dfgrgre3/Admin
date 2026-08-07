"use client";

import * as React from "react";
import { generateSmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import { buildDistributionData, buildHeatmapData } from "@/lib/dashboard-utils";
import type { DashboardViewModel } from "@/lib/dashboard-payload-mapper";

export function useDashboardDerivedData(dashboard: DashboardViewModel | null) {
  const safeStats = React.useMemo(() => dashboard?.stats ?? {
    totalUsers: 0,
    totalSubjects: 0,
    totalExams: 0,
    totalResources: 0,
    activeChallenges: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
  }, [dashboard?.stats]);

  const safeTrends = React.useMemo(() => dashboard?.trends ?? {
    userGrowth: 0,
    studyTime: 0,
  }, [dashboard?.trends]);

  const safeActivity = React.useMemo(() => dashboard?.activity ?? {
    tasksCompleted: 0,
    examsTaken: 0,
    achievementsEarned: 0,
    studyMinutes: 0,
  }, [dashboard?.activity]);

  const safeCharts = React.useMemo(() => dashboard?.charts ?? {
    userGrowth: [],
    activity: [],
  }, [dashboard?.charts]);

  const safeGoals = React.useMemo(() => dashboard?.goals ?? [], [dashboard?.goals]);

  const alertData = React.useMemo(() => {
    if (!dashboard) return [];
    const generated = generateSmartAlerts({
      users: {
        total: safeStats.totalUsers,
        new: safeStats.newUsersToday,
        active: safeStats.newUsersThisWeek,
      },
      content: {
        subjects: safeStats.totalSubjects,
        exams: safeStats.totalExams,
        resources: safeStats.totalResources,
      },
      activity: {
        studySessions: safeActivity.studyMinutes > 0 ? Math.round(safeActivity.studyMinutes / 45) : 0,
        tasksCompleted: safeActivity.tasksCompleted,
      },
      trends: {
        userGrowth: safeTrends.userGrowth,
        studyTime: safeTrends.studyTime,
      },
    });

    const backendAlerts = (dashboard.systemAlerts ?? []).map((alert) => ({
      id: alert.id,
      type: alert.severity === "error" ? "error" as const
        : alert.severity === "warning" ? "warning" as const
        : "info" as const,
      title: alert.type,
      description: alert.message,
      timestamp: alert.createdAt ? new Date(alert.createdAt) : undefined,
    }));

    const seen = new Set<string>();
    return [...backendAlerts, ...generated].filter((alert) => {
      if (seen.has(alert.id)) return false;
      seen.add(alert.id);
      return true;
    });
  }, [dashboard, safeStats, safeActivity, safeTrends]);

  const distributionData = React.useMemo(
    () => buildDistributionData(safeStats),
    [safeStats],
  );

  const heatmapData = React.useMemo(
    () => buildHeatmapData(safeCharts.activity),
    [safeCharts.activity],
  );

  return {
    safeStats,
    safeTrends,
    safeActivity,
    safeCharts,
    safeGoals,
    safeRecentActivity: dashboard?.recentActivity ?? [],
    safeUpcomingEvents: dashboard?.upcomingEvents ?? [],
    comprehensiveStats: dashboard?.comprehensiveStats,
    revenue: dashboard?.revenue,
    users: dashboard?.users,
    teachers: dashboard?.teachers,
    recentOrders: dashboard?.recentOrders ?? [],
    recentPayments: dashboard?.recentPayments ?? [],
    recentStudents: dashboard?.recentStudents ?? [],
    recentTeachers: dashboard?.recentTeachers ?? [],
    recentCourses: dashboard?.recentCourses ?? [],
    liveClasses: dashboard?.liveClasses ?? [],
    securityAlerts: dashboard?.securityAlerts ?? [],
    exams: dashboard?.exams ?? [],
    assignments: dashboard?.assignments ?? [],
    announcements: dashboard?.announcements ?? [],
    alertData,
    distributionData,
    heatmapData,
  };
}
