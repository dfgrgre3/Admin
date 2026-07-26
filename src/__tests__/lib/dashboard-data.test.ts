import { describe, expect, it } from "vitest";
import { buildComprehensiveStats } from "@/lib/dashboard-data";

describe("buildComprehensiveStats", () => {
  it("maps backend dashboard payload into UI-friendly stats", () => {
    const payload = {
      stats: {
        totalUsers: 1200,
        activeStudents: 950,
        totalTeachers: 86,
        publishedCourses: 64,
        reviewCourses: 7,
        draftCourses: 14,
        totalExams: 221,
        totalResources: 308,
        activeChallenges: 12,
        newUsersToday: 24,
        newUsersThisWeek: 168,
        dailyRevenue: 12500,
        monthlyRevenue: 360000,
        newSubscriptions: 18,
        cancelledSubscriptions: 2,
        pendingOrders: 9,
        openTickets: 4,
        moderationQueue: 6,
        pendingApprovals: 7,
      },
      activity: {
        tasksCompleted: 430,
        examsTaken: 1280,
        achievementsEarned: 540,
        studyMinutes: 4200,
      },
      topSellingCourses: [
        { id: "course-1", title: "الرياضيات المتقدمة", sales: 182, revenue: 282000 },
      ],
      criticalKPIs: [{ name: "الطلاب النشطون", value: 950, target: 1000, unit: "طالب" }],
      systemAlerts: [{ id: "alert-1", type: "review", message: "هناك 7 دورات تحتاج مراجعة", severity: "warning", createdAt: "2026-07-23T10:00:00Z" }],
    };

    const result = buildComprehensiveStats(payload as any);

    expect(result.totalUsers).toBe(1200);
    expect(result.activeStudents).toBe(950);
    expect(result.totalTeachers).toBe(86);
    expect(result.publishedCourses).toBe(64);
    expect(result.reviewCourses).toBe(7);
    expect(result.dailyRevenue).toBe(12500);
    expect(result.openTickets).toBe(4);
    expect(result.topSellingCourses).toHaveLength(1);
    expect(result.systemAlerts[0]?.message).toContain("تحتاج مراجعة");
  });
});
