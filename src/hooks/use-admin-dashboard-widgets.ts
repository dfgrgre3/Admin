"use client";

import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { extractDashboardWidgetPayload } from "@/lib/dashboard-widget-utils";

export type DashboardWidgetName = "overview" | "stats" | "intelligence" | "systems" | "activity";

interface WidgetQueryResult<TData> {
  data?: TData;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

interface UseAdminDashboardWidgetsResult {
  overview: WidgetQueryResult<Record<string, unknown>>;
  stats: WidgetQueryResult<Record<string, unknown>>;
  intelligence: WidgetQueryResult<Record<string, unknown>>;
  systems: WidgetQueryResult<Record<string, unknown>>;
  activity: WidgetQueryResult<Record<string, unknown>>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errors: unknown[];
  refetchAll: () => Promise<unknown[]>;
}

const widgetNames: DashboardWidgetName[] = ["overview", "stats", "intelligence", "systems", "activity"];

function getWidgetQueryConfig(timeFilter: string, widget: DashboardWidgetName) {
  return {
    queryKey: ["admin-dashboard-widget", widget, timeFilter],
    queryFn: async () => {
      const response = await adminFetch(`dashboard?time=${timeFilter}&widget=${widget}`);
      if (!response.ok) throw new Error(`Failed to fetch ${widget} widget`);
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  };
}

export function useAdminDashboardWidgets(timeFilter: string): UseAdminDashboardWidgetsResult {
  const queryResults = useQueries({
    queries: widgetNames.map((widget) => getWidgetQueryConfig(timeFilter, widget)),
  });

  const overview = queryResults[0] as WidgetQueryResult<Record<string, unknown>>;
  const stats = queryResults[1] as WidgetQueryResult<Record<string, unknown>>;
  const intelligence = queryResults[2] as WidgetQueryResult<Record<string, unknown>>;
  const systems = queryResults[3] as WidgetQueryResult<Record<string, unknown>>;
  const activity = queryResults[4] as WidgetQueryResult<Record<string, unknown>>;

  const refetchAll = React.useCallback(() => Promise.all(queryResults.map((query) => query.refetch())), [queryResults]);

  const isLoading = queryResults.some((query) => query.isLoading);
  const isFetching = queryResults.some((query) => query.isFetching);
  const isError = queryResults.some((query) => query.isError);
  const errors = queryResults.filter((query) => query.isError).map((query) => query.error);

  return {
    overview,
    stats,
    intelligence,
    systems,
    activity,
    isLoading,
    isFetching,
    isError,
    errors,
    refetchAll,
  };
}

export function buildDashboardWidgetData(payload: Record<string, any>) {
  return {
    stats: payload.stats ?? {},
    trends: payload.trends ?? {},
    charts: payload.charts ?? {},
    activity: payload.activity ?? {},
    recentActivity: payload.recentActivity ?? [],
    upcomingEvents: payload.upcomingEvents ?? [],
    goals: payload.goals ?? [],
    topSellingCourses: payload.topSellingCourses ?? [],
    criticalKPIs: payload.criticalKPIs ?? [],
    systemAlerts: payload.systemAlerts ?? [],
  };
}

export function mergeDashboardWidgetPayloads(widgetData: Record<DashboardWidgetName, Record<string, any> | undefined>) {
  const overview = extractDashboardWidgetPayload(widgetData.overview ?? {}, "overview");
  const statsPayload = extractDashboardWidgetPayload(widgetData.stats ?? {}, "stats");
  const intelligencePayload = extractDashboardWidgetPayload(widgetData.intelligence ?? {}, "intelligence");
  const systemsPayload = extractDashboardWidgetPayload(widgetData.systems ?? {}, "systems");
  const activityPayload = extractDashboardWidgetPayload(widgetData.activity ?? {}, "activity");

  return {
    stats: {
      ...(overview.stats ?? {}),
      ...(statsPayload.stats ?? {}),
    },
    trends: intelligencePayload.trends ?? {},
    charts: intelligencePayload.charts ?? {},
    activity: {
      ...(overview.activity ?? {}),
      ...(statsPayload.activity ?? {}),
    },
    recentActivity: overview.recentActivity ?? activityPayload.recentActivity ?? [],
    upcomingEvents: overview.upcomingEvents ?? activityPayload.upcomingEvents ?? [],
    goals: intelligencePayload.goals ?? [],
    topSellingCourses: statsPayload.topSellingCourses ?? intelligencePayload.topSellingCourses ?? [],
    criticalKPIs: statsPayload.criticalKPIs ?? [],
    systemAlerts: overview.systemAlerts ?? systemsPayload.systemAlerts ?? [],
  };
}
