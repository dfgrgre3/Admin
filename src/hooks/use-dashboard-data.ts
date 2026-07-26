"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";

// Single Dashboard Data Hook - fetches all data from one endpoint
export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const response = await adminFetch("dashboard");
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch dashboard data: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // Increased from 2 to 5 minutes for better caching
    gcTime: 15 * 60 * 1000, // Increased from default to 15 minutes
    refetchOnWindowFocus: false, // Reduced unnecessary refetches
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Revenue Data Hook - uses dashboard data
export function useRevenueData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.revenue ? {
      dailyRevenue: dashboardData.revenue.dailyRevenue || 0,
      monthlyRevenue: dashboardData.revenue.monthlyRevenue || 0,
      yearlyRevenue: dashboardData.revenue.yearlyRevenue || 0,
      pendingRevenue: dashboardData.revenue.pendingRevenue || 0,
      dailyTrend: dashboardData.revenue.dailyTrend || 0,
      monthlyTrend: dashboardData.revenue.monthlyTrend || 0,
      yearlyTrend: dashboardData.revenue.yearlyTrend || 0,
    } : null,
  };
}

// Users Data Hook - uses dashboard data
export function useUsersData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.users ? {
      totalUsers: dashboardData.users.totalUsers || 0,
      activeStudents: dashboardData.users.activeStudents || 0,
      newUsersToday: dashboardData.users.newUsersToday || 0,
      newUsersThisWeek: dashboardData.users.newUsersThisWeek || 0,
      newUsersThisMonth: dashboardData.users.newUsersThisMonth || 0,
      studentGrowthRate: dashboardData.users.studentGrowthRate || 0,
      recentStudents: dashboardData.users.recentStudents || [],
    } : null,
  };
}

// Courses Data Hook - uses dashboard data
export function useCoursesData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.courses ? {
      totalCourses: dashboardData.courses.totalCourses || 0,
      publishedCourses: dashboardData.courses.publishedCourses || 0,
      draftCourses: dashboardData.courses.draftCourses || 0,
      reviewCourses: dashboardData.courses.reviewCourses || 0,
      totalLessons: dashboardData.courses.totalLessons || 0,
      totalEnrollments: dashboardData.courses.totalEnrollments || 0,
      activeEnrollments: dashboardData.courses.activeEnrollments || 0,
      completedEnrollments: 0,
      pendingEnrollments: 0,
      averageCompletion: 0,
      averageRating: 0,
      activeCourses: dashboardData.courses.publishedCourses || 0,
      archivedCourses: 0,
      enrollmentGrowthRate: 0,
      averageEnrollmentTime: 0,
      retentionRate: 0,
      recentCourses: dashboardData.courses.recentCourses || [],
    } : null,
  };
}

// Payments Data Hook - uses dashboard data
export function usePaymentsData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.payments ? {
      recentOrders: dashboardData.payments.recentOrders || [],
      recentPayments: dashboardData.payments.recentPayments || [],
    } : null,
  };
}

// Exams Data Hook - uses dashboard data
export function useExamsData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.exams ? {
      exams: dashboardData.exams.exams || [],
    } : null,
  };
}

// Announcements Data Hook - uses dashboard data
export function useAnnouncementsData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.announcements ? {
      announcements: dashboardData.announcements.announcements || [],
    } : null,
  };
}

// Live Classes Data Hook - uses dashboard data
export function useLiveData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.live ? {
      classes: dashboardData.live.classes || [],
    } : null,
  };
}

// Security Logs Data Hook - uses dashboard data
export function useSecurityLogsData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.security ? {
      alerts: dashboardData.security.alerts || [],
    } : null,
  };
}

// Teachers Data Hook - uses dashboard data
export function useTeachersData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.teachers ? {
      totalTeachers: dashboardData.teachers.totalTeachers || 0,
      activeTeachers: dashboardData.teachers.activeTeachers || 0,
      newTeachersToday: dashboardData.teachers.newTeachersToday || 0,
      newTeachersThisWeek: dashboardData.teachers.newTeachersThisWeek || 0,
      teacherGrowthRate: dashboardData.teachers.teacherGrowthRate || 0,
      recentTeachers: dashboardData.teachers.recentTeachers || [],
    } : null,
  };
}

// Assignments Data Hook - uses dashboard data
export function useAssignmentsData() {
  const { data: dashboardData } = useDashboardData();
  return {
    data: dashboardData?.assignments ? {
      assignments: dashboardData.assignments.assignments || [],
    } : null,
  };
}
