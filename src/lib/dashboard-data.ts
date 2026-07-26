export interface DashboardStatsInput {
  totalUsers?: number;
  activeStudents?: number;
  totalTeachers?: number;
  newUsersToday?: number;
  newUsersThisWeek?: number;
  totalSubjects?: number;
  publishedCourses?: number;
  reviewCourses?: number;
  draftCourses?: number;
  totalExams?: number;
  totalResources?: number;
  activeChallenges?: number;
  completionRate?: number;
  dailyRevenue?: number;
  monthlyRevenue?: number;
  newSubscriptions?: number;
  cancelledSubscriptions?: number;
  pendingOrders?: number;
  openTickets?: number;
  moderationQueue?: number;
  pendingApprovals?: number;
}

export interface DashboardActivityInput {
  tasksCompleted?: number;
  studyMinutes?: number;
  examsTaken?: number;
  achievementsEarned?: number;
}

export interface DashboardKPIInput {
  name?: string;
  value?: number;
  target?: number;
  unit?: string;
}

export interface DashboardAlertInput {
  id?: string | number;
  type?: string;
  message?: string;
  severity?: string;
  createdAt?: string;
}

export interface DashboardPayload {
  stats?: DashboardStatsInput;
  activity?: DashboardActivityInput;
  topSellingCourses?: Array<{
    id: string;
    title: string;
    sales: number;
    revenue: number;
  }>;
  criticalKPIs?: DashboardKPIInput[];
  systemAlerts?: DashboardAlertInput[];
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
    criticalKPIs: Array.isArray(payload.criticalKPIs) ? payload.criticalKPIs.map(kpi => ({
      name: kpi.name || '',
      value: Number(kpi.value ?? 0),
      target: Number(kpi.target ?? 0),
      unit: kpi.unit || '',
    })) : [],
    systemAlerts: Array.isArray(payload.systemAlerts) ? payload.systemAlerts.map(alert => ({
      id: String(alert.id ?? ''),
      type: String(alert.type ?? ''),
      message: String(alert.message ?? ''),
      severity: String(alert.severity ?? ''),
      createdAt: String(alert.createdAt ?? ''),
    })) : [],
  };
}
