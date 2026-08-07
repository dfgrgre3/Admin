import { describe, expect, it } from "vitest";
import { mapDashboardPayload } from "@/lib/dashboard-payload-mapper";

describe("mapDashboardPayload", () => {
  it("maps nested backend dashboard payload into a unified view model", () => {
    const payload = {
      stats: {
        totalUsers: 1200,
        totalSubjects: 64,
        totalExams: 221,
        totalResources: 308,
        activeChallenges: 12,
        newUsersToday: 24,
        newUsersThisWeek: 168,
        activeStudents: 950,
        totalTeachers: 86,
        publishedCourses: 64,
        reviewCourses: 7,
        draftCourses: 14,
        dailyRevenue: 12500,
        monthlyRevenue: 360000,
        openTickets: 4,
        completionRate: 72,
      },
      trends: { userGrowth: 12.5, studyTime: -4.2 },
      charts: {
        userGrowth: [{ month: 1, users: 120 }],
        activity: [{ day: "07/08", sessions: 18 }],
      },
      activity: {
        tasksCompleted: 430,
        examsTaken: 1280,
        achievementsEarned: 540,
        studyMinutes: 4200,
      },
      revenue: {
        dailyRevenue: 12500,
        monthlyRevenue: 360000,
        yearlyRevenue: 2400000,
        pendingRevenue: 9000,
        dailyTrend: 8,
        monthlyTrend: 15,
        yearlyTrend: 22,
      },
      users: {
        totalUsers: 1200,
        activeStudents: 950,
        newUsersToday: 24,
        newUsersThisWeek: 168,
        studentGrowthRate: 14,
        recentStudents: [{ id: "u-1", name: "Ahmed", email: "a@test.com", createdAt: "2026-08-07T10:00:00Z" }],
      },
      teachers: {
        totalTeachers: 86,
        activeTeachers: 80,
        newTeachersToday: 2,
        newTeachersThisWeek: 9,
        teacherGrowthRate: 6,
        recentTeachers: [{ id: "t-1", name: "Sara", email: "s@test.com", createdAt: "2026-08-07T09:00:00Z" }],
      },
      courses: {
        publishedCourses: 64,
        recentCourses: [{ id: "c-1", title: "Math", status: "PUBLISHED", createdAt: "2026-08-06T10:00:00Z" }],
      },
      payments: {
        recentOrders: [{ id: "o-1", status: "PENDING", createdAt: "2026-08-07T08:00:00Z", plan: { name: "Premium" } }],
        recentPayments: [{ id: "p-1", status: "completed", amount: 500, currency: "EGP", method: "PAYMOB", createdAt: "2026-08-07T07:00:00Z" }],
      },
      live: {
        classes: [{ id: "l-1", title: "Live Math", hostEmail: "teacher@test.com", provider: "ZOOM", status: "LIVE", durationMin: 60 }],
      },
      security: {
        alerts: [{ id: "s-1", eventType: "LOGIN_FAILED", ip: "127.0.0.1", createdAt: "2026-08-07T06:00:00Z" }],
      },
      goals: [{ id: "g-1", title: "Users", current: 168, target: 200, unit: "user", category: "users", priority: "high" }],
      systemAlerts: [{ id: "alert-1", type: "review", message: "7 courses need review", severity: "warning", createdAt: "2026-08-07T05:00:00Z" }],
      topSellingCourses: [{ id: "course-1", title: "Advanced Math", sales: 182, revenue: 282000 }],
    };

    const result = mapDashboardPayload(payload);

    expect(result.stats.totalUsers).toBe(1200);
    expect(result.revenue.monthlyRevenue).toBe(360000);
    expect(result.users.studentGrowthRate).toBe(14);
    expect(result.recentStudents[0]?.title).toBe("Ahmed");
    expect(result.liveClasses[0]?.status).toBe("live");
    expect(result.comprehensiveStats.openTickets).toBe(4);
    expect(result.goals).toHaveLength(1);
  });
});
