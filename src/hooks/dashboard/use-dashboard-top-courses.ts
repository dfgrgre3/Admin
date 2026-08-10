"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin-api";
import { PERFORMANCE_DEFAULTS } from "@/lib/performance-config";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";

export interface DashboardTopCourse {
  courseId: string;
  title: string;
  category: string;
  status: string;
  value: number;
  enrollmentCount: number;
  completionRate: number;
  rating: number;
  lastUpdatedAt: string;
  previousValue: number | null;
  deltaPercentage: number | null;
  revenue?: number;
  actionUrl: string;
}

interface TopCoursesPayload {
  items: DashboardTopCourse[];
  totalCount: number;
  hasMore: boolean;
  metric: string;
}

interface UseDashboardTopCoursesResult {
  courses: DashboardTopCourse[];
  totalCount: number;
  metric: string;
  isLoading: boolean;
  isError: boolean;
  canViewTopCourses: boolean;
  refetch: () => Promise<unknown>;
}

/** The API envelope wraps every payload in `{ success, data }`. */
function unwrap<T>(response: unknown): T {
  const body = response as { data?: T } | null;
  return (body?.data ?? response) as T;
}

const TOP_COURSES_LIMIT = 6;

/**
 * Loads the top-performing courses from the existing v1 dashboard endpoint.
 * Ranked by enrollments by default; the backend enforces financial clearance
 * before returning revenue figures, so we never request it up front.
 */
export function useDashboardTopCourses(metric: "enrollment" | "completion" | "rating" = "enrollment"): UseDashboardTopCoursesResult {
  const { user } = useAuth();

  const canViewTopCourses = user
    ? hasPermission(user as Parameters<typeof hasPermission>[0], PERMISSIONS.DASHBOARD_VIEW_TOP_COURSES as Permission)
    : false;

  const query = useQuery({
    queryKey: ["admin-dashboard", "top-courses", metric],
    enabled: canViewTopCourses,
    queryFn: async () => {
      const response = await adminApi.get<unknown>("dashboard/top-courses", {
        metric,
        limit: String(TOP_COURSES_LIMIT),
      });
      return unwrap<TopCoursesPayload>(response);
    },
    staleTime: PERFORMANCE_DEFAULTS.queryStaleTimeMs,
    gcTime: PERFORMANCE_DEFAULTS.queryGcTimeMs,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    courses: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    metric: query.data?.metric ?? metric,
    isLoading: query.isLoading,
    isError: query.isError,
    canViewTopCourses,
    refetch: query.refetch,
  };
}