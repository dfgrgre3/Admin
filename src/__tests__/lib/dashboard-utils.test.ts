import { describe, expect, it } from "vitest";
import { buildHeatmapData } from "@/lib/dashboard-utils";
import { generateSmartAlerts } from "@/components/admin/dashboard/smart-alerts";

describe("dashboard utils", () => {
  it("keeps activity dates in the correct year when the current month is January", () => {
    const today = new Date("2026-01-10T12:00:00Z");

    const result = buildHeatmapData(
      [{ day: "31/12", sessions: 9 }],
      45,
      today,
    );

    expect(result.some((point) => point.date === "2025-12-31" && point.count === 9)).toBe(true);
  });

  it("keeps milestone alerts visible for each new 100-user threshold", () => {
    const alerts = generateSmartAlerts({
      users: { total: 210, new: 12, active: 180 },
      content: { subjects: 12, exams: 4, resources: 40 },
      activity: { studySessions: 180, tasksCompleted: 42 },
      trends: { userGrowth: 15, studyTime: 8 },
    });

    expect(alerts.some((alert) => alert.id === "milestone-users")).toBe(true);
  });
});
