export type DashboardWidgetKey = "overview" | "stats" | "intelligence" | "systems" | "activity";

export interface DashboardWidgetPayload {
  stats?: Record<string, unknown>;
  trends?: Record<string, unknown>;
  charts?: Record<string, unknown>;
  activity?: Record<string, unknown>;
  recentActivity?: Array<Record<string, unknown>>;
  upcomingEvents?: Array<Record<string, unknown>>;
  goals?: Array<Record<string, unknown>>;
  topSellingCourses?: Array<Record<string, unknown>>;
  criticalKPIs?: Array<Record<string, unknown>>;
  systemAlerts?: Array<Record<string, unknown>>;
}

export function extractDashboardWidgetPayload(
  source: Record<string, any>,
  widget: DashboardWidgetKey,
): DashboardWidgetPayload {
  switch (widget) {
    case "overview":
      return {
        stats: source.stats,
        activity: source.activity,
        recentActivity: source.recentActivity,
        upcomingEvents: source.upcomingEvents,
        systemAlerts: source.systemAlerts,
      };
    case "stats":
      return {
        stats: source.stats,
        activity: source.activity,
        criticalKPIs: source.criticalKPIs,
        topSellingCourses: source.topSellingCourses,
      };
    case "intelligence":
      return {
        trends: source.trends,
        charts: source.charts,
        goals: source.goals,
        topSellingCourses: source.topSellingCourses,
      };
    case "systems":
      return {
        stats: source.stats,
        systemAlerts: source.systemAlerts,
      };
    case "activity":
      return {
        charts: source.charts,
        recentActivity: source.recentActivity,
        upcomingEvents: source.upcomingEvents,
      };
    default:
      return {};
  }
}
