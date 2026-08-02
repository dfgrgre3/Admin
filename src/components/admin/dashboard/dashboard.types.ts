export interface DashboardStatsData {
  totalUsers: number;
  totalSubjects: number;
  totalExams: number;
  totalResources: number;
  activeChallenges: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeStudents?: number;
  totalTeachers?: number;
  publishedCourses?: number;
  reviewCourses?: number;
  draftCourses?: number;
  dailyRevenue?: number;
  monthlyRevenue?: number;
  newSubscriptions?: number;
  cancelledSubscriptions?: number;
  pendingOrders?: number;
  openTickets?: number;
  moderationQueue?: number;
  pendingApprovals?: number;
  completionRate?: number;
}

export interface DashboardTrendData {
  userGrowth: number;
  studyTime: number;
}

export interface DashboardChartData {
  userGrowth: Array<{ month: string; users: number }>;
  activity: Array<{ day: string; sessions: number }>;
}

export interface DashboardActivityData {
  tasksCompleted: number;
  examsTaken: number;
  achievementsEarned: number;
  studyMinutes: number;
}

export interface DashboardRecentActivityItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export interface DashboardUpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: "exam" | "challenge" | "announcement";
}

export interface DashboardGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  category: "users" | "content" | "engagement" | "revenue" | "other";
  priority: "low" | "medium" | "high";
}

export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardData {
  stats: DashboardStatsData;
  trends: DashboardTrendData;
  charts: DashboardChartData;
  activity: DashboardActivityData;
  recentActivity: DashboardRecentActivityItem[];
  upcomingEvents: DashboardUpcomingEvent[];
  goals?: DashboardGoal[];
  topSellingCourses?: Array<{ id: string; title: string; sales: number; revenue: number }>;
  criticalKPIs?: Array<{ name: string; value: number; target: number; unit: string }>;
  systemAlerts?: Array<{ id: string; type: string; message: string; severity: string; createdAt: string }>;
}
