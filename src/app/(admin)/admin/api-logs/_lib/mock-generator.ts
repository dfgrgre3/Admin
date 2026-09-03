// ─── Mock Data Generator for API Logs ────────────────────────
// Generates realistic API logs in the browser (no backend needed).

import type {
  ApiLogEntry,
  ApiCategory,
  HttpMethod,
  HttpStatus,
  Severity,
} from "./constants";

// Seedable pseudo-random to keep data stable per session
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ENDPOINTS_BY_CATEGORY: Record<ApiCategory, string[]> = {
  auth: [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/refresh",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/verify-2fa",
    "/api/auth/session",
  ],
  users: [
    "/api/users",
    "/api/users/:id",
    "/api/users/:id/profile",
    "/api/users/:id/avatar",
    "/api/users/:id/settings",
    "/api/users/search",
  ],
  courses: [
    "/api/courses",
    "/api/courses/:id",
    "/api/courses/:id/lessons",
    "/api/courses/:id/enroll",
    "/api/courses/:id/reviews",
    "/api/categories",
  ],
  payments: [
    "/api/payments",
    "/api/payments/:id",
    "/api/payments/refund",
    "/api/checkout",
    "/api/invoices",
    "/api/subscriptions",
    "/api/coupons/validate",
  ],
  media: [
    "/api/media/upload",
    "/api/media/:id",
    "/api/media/:id/url",
    "/api/media/list",
  ],
  analytics: [
    "/api/analytics/dashboard",
    "/api/analytics/events",
    "/api/analytics/reports/:id",
    "/api/metrics",
  ],
  admin: [
    "/api/admin/users",
    "/api/admin/settings",
    "/api/admin/audit-logs",
    "/api/admin/permissions",
  ],
  ai: [
    "/api/ai/generate",
    "/api/ai/chat",
    "/api/ai/moderate",
    "/api/ai/embeddings",
    "/api/ai/transcribe",
  ],
  notifications: [
    "/api/notifications",
    "/api/notifications/:id/read",
    "/api/notifications/broadcast",
    "/api/push/subscribe",
  ],
  system: [
    "/api/health",
    "/api/health/db",
    "/api/health/cache",
    "/api/jobs/run",
    "/api/cache/invalidate",
  ],
};

const USER_NAMES = [
  "أحمد محمد",
  "سارة علي",
  "خالد يوسف",
  "نورة الحسن",
  "محمد إبراهيم",
  "فاطمة الزهراء",
  "عمر السيد",
  "ليلى عبد الله",
  "يوسف طارق",
  "مريم ناصر",
  "حسن فؤاد",
  "هدى سليم",
  "system",
  "cron-worker",
  "webhook-relay",
];

const ROLES: ApiLogEntry["userRole"][] = [
  "ADMIN",
  "TEACHER",
  "STUDENT",
  "SUPER_ADMIN",
  "SUPPORT",
  "SYSTEM",
];

const API_KEYS = [
  { id: "key_n8n_prod", name: "Production n8n" },
  { id: "key_mobile_app", name: "Mobile App (iOS/Android)" },
  { id: "key_web_app", name: "Web Application" },
  { id: "key_partner_acme", name: "Partner: ACME Corp" },
  { id: "key_ci_cd", name: "CI/CD Pipeline" },
  { id: "key_analytics_etl", name: "Analytics ETL" },
];

const COUNTRIES = ["مصر", "السعودية", "الإمارات", "الأردن", "الكويت", "قطر", "المغرب", "العراق"];
const ERROR_MESSAGES: Record<number, string[]> = {
  400: ["Invalid request payload", "Missing required field 'email'", "Malformed JSON body"],
  401: ["Authentication required", "Invalid or expired token", "API key revoked"],
  403: ["Insufficient permissions", "Resource forbidden", "2FA required"],
  404: ["Resource not found", "Endpoint deprecated", "Item was deleted"],
  409: ["Conflict: duplicate entry", "Email already in use", "Version mismatch"],
  422: ["Validation failed", "Schema mismatch", "Unprocessable entity"],
  429: ["Rate limit exceeded", "Too many login attempts", "Quota exhausted for today"],
  500: ["Internal server error", "Unhandled exception", "Database connection lost"],
  502: ["Upstream service unavailable", "Gateway timeout"],
  503: ["Service temporarily unavailable", "Maintenance in progress"],
  504: ["Upstream timeout", "Gateway timeout (>30s)"],
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
  "AdminApp/2.4.1 (iOS; iPhone; iOS 17.2)",
  "AdminApp/2.4.1 (Android 14; SM-S908B)",
  "PostmanRuntime/7.36.0",
  "node-fetch/1.0",
  "Python-urllib/3.11",
  "Go-http-client/2.0",
  "okhttp/4.12.0",
];

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)] as T;
}

function ipFromRandom(rnd: () => number): string {
  return `${10 + Math.floor(rnd() * 240)}.${Math.floor(rnd() * 255)}.${Math.floor(
    rnd() * 255
  )}.${Math.floor(rnd() * 255)}`;
}

function statusCodeFromGroup(group: HttpStatus, rnd: () => number): number {
  switch (group) {
    case "2xx":
      return [200, 201, 204][Math.floor(rnd() * 3)] ?? 200;
    case "3xx":
      return [301, 302, 304][Math.floor(rnd() * 3)] ?? 301;
    case "4xx":
      return [400, 401, 403, 404, 409, 422, 429][Math.floor(rnd() * 7)] ?? 400;
    case "5xx":
      return [500, 502, 503, 504][Math.floor(rnd() * 4)] ?? 500;
  }
}

function severityForStatus(group: HttpStatus, rnd: () => number): Severity {
  if (group === "5xx") return rnd() > 0.7 ? "critical" : "error";
  if (group === "4xx") return rnd() > 0.85 ? "error" : "warning";
  return "info";
}

let cache: ApiLogEntry[] | null = null;
let cacheSeed = 42;

export function generateApiLogs(count = 320, seed = 42): ApiLogEntry[] {
  if (cache && cacheSeed === seed && cache.length === count) return cache;
  cacheSeed = seed;
  const rnd = mulberry32(seed);
  const logs: ApiLogEntry[] = [];

  // Spread logs across last 24 hours
  const now = Date.now();
  const startWindow = now - 24 * 60 * 60 * 1000;

  // Weighted distributions
  const statusWeights: Array<[HttpStatus, number]> = [
    ["2xx", 78],
    ["4xx", 14],
    ["3xx", 5],
    ["5xx", 3],
  ];
  const methodWeights: Array<[HttpMethod, number]> = [
    ["GET", 60],
    ["POST", 22],
    ["PUT", 7],
    ["PATCH", 5],
    ["DELETE", 6],
  ];

  function weighted<T>(pairs: Array<[T, number]>): T {
    const total = pairs.reduce((s, [, w]) => s + w, 0);
    let r = rnd() * total;
    for (const [v, w] of pairs) {
      if ((r -= w) <= 0) return v as T;
    }
    return pairs[0]![0] as T;
  }

  for (let i = 0; i < count; i++) {
    const category = pick(API_CATEGORIES_ARR(rnd), rnd);
    const endpoints = ENDPOINTS_BY_CATEGORY[category];
    const baseEndpoint = pick(endpoints, rnd);
    const method = weighted(methodWeights);
    const statusGroup = weighted(statusWeights);
    const statusCode = statusCodeFromGroup(statusGroup, rnd);

    // Realistic latency: GETs are fast, POSTs slower, 5xx slowest
    let baseMs = method === "GET" ? 30 + rnd() * 120 : 80 + rnd() * 400;
    if (statusGroup === "5xx") baseMs += 800 + rnd() * 2200;
    else if (statusGroup === "4xx") baseMs += rnd() * 60;
    const responseTimeMs = Math.round(baseMs);

    // Timestamp skewed: more recent traffic
    const skew = Math.pow(rnd(), 1.6); // bias toward recent
    const ts = startWindow + skew * (now - startWindow);

    const isSystem = category === "system" || rnd() < 0.04;
    const role = isSystem ? "SYSTEM" : pick(ROLES.slice(0, 5), rnd);
    const userName = isSystem ? "system" : pick(USER_NAMES, rnd);
    const userId = isSystem ? "system" : `usr_${Math.floor(rnd() * 100000).toString(36)}`;

    const rateLimited = statusCode === 429;
    const cached = method === "GET" && statusGroup === "2xx" && rnd() > 0.7;
    const key = rnd() < 0.45 ? pick(API_KEYS, rnd) : undefined;

    const errorCode =
      statusGroup === "4xx" || statusGroup === "5xx"
        ? `E_${statusCode}_${Math.floor(rnd() * 999)
            .toString(36)
            .toUpperCase()
            .padStart(3, "0")}`
        : undefined;
    const errorMessage =
      statusGroup === "4xx" || statusGroup === "5xx"
        ? pick(ERROR_MESSAGES[statusCode] || ["Unknown error"], rnd)
        : undefined;

    logs.push({
      id: `req_${(ts).toString(36)}_${Math.floor(rnd() * 1e6).toString(36)}`,
      timestamp: new Date(ts).toISOString(),
      method,
      endpoint: baseEndpoint,
      category,
      statusCode,
      statusGroup,
      responseTimeMs,
      requestSize: Math.round((method === "GET" ? 200 + rnd() * 400 : 800 + rnd() * 14000) * (cached ? 0.3 : 1)),
      responseSize: Math.round((statusGroup === "2xx" ? 400 + rnd() * 80000 : 200 + rnd() * 2000) * (cached ? 0.2 : 1)),
      userId,
      userName,
      userRole: role,
      apiKeyId: key?.id,
      apiKeyName: key?.name,
      ip: ipFromRandom(rnd),
      userAgent: pick(USER_AGENTS, rnd),
      country: pick(COUNTRIES, rnd),
      severity: severityForStatus(statusGroup, rnd),
      errorCode,
      errorMessage,
      rateLimited,
      cached,
    });
  }

  // Sort newest first
  logs.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  cache = logs;
  return logs;
}

function API_CATEGORIES_ARR(rnd: () => number): ApiCategory[] {
  // Weighted category picker favoring "system" + "auth" a bit
  return [
    "users", "users", "users",
    "courses", "courses",
    "payments", "payments",
    "auth", "auth",
    "media",
    "analytics",
    "admin",
    "ai",
    "notifications",
    "system", "system",
  ];
}

export function getApiKeysList() {
  return API_KEYS;
}