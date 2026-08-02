/**
 * Dashboard utility functions extracted from the God Component.
 *
 * These pure helpers centralize data transformations (heatmap, distribution,
 * chart formatting, goals) so they can be reused, tested independently, and
 * eventually moved to the backend.
 */

export const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
] as const;

export interface ActivityDay {
  day: string;
  sessions: number;
}

export interface HeatmapPoint {
  date: string;
  count: number;
}

/**
 * Build a 12-week (84-day) heatmap dataset from raw activity sessions.
 *
 * The backend returns activity as `{ day: "DD/MM", sessions: number }`.
 * This maps each entry to a YYYY-MM-DD key and fills the remaining days
 * with zero so the heatmap always renders a full grid.
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildHeatmapData(
  activity: ActivityDay[] | undefined | null,
  days = 84,
  today: Date = new Date(),
): HeatmapPoint[] {
  const result: HeatmapPoint[] = [];
  const activityMap = new Map<string, number>();

  if (activity && activity.length > 0) {
    for (const act of activity) {
      if (act.day && act.day.includes("/")) {
        const parts = act.day.split("/");
        const dayStr = parts[0];
        const monthStr = parts[1];
        if (!dayStr || !monthStr) continue;

        const parsedDay = Number.parseInt(dayStr, 10);
        const parsedMonth = Number.parseInt(monthStr, 10) - 1;
        if (Number.isNaN(parsedDay) || Number.isNaN(parsedMonth)) continue;

        let year = today.getFullYear();
        if (parsedMonth > today.getMonth()) {
          year -= 1;
        }

        const d = new Date(year, parsedMonth, parsedDay);
        const dateKey = formatDateKey(d);
        if (dateKey) {
          activityMap.set(dateKey, act.sessions || 0);
        }
      }
    }
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateKey(d);
    result.push({ date: dateStr, count: activityMap.get(dateStr) || 0 });
  }

  return result;
}

export interface DistributionPoint {
  name: string;
  value: number;
  color: string;
}

/**
 * Build the content distribution dataset from platform stats.
 */
export function buildDistributionData(stats: {
  totalSubjects?: number;
  totalExams?: number;
  totalResources?: number;
}): DistributionPoint[] {
  return [
    { name: "المواد الدراسية", value: stats.totalSubjects ?? 0, color: "#10b981" },
    { name: "الامتحانات", value: stats.totalExams ?? 0, color: "#8b5cf6" },
    { name: "المصادر التعليمية", value: stats.totalResources ?? 0, color: "#3b82f6" },
  ];
}

export interface UserGrowthPoint {
  month: string;
  users: number;
  [key: string]: unknown;
}

/**
 * Normalize raw user-growth chart data, converting numeric month indices
 * to Arabic month names.
 */
export function formatUserGrowthData(
  rawGrowth: Array<{ month: string | number; users: number }> | undefined | null,
): UserGrowthPoint[] {
  if (!rawGrowth || rawGrowth.length === 0) return [];
  return rawGrowth.map((item) => {
    const monthNum = typeof item.month === "number" ? item.month : parseInt(String(item.month), 10);
    const name = monthNum >= 1 && monthNum <= 12 ? (ARABIC_MONTHS[monthNum - 1] ?? String(item.month)) : String(item.month);
    return { ...item, month: name };
  });
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

/**
 * Build default dashboard goals when the backend does not provide them.
 */
export function buildDefaultGoals(stats: {
  newUsersThisWeek?: number;
}, activity: {
  studyMinutes?: number;
}): DashboardGoal[] {
  return [
    {
      id: "1",
      title: "مستخدمين جدد",
      current: stats.newUsersThisWeek ?? 0,
      target: 1000,
      unit: "مستخدم",
      category: "users",
      priority: "medium",
    },
    {
      id: "2",
      title: "دراسة مجمعة",
      current: Math.round((activity.studyMinutes ?? 0) / 60),
      target: 5000,
      unit: "ساعة",
      category: "engagement",
      priority: "high",
    },
  ];
}

/**
 * Map raw recent-activity entries to the shape expected by the ActivityFeed widget.
 * Coerces `createdAt`/`timestamp` strings into Date objects and normalizes the
 * `type` field to the union expected by the widget.
 */
export function normalizeRecentActivity<T extends { createdAt?: string; timestamp?: string; type?: string }>(
  items: T[] | undefined | null,
): Array<T & { timestamp: Date; type: ActivityType }> {
  if (!items || items.length === 0) return [];
  return items.map((a) => ({
    ...a,
    timestamp: new Date(a.createdAt || a.timestamp || new Date().toISOString()),
    type: normalizeActivityType(a.type),
  }));
}

export type ActivityType = "user" | "exam" | "achievement" | "task" | "post" | "comment";

function normalizeActivityType(type: string | undefined): ActivityType {
  const valid: ActivityType[] = ["user", "exam", "achievement", "task", "post", "comment"];
  return (valid as string[]).includes(type || "") ? (type as ActivityType) : "user";
}

/**
 * Map raw upcoming-events entries, coercing date strings to Date objects.
 */
export function normalizeUpcomingEvents<T extends { date?: string | Date }>(
  items: T[] | undefined | null,
): Array<T & { date: Date }> {
  if (!items || items.length === 0) return [];
  return items.map((e) => ({
    ...e,
    date: e.date ? new Date(e.date) : new Date(),
  }));
}