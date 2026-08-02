import { describe, expect, it } from "vitest";
import { extractDashboardWidgetPayload } from "../dashboard-widget-utils";

describe("extractDashboardWidgetPayload", () => {
  it("returns overview payload for the summary widget", () => {
    const payload = extractDashboardWidgetPayload({
      stats: { totalUsers: 10 },
      activity: { studyMinutes: 120 },
      recentActivity: [{ id: "1", title: "Test" }],
      upcomingEvents: [{ id: "2", title: "Event" }],
      systemAlerts: [{ id: "3", message: "Alert" }],
    }, "overview");

    expect(payload.stats?.totalUsers).toBe(10);
    expect(payload.activity?.studyMinutes).toBe(120);
    expect(payload.recentActivity).toHaveLength(1);
  });

  it("returns only analytics data for the intelligence widget", () => {
    const payload = extractDashboardWidgetPayload({
      trends: { userGrowth: 5 },
      charts: { userGrowth: [{ month: "1", users: 2 }] },
      goals: [{ id: "g1", title: "Goal", current: 1, target: 10, unit: "%", category: "users", priority: "high" }],
      topSellingCourses: [{ id: "c1", title: "Course", sales: 5, revenue: 100 }],
    }, "intelligence");

    expect(payload.trends?.userGrowth).toBe(5);
    expect(payload.charts?.userGrowth).toHaveLength(1);
    expect(payload.goals).toHaveLength(1);
    expect(payload.systemAlerts).toBeUndefined();
  });
});
