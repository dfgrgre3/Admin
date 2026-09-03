// ─── API Log Types & Constants ───────────────────────────────

export type HttpStatus = "2xx" | "3xx" | "4xx" | "5xx";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiCategory =
  | "auth"
  | "users"
  | "courses"
  | "payments"
  | "media"
  | "analytics"
  | "admin"
  | "ai"
  | "notifications"
  | "system";
export type Severity = "info" | "warning" | "error" | "critical";

export interface ApiLogEntry {
  id: string;
  timestamp: string; // ISO
  method: HttpMethod;
  endpoint: string;
  category: ApiCategory;
  statusCode: number;
  statusGroup: HttpStatus;
  responseTimeMs: number;
  requestSize: number; // bytes
  responseSize: number; // bytes
  userId: string;
  userName: string;
  userRole: "ADMIN" | "TEACHER" | "STUDENT" | "SUPER_ADMIN" | "SUPPORT" | "SYSTEM";
  apiKeyId?: string;
  apiKeyName?: string;
  ip: string;
  userAgent: string;
  country?: string;
  severity: Severity;
  errorCode?: string;
  errorMessage?: string;
  rateLimited: boolean;
  cached: boolean;
}

export interface ApiLogsFilters {
  search: string;
  statusGroup: HttpStatus | "all";
  method: HttpMethod | "all";
  category: ApiCategory | "all";
  severity: Severity | "all";
  apiKeyId: string;
  startDate: string;
  endDate: string;
  minResponseTime: number | null;
  rateLimitedOnly: boolean;
  errorsOnly: boolean;
}

export interface ApiLogsSort {
  field: keyof ApiLogEntry;
  direction: "asc" | "desc";
}

export interface ApiLogsStats {
  total: number;
  successRate: number;
  errorRate: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  totalBandwidth: number;
  rateLimitedCount: number;
  uniqueEndpoints: number;
  uniqueUsers: number;
  byStatus: Record<HttpStatus, number>;
  byMethod: Record<HttpMethod, number>;
  byCategory: Record<ApiCategory, number>;
  bySeverity: Record<Severity, number>;
  byEndpoint: Array<{ endpoint: string; calls: number; avgMs: number; errors: number }>;
  byHour: Array<{ hour: string; calls: number; errors: number; avgMs: number }>;
  slowest: ApiLogEntry[];
  mostActiveKeys: Array<{ id: string; name: string; calls: number }>;
}

// ─── Static Configs ──────────────────────────────────────────

export const STATUS_CONFIG: Record<
  HttpStatus,
  { label: string; color: string; bg: string; range: string }
> = {
  "2xx": {
    label: "ناجح",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    range: "200-299",
  },
  "3xx": {
    label: "إعادة توجيه",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    range: "300-399",
  },
  "4xx": {
    label: "خطأ عميل",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    range: "400-499",
  },
  "5xx": {
    label: "خطأ خادم",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/30",
    range: "500-599",
  },
};

export const METHOD_CONFIG: Record<HttpMethod, { label: string; color: string; bg: string }> = {
  GET: { label: "GET", color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30" },
  POST: { label: "POST", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30" },
  PUT: { label: "PUT", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" },
  PATCH: { label: "PATCH", color: "text-violet-600", bg: "bg-violet-500/10 border-violet-500/30" },
  DELETE: { label: "DELETE", color: "text-rose-600", bg: "bg-rose-500/10 border-rose-500/30" },
};

export const CATEGORY_CONFIG: Record<ApiCategory, { label: string; color: string }> = {
  auth: { label: "المصادقة", color: "violet" },
  users: { label: "المستخدمون", color: "blue" },
  courses: { label: "الدورات", color: "emerald" },
  payments: { label: "المدفوعات", color: "amber" },
  media: { label: "الوسائط", color: "fuchsia" },
  analytics: { label: "التحليلات", color: "cyan" },
  admin: { label: "الإدارة", color: "rose" },
  ai: { label: "الذكاء الاصطناعي", color: "purple" },
  notifications: { label: "الإشعارات", color: "blue" },
  system: { label: "النظام", color: "slate" },
};

export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bg: string }
> = {
  info: { label: "معلومات", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
  warning: { label: "تحذیر", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  error: { label: "خطأ", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" },
  critical: { label: "حرج", color: "text-red-600", bg: "bg-red-500/15 border-red-500/40" },
};

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
export const HTTP_STATUS_GROUPS: HttpStatus[] = ["2xx", "3xx", "4xx", "5xx"];
export const API_CATEGORIES: ApiCategory[] = [
  "auth",
  "users",
  "courses",
  "payments",
  "media",
  "analytics",
  "admin",
  "ai",
  "notifications",
  "system",
];
export const SEVERITIES: Severity[] = ["info", "warning", "error", "critical"];