import type { DashboardData, DashboardGoal, DashboardRecentActivityItem, DashboardUpcomingEvent } from "@/components/admin/dashboard/dashboard.types";
import {
  formatUserGrowthData,
  normalizeRecentActivity,
  normalizeUpcomingEvents,
  type ActivityType,
} from "@/lib/dashboard-utils";
import { buildComprehensiveStats } from "@/lib/dashboard-data";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RawRecord)
    : {};
}

function asArray<T = RawRecord>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(value: unknown, fallback = ""): string {
  return value == null || value === "" ? fallback : String(value);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: unknown): string {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMATTER.format(date);
}

function mapSubscriptionStatus(status: unknown): "completed" | "pending" | "cancelled" | "active" {
  const normalized = str(status).toUpperCase();
  if (normalized === "ACTIVE" || normalized === "COMPLETED") return "completed";
  if (normalized === "CANCELLED" || normalized === "EXPIRED") return "cancelled";
  if (normalized === "PENDING") return "pending";
  return "active";
}

function mapPaymentStatus(status: unknown): "completed" | "pending" | "cancelled" | "active" {
  const normalized = str(status).toLowerCase();
  if (normalized === "completed") return "completed";
  if (normalized === "pending") return "pending";
  if (normalized === "cancelled" || normalized === "failed" || normalized === "refunded") return "cancelled";
  return "active";
}

export interface DashboardRecentItem {
  id: string;
  title: string;
  subtitle?: string;
  status: "completed" | "pending" | "cancelled" | "active";
  date: string;
  amount?: string;
  href?: string;
}

export interface DashboardLiveClass {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  viewers: number;
  duration: string;
  status: "live" | "starting" | "ended";
}

export interface DashboardSecurityAlert {
  id: string;
  type: "unauthorized_access" | "failed_login" | "suspicious_activity" | "data_breach" | "malware_detected" | "policy_violation";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved" | "false_positive";
}

export interface DashboardExamItem {
  id: string;
  title: string;
  subject: string;
  questions: number;
  participants: number;
  status: "scheduled" | "active" | "completed" | "draft";
  date: string;
  duration: string;
}

export interface DashboardAssignmentItem {
  id: string;
  title: string;
  subject: string;
  submissions: number;
  totalStudents: number;
  status: "pending" | "active" | "closed";
  dueDate: string;
}

export interface DashboardAnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: "urgent" | "info" | "success" | "warning";
  priority: "high" | "medium" | "low";
  createdAt: string;
  expiresAt?: string;
  pinned?: boolean;
  author?: string;
}

export interface DashboardRevenueData {
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingRevenue: number;
  dailyTrend: number;
  monthlyTrend: number;
  yearlyTrend: number;
}

export interface DashboardUsersData {
  totalUsers: number;
  activeStudents: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  studentGrowthRate: number;
}

export interface DashboardTeachersData {
  totalTeachers: number;
  activeTeachers: number;
  newTeachersToday: number;
  newTeachersThisWeek: number;
  teacherGrowthRate: number;
}

export interface NormalizedRecentActivity extends Omit<DashboardRecentActivityItem, "type"> {
  timestamp: Date;
  type: ActivityType;
}

export interface NormalizedUpcomingEvent extends Omit<DashboardUpcomingEvent, "date" | "type"> {
  date: Date;
  type: "exam" | "event" | "deadline" | "meeting" | "challenge" | "announcement";
}

export interface DashboardViewModel extends Omit<DashboardData, "recentActivity" | "upcomingEvents"> {
  recentActivity: NormalizedRecentActivity[];
  upcomingEvents: NormalizedUpcomingEvent[];
  revenue: DashboardRevenueData;
  users: DashboardUsersData;
  teachers: DashboardTeachersData;
  recentOrders: DashboardRecentItem[];
  recentPayments: DashboardRecentItem[];
  recentStudents: DashboardRecentItem[];
  recentTeachers: DashboardRecentItem[];
  recentCourses: DashboardRecentItem[];
  liveClasses: DashboardLiveClass[];
  securityAlerts: DashboardSecurityAlert[];
  exams: DashboardExamItem[];
  assignments: DashboardAssignmentItem[];
  announcements: DashboardAnnouncementItem[];
  comprehensiveStats: ReturnType<typeof buildComprehensiveStats>;
}

function mapRecentActivity(items: RawRecord[]): NormalizedRecentActivity[] {
  return normalizeRecentActivity(items).map((item) => ({
    id: str(item.id),
    userId: str(item.userId),
    title: str(item.title),
    description: str(item.description),
    createdAt: str(item.createdAt || item.timestamp),
    user: item.user && typeof item.user === "object"
      ? {
          name: str((item.user as RawRecord).name),
          avatar: str((item.user as RawRecord).avatar),
        }
      : undefined,
    timestamp: item.timestamp,
    type: item.type,
  }));
}

function mapUpcomingEvents(items: RawRecord[]): NormalizedUpcomingEvent[] {
  const allowed = ["exam", "event", "deadline", "meeting", "challenge", "announcement"] as const;

  return normalizeUpcomingEvents(items).map((event) => {
    const typeRaw = str(event.type, "exam");
    const type = (allowed as readonly string[]).includes(typeRaw)
      ? (typeRaw as NormalizedUpcomingEvent["type"])
      : "exam";

    return {
      id: str(event.id),
      title: str(event.title),
      date: event.date,
      type,
    };
  });
}

function mapRecentUser(item: RawRecord, hrefPrefix: string): DashboardRecentItem {
  const id = str(item.id);
  return {
    id,
    title: str(item.name || item.username || item.userName, "مستخدم"),
    subtitle: str(item.email || item.userEmail),
    status: "active",
    date: formatDate(item.createdAt),
    href: id ? `${hrefPrefix}/${id}` : undefined,
  };
}

function mapRecentCourse(item: RawRecord): DashboardRecentItem {
  const id = str(item.id);
  return {
    id,
    title: str(item.title, "دورة"),
    subtitle: str(item.status),
    status: str(item.status).toUpperCase() === "PUBLISHED" ? "completed" : "pending",
    date: formatDate(item.createdAt),
    href: id ? `/admin/courses/${id}` : "/admin/courses",
  };
}

function mapRecentOrder(item: RawRecord): DashboardRecentItem {
  const id = str(item.id);
  const plan = asRecord(item.plan);
  return {
    id,
    title: str(plan.name || plan.title, "اشتراك"),
    subtitle: str(item.status),
    status: mapSubscriptionStatus(item.status),
    date: formatDate(item.createdAt),
    href: "/admin/payments",
  };
}

function mapRecentPayment(item: RawRecord): DashboardRecentItem {
  const id = str(item.id);
  return {
    id,
    title: `دفعة #${id.slice(0, 8)}`,
    subtitle: str(item.method),
    status: mapPaymentStatus(item.status),
    date: formatDate(item.createdAt || item.completedAt),
    amount: `${num(item.amount).toLocaleString()} ${str(item.currency, "ج.م")}`,
    href: "/admin/payments",
  };
}

function mapSecurityEventType(eventType: string): DashboardSecurityAlert["type"] {
  const normalized = eventType.toUpperCase();
  if (normalized.includes("FAILED") || normalized.includes("2FA_FAILED")) return "failed_login";
  if (normalized.includes("SUSPICIOUS")) return "suspicious_activity";
  if (normalized.includes("PASSWORD") || normalized.includes("UNAUTHORIZED")) return "unauthorized_access";
  return "policy_violation";
}

function mapSecuritySeverity(eventType: string): DashboardSecurityAlert["severity"] {
  const normalized = eventType.toUpperCase();
  if (normalized.includes("SUSPICIOUS") || normalized.includes("2FA_FAILED")) return "high";
  if (normalized.includes("FAILED")) return "medium";
  return "low";
}

function mapSecurityStatus(eventType: string): DashboardSecurityAlert["status"] {
  const normalized = eventType.toUpperCase();
  if (normalized.includes("SUSPICIOUS") || normalized.includes("2FA_FAILED")) return "investigating";
  if (normalized.includes("LOGIN_SUCCESS") || normalized.includes("PASSWORD_CHANGE") || normalized.includes("EMAIL_VERIFIED")) {
    return "resolved";
  }
  return "active";
}

function mapLiveClasses(items: RawRecord[]): DashboardLiveClass[] {
  return items.map((item) => {
    const statusRaw = str(item.status).toUpperCase();
    let status: DashboardLiveClass["status"] = "ended";
    if (statusRaw === "LIVE") status = "live";
    else if (statusRaw === "SCHEDULED") status = "starting";

    return {
      id: str(item.id),
      title: str(item.title, "فصل مباشر"),
      instructor: str(item.instructor || item.hostEmail, "—"),
      subject: str(item.subject || item.provider, "مباشر"),
      viewers: num(item.viewers),
      duration: `${num(item.durationMin, 60)} د`,
      status,
    };
  });
}

function mapSecurityAlerts(items: RawRecord[]): DashboardSecurityAlert[] {
  return items.map((item) => {
    const eventType = str(item.eventType);
    return {
      id: str(item.id),
      type: mapSecurityEventType(eventType),
      severity: mapSecuritySeverity(eventType),
      title: eventType.replace(/_/g, " "),
      description: str(item.metadata, "حدث أمني"),
      source: str(item.source || item.ip, "—"),
      timestamp: formatDate(item.createdAt),
      status: mapSecurityStatus(eventType),
    };
  });
}

function mapExamStatus(raw: string): DashboardExamItem["status"] {
  switch (raw.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    case "DRAFT":
      return "draft";
    default:
      return "scheduled";
  }
}

function mapExams(items: RawRecord[]): DashboardExamItem[] {
  return items.map((item) => ({
    id: str(item.id),
    title: str(item.title, "امتحان"),
    subject: str(item.subject || item.subjectId, "—"),
    questions: num(item.questionCount),
    participants: num(item.participantCount),
    status: mapExamStatus(str(item.status)),
    date: formatDate(item.createdAt),
    duration: `${num(item.durationMin, 60)} د`,
  }));
}

function mapAssignments(items: RawRecord[]): DashboardAssignmentItem[] {
  return items.map((item) => {
    const statusRaw = str(item.status).toUpperCase();
    let status: DashboardAssignmentItem["status"] = "active";
    if (statusRaw === "COMPLETED") status = "closed";
    if (statusRaw === "PENDING") status = "pending";

    return {
      id: str(item.id),
      title: str(item.title, "واجب"),
      subject: str(item.subject || item.subjectId, "—"),
      submissions: num(item.submissions),
      totalStudents: num(item.totalStudents),
      status,
      dueDate: formatDate(item.dueDate || item.createdAt),
    };
  });
}

function mapAnnouncements(items: RawRecord[]): DashboardAnnouncementItem[] {
  return items.map((item) => {
    const typeRaw = str(item.type).toUpperCase();
    let type: DashboardAnnouncementItem["type"] = "info";
    if (typeRaw === "WARNING") type = "warning";
    if (typeRaw === "ERROR") type = "urgent";
    if (typeRaw === "SUCCESS") type = "success";

    const priorityRaw = str(item.priority).toUpperCase();
    let priority: DashboardAnnouncementItem["priority"] = "medium";
    if (priorityRaw === "HIGH" || priorityRaw === "URGENT") priority = "high";
    if (priorityRaw === "LOW") priority = "low";

    return {
      id: str(item.id),
      title: str(item.title, "إعلان"),
      content: str(item.message || item.content),
      type,
      priority,
      createdAt: formatDate(item.createdAt),
      expiresAt: item.expiresAt ? formatDate(item.expiresAt) : undefined,
      author: item.author ? str(item.author) : undefined,
    };
  });
}

function mapGoals(items: RawRecord[]): DashboardGoal[] {
  return items.map((goal) => ({
    id: str(goal.id),
    title: str(goal.title),
    current: num(goal.current),
    target: num(goal.target),
    unit: str(goal.unit),
    category: (str(goal.category) as DashboardGoal["category"]) || "other",
    priority: (str(goal.priority) as DashboardGoal["priority"]) || "medium",
  }));
}

export function mapDashboardPayload(raw: unknown): DashboardViewModel {
  const source = asRecord(raw);
  const stats = asRecord(source.stats);
  const trends = asRecord(source.trends);
  const charts = asRecord(source.charts);
  const activity = asRecord(source.activity);
  const revenue = asRecord(source.revenue);
  const users = asRecord(source.users);
  const teachers = asRecord(source.teachers);
  const courses = asRecord(source.courses);
  const payments = asRecord(source.payments);
  const examsBlock = asRecord(source.exams);
  const assignmentsBlock = asRecord(source.assignments);
  const announcementsBlock = asRecord(source.announcements);
  const liveBlock = asRecord(source.live);
  const securityBlock = asRecord(source.security);

  const mappedStats = {
    totalUsers: num(stats.totalUsers),
    totalSubjects: num(stats.totalSubjects),
    totalExams: num(stats.totalExams),
    totalResources: num(stats.totalResources),
    activeChallenges: num(stats.activeChallenges),
    newUsersToday: num(stats.newUsersToday),
    newUsersThisWeek: num(stats.newUsersThisWeek),
    activeStudents: num(stats.activeStudents, num(users.activeStudents)),
    totalTeachers: num(stats.totalTeachers, num(teachers.totalTeachers)),
    publishedCourses: num(stats.publishedCourses, num(courses.publishedCourses)),
    reviewCourses: num(stats.reviewCourses, num(courses.reviewCourses)),
    draftCourses: num(stats.draftCourses, num(courses.draftCourses)),
    dailyRevenue: num(stats.dailyRevenue, num(revenue.dailyRevenue)),
    monthlyRevenue: num(stats.monthlyRevenue, num(revenue.monthlyRevenue)),
    newSubscriptions: num(stats.newSubscriptions),
    cancelledSubscriptions: num(stats.cancelledSubscriptions),
    pendingOrders: num(stats.pendingOrders),
    openTickets: num(stats.openTickets),
    moderationQueue: num(stats.moderationQueue, num(stats.reviewCourses)),
    pendingApprovals: num(stats.pendingApprovals, num(stats.pendingOrders)),
    completionRate: num(stats.completionRate),
  };

  const mappedActivity = {
    tasksCompleted: num(activity.tasksCompleted),
    examsTaken: num(activity.examsTaken),
    achievementsEarned: num(activity.achievementsEarned),
    studyMinutes: num(activity.studyMinutes),
  };

  const topSellingCourses = asArray(source.topSellingCourses).map((item) => ({
    id: str(item.id),
    title: str(item.title),
    sales: num(item.sales),
    revenue: num(item.revenue),
  }));

  const criticalKPIs = asArray(source.criticalKPIs).map((item) => ({
    name: str(item.name),
    value: num(item.value),
    target: num(item.target),
    unit: str(item.unit),
  }));

  const systemAlerts = asArray(source.systemAlerts).map((item) => ({
    id: str(item.id),
    type: str(item.type),
    message: str(item.message),
    severity: str(item.severity),
    createdAt: str(item.createdAt),
  }));

  const goals = mapGoals(asArray(source.goals));
  const recentActivity = mapRecentActivity(asArray(source.recentActivity));
  const upcomingEvents = mapUpcomingEvents(asArray(source.upcomingEvents));

  return {
    stats: mappedStats,
    trends: {
      userGrowth: num(trends.userGrowth),
      studyTime: num(trends.studyTime),
    },
    charts: {
      userGrowth: formatUserGrowthData(asArray(charts.userGrowth)),
      activity: asArray(charts.activity).map((item) => ({
        day: str(item.day),
        sessions: num(item.sessions),
      })),
    },
    activity: mappedActivity,
    recentActivity,
    upcomingEvents,
    goals,
    topSellingCourses,
    criticalKPIs,
    systemAlerts,
    revenue: {
      dailyRevenue: num(revenue.dailyRevenue, mappedStats.dailyRevenue),
      monthlyRevenue: num(revenue.monthlyRevenue, mappedStats.monthlyRevenue),
      yearlyRevenue: num(revenue.yearlyRevenue),
      pendingRevenue: num(revenue.pendingRevenue),
      dailyTrend: num(revenue.dailyTrend),
      monthlyTrend: num(revenue.monthlyTrend),
      yearlyTrend: num(revenue.yearlyTrend),
    },
    users: {
      totalUsers: num(users.totalUsers, mappedStats.totalUsers),
      activeStudents: num(users.activeStudents, mappedStats.activeStudents ?? 0),
      newUsersToday: num(users.newUsersToday, mappedStats.newUsersToday),
      newUsersThisWeek: num(users.newUsersThisWeek, mappedStats.newUsersThisWeek),
      studentGrowthRate: num(users.studentGrowthRate),
    },
    teachers: {
      totalTeachers: num(teachers.totalTeachers, mappedStats.totalTeachers ?? 0),
      activeTeachers: num(teachers.activeTeachers, num(teachers.totalTeachers)),
      newTeachersToday: num(teachers.newTeachersToday),
      newTeachersThisWeek: num(teachers.newTeachersThisWeek),
      teacherGrowthRate: num(teachers.teacherGrowthRate),
    },
    recentOrders: asArray(payments.recentOrders).map(mapRecentOrder),
    recentPayments: asArray(payments.recentPayments).map(mapRecentPayment),
    recentStudents: asArray(users.recentStudents).map((item) => mapRecentUser(item, "/admin/users")),
    recentTeachers: asArray(teachers.recentTeachers).map((item) => mapRecentUser(item, "/admin/teachers")),
    recentCourses: asArray(courses.recentCourses).map(mapRecentCourse),
    liveClasses: mapLiveClasses(asArray(liveBlock.classes)),
    securityAlerts: mapSecurityAlerts(asArray(securityBlock.alerts)),
    exams: mapExams(asArray(examsBlock.exams)),
    assignments: mapAssignments(asArray(assignmentsBlock.assignments)),
    announcements: mapAnnouncements(asArray(announcementsBlock.announcements)),
    comprehensiveStats: buildComprehensiveStats({
      stats: mappedStats,
      activity: mappedActivity,
      topSellingCourses,
      criticalKPIs,
      systemAlerts,
    }),
  };
}
