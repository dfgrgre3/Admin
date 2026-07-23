export interface DashboardPayload {
  stats?: Record<string, any>;
  activity?: Record<string, any>;
  topSellingCourses?: Array<Record<string, any>>;
  criticalKPIs?: Array<Record<string, any>>;
  systemAlerts?: Array<Record<string, any>>;
}

export function buildComprehensiveStats(payload: DashboardPayload = {}) {
  const stats = payload.stats ?? {};
  const activity = payload.activity ?? {};

  const completionRate = typeof stats.completionRate === "number"
    ? stats.completionRate
    : (activity.studyMinutes && activity.examsTaken
      ? Math.min(100, Math.round((activity.examsTaken / Math.max(1, activity.studyMinutes / 60)) * 10))
      : 0);

  return {
    totalUsers: Number(stats.totalUsers ?? 0),
    activeStudents: Number(stats.activeStudents ?? stats.totalUsers ?? 0),
    totalTeachers: Number(stats.totalTeachers ?? 0),
    newUsersToday: Number(stats.newUsersToday ?? 0),
    newUsersThisWeek: Number(stats.newUsersThisWeek ?? 0),
    totalSubjects: Number(stats.totalSubjects ?? 0),
    publishedCourses: Number(stats.publishedCourses ?? stats.totalSubjects ?? 0),
    reviewCourses: Number(stats.reviewCourses ?? 0),
    draftCourses: Number(stats.draftCourses ?? 0),
    totalExams: Number(stats.totalExams ?? 0),
    totalResources: Number(stats.totalResources ?? 0),
    activeChallenges: Number(stats.activeChallenges ?? 0),
    completedTasks: Number(activity.tasksCompleted ?? 0),
    studyMinutes: Number(activity.studyMinutes ?? 0),
    examsTaken: Number(activity.examsTaken ?? 0),
    achievementsEarned: Number(activity.achievementsEarned ?? 0),
    completionRate,
    dailyRevenue: Number(stats.dailyRevenue ?? 0),
    monthlyRevenue: Number(stats.monthlyRevenue ?? 0),
    newSubscriptions: Number(stats.newSubscriptions ?? 0),
    cancelledSubscriptions: Number(stats.cancelledSubscriptions ?? 0),
    pendingOrders: Number(stats.pendingOrders ?? 0),
    openTickets: Number(stats.openTickets ?? 0),
    moderationQueue: Number(stats.moderationQueue ?? 0),
    pendingApprovals: Number(stats.pendingApprovals ?? 0),
    topSellingCourses: Array.isArray(payload.topSellingCourses) ? payload.topSellingCourses : [],
    criticalKPIs: Array.isArray(payload.criticalKPIs) ? payload.criticalKPIs : [],
    systemAlerts: Array.isArray(payload.systemAlerts) ? payload.systemAlerts : [],
  };
}
