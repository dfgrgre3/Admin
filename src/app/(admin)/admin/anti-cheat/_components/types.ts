import type { LucideIcon } from "lucide-react";
import {
  PanelTop,
  EyeOff,
  ClipboardPaste,
  Camera,
  MousePointerClick,
  Minimize2,
  VideoOff,
  MonitorSmartphone,
  MousePointer,
  Timer,
  Mic,
  Keyboard,
  Cpu,
  Globe,
  Users,
  Headphones,
  Smartphone,
  AlertOctagon,
} from "lucide-react";

// ─────────────────────────────────────────────
//  حالات ودرجات الخطورة
// ─────────────────────────────────────────────

export type AntiCheatStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "CLEARED"
  | "DISMISSED"
  | "BLOCKED";

export type AntiCheatSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AntiCheatRuleAction = "FLAG" | "AUTO_BLOCK" | "NOTIFY" | "LOG_ONLY";

export type AntiCheatWhitelistStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export type AntiCheatEventType =
  | "TAB_SWITCH"
  | "WINDOW_BLUR"
  | "COPY_PASTE"
  | "SCREENSHOT"
  | "RIGHT_CLICK"
  | "FULLSCREEN_EXIT"
  | "CAMERA_OFF"
  | "MULTI_DEVICE"
  | "MOUSE_LEAVE"
  | "IDLE_TIMEOUT"
  | "VOICE_DETECTED"
  | "KEYBOARD_PATTERN"
  | "SUSPICIOUS_PROCESS"
  | "VPN_DETECTED"
  | "MULTIPLE_FACES"
  | "NO_FACE"
  | "HEADPHONES_DETECTED"
  | "MOBILE_DEVICE";

// ─────────────────────────────────────────────
//  الكيانات الأساسية
// ─────────────────────────────────────────────

export interface AntiCheatFlag {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId: string | null;
  examTitle: string;
  attemptId: string | null;
  riskScore: number;
  status: AntiCheatStatus;
  reason: string;
  eventCount: number;
  ipAddress: string;
  reviewerId: string | null;
  reviewerName?: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  lastEventAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AntiCheatEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId: string | null;
  examTitle: string;
  attemptId: string | null;
  eventType: AntiCheatEventType;
  severity: AntiCheatSeverity;
  detail: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  country?: string | null;
  city?: string | null;
  createdAt: string;
}

export interface AntiCheatFlagDetail {
  flag: AntiCheatFlag & {
    evidence: {
      riskScore?: number;
      eventCount?: number;
      byEventType?: { eventType: string; count: number }[];
      bySeverity?: { severity: string; count: number }[];
      timeline?: { hour: number; count: number }[];
      devices?: { fingerprint: string; browser: string; os: string; count: number }[];
      ips?: { ip: string; country?: string; count: number }[];
    };
  };
  events: AntiCheatEvent[];
}

// ─────────────────────────────────────────────
//  الملخصات والإحصاءات
// ─────────────────────────────────────────────

export interface AntiCheatSummary {
  totalFlags: number;
  open: number;
  underReview: number;
  cleared: number;
  dismissed: number;
  blocked: number;
  highRisk: number;
  uniqueStudents: number;
  totalEvents: number;
  criticalEvents: number;
  todayEvents: number;
  weeklyTrend?: { date: string; flags: number; events: number }[];
  topEventTypes?: { eventType: string; count: number }[];
  statusDistribution?: { status: AntiCheatStatus; count: number }[];
}

export interface AntiCheatPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AntiCheatFlagResponse {
  flags: AntiCheatFlag[];
  pagination: AntiCheatPagination;
  summary: AntiCheatSummary;
}

export interface AntiCheatEventsResponse {
  events: AntiCheatEvent[];
  pagination: AntiCheatPagination;
  summary: {
    totalEvents: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    todayCount: number;
    uniqueStudents: number;
    byType?: { eventType: string; count: number }[];
    byHour?: { hour: number; count: number }[];
  };
}

// ─────────────────────────────────────────────
//  السياسات والقواعد
// ─────────────────────────────────────────────

export interface AntiCheatRule {
  id: string;
  name: string;
  description: string;
  eventType: string;
  threshold: number;
  windowMinutes: number;
  action: AntiCheatRuleAction;
  severity: AntiCheatSeverity;
  isActive: boolean;
  autoBlock: boolean;
  notifyAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  triggeredCount?: number;
}

export interface AntiCheatPolicy {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  blockCameraOff: boolean;
  blockTabSwitch: boolean;
  blockCopyPaste: boolean;
  blockMultipleDevices: boolean;
  blockVoiceDetected: boolean;
  requireFullscreen: boolean;
  requireWebcam: boolean;
  requireMicrophone: boolean;
  recordSession: boolean;
  fingerprintCheck: boolean;
  randomChecks: boolean;
  maxWarnings: number;
  warningThreshold: number;
  blockOnCritical: boolean;
  createdAt: string;
  updatedAt: string;
  rulesCount?: number;
}

// ─────────────────────────────────────────────
//  القائمة البيضاء والاستثناءات
// ─────────────────────────────────────────────

export interface AntiCheatWhitelist {
  id: string;
  type: "USER" | "IP" | "DEVICE" | "EXAM";
  targetId: string;
  targetName: string;
  reason: string;
  status: AntiCheatWhitelistStatus;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
//  الإعدادات والفلاتر
// ─────────────────────────────────────────────

export interface AntiCheatFilters {
  search: string;
  status: AntiCheatStatus | "all";
  minRisk: number | "all";
  examId: string | "all";
  severity: AntiCheatSeverity | "all";
  eventType: AntiCheatEventType | "all";
  dateFrom?: string;
  dateTo?: string;
}

// ─────────────────────────────────────────────
//  إعدادات العرض (تسميات + ألوان)
// ─────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  AntiCheatStatus,
  { label: string; text: string; border: string; dot: string; bg: string }
> = {
  OPEN: {
    label: "مفتوحة",
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    dot: "bg-amber-500",
    bg: "bg-amber-500/10",
  },
  UNDER_REVIEW: {
    label: "قيد المراجعة",
    text: "text-purple-500",
    border: "border-purple-500/30 bg-purple-500/10",
    dot: "bg-purple-500",
    bg: "bg-purple-500/10",
  },
  CLEARED: {
    label: "تم التبرئة",
    text: "text-emerald-500",
    border: "border-emerald-500/30 bg-emerald-500/10",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
  },
  DISMISSED: {
    label: "مرفوضة",
    text: "text-slate-500",
    border: "border-slate-500/30 bg-slate-500/10",
    dot: "bg-slate-500",
    bg: "bg-slate-500/10",
  },
  BLOCKED: {
    label: "محظورة",
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    dot: "bg-red-500",
    bg: "bg-red-500/10",
  },
};

export const STATUS_ORDER: AntiCheatStatus[] = [
  "OPEN",
  "UNDER_REVIEW",
  "CLEARED",
  "DISMISSED",
  "BLOCKED",
];

export const SEVERITY_CONFIG: Record<
  AntiCheatSeverity,
  { label: string; text: string; border: string; bg: string; weight: number }
> = {
  LOW: {
    label: "منخفضة",
    text: "text-emerald-500",
    border: "border-emerald-500/30 bg-emerald-500/10",
    bg: "bg-emerald-500",
    weight: 1,
  },
  MEDIUM: {
    label: "متوسطة",
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    bg: "bg-amber-500",
    weight: 2,
  },
  HIGH: {
    label: "عالية",
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    bg: "bg-orange-500",
    weight: 3,
  },
  CRITICAL: {
    label: "حرجة",
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    bg: "bg-red-500",
    weight: 4,
  },
};

export const EVENT_TYPE_CONFIG: Record<
  AntiCheatEventType,
  { label: string; icon: LucideIcon; text: string; border: string; description: string }
> = {
  TAB_SWITCH: {
    label: "تبديل تبويب",
    icon: PanelTop,
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    description: "انتقل الطالب إلى تبويب آخر في المتصفح",
  },
  WINDOW_BLUR: {
    label: "مغادرة النافذة",
    icon: EyeOff,
    text: "text-slate-400",
    border: "border-slate-400/30 bg-slate-400/10",
    description: "فقدت النافذة التركيز أثناء الامتحان",
  },
  COPY_PASTE: {
    label: "نسخ / لصق",
    icon: ClipboardPaste,
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    description: "محاولة نسخ أو لصق محتوى",
  },
  SCREENSHOT: {
    label: "لقطة شاشة",
    icon: Camera,
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    description: "محاولة التقاط صورة للشاشة",
  },
  RIGHT_CLICK: {
    label: "نقرة يمين",
    icon: MousePointerClick,
    text: "text-slate-400",
    border: "border-slate-400/30 bg-slate-400/10",
    description: "استخدام قائمة السياق",
  },
  FULLSCREEN_EXIT: {
    label: "خروج من ملء الشاشة",
    icon: Minimize2,
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    description: "الخروج من وضع ملء الشاشة",
  },
  CAMERA_OFF: {
    label: "إيقاف الكاميرا",
    icon: VideoOff,
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    description: "تم إيقاف تشغيل الكاميرا",
  },
  MULTI_DEVICE: {
    label: "أجهزة متعددة",
    icon: MonitorSmartphone,
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    description: "محاولة الدخول من جهاز آخر",
  },
  MOUSE_LEAVE: {
    label: "مغادرة الفأرة",
    icon: MousePointer,
    text: "text-slate-400",
    border: "border-slate-400/30 bg-slate-400/10",
    description: "مغادرة مؤشر الفأرة لمنطقة الامتحان",
  },
  IDLE_TIMEOUT: {
    label: "انقطاع عن النشاط",
    icon: Timer,
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    description: "عدم وجود نشاط لفترة طويلة",
  },
  VOICE_DETECTED: {
    label: "كشف صوت",
    icon: Mic,
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    description: "تم اكتشاف أصوات في الخلفية",
  },
  KEYBOARD_PATTERN: {
    label: "نمط لوحة مفاتيح مشبوه",
    icon: Keyboard,
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    description: "نمط كتابة غير طبيعي يشير لاستخدام أداة خارجية",
  },
  SUSPICIOUS_PROCESS: {
    label: "عملية مشبوهة",
    icon: Cpu,
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    description: "تم اكتشاف عملية غير طبيعية على الجهاز",
  },
  VPN_DETECTED: {
    label: "تم كشف VPN",
    icon: Globe,
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    description: "استخدام شبكة VPN أو بروكسي",
  },
  MULTIPLE_FACES: {
    label: "وجوه متعددة",
    icon: Users,
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    description: "تم اكتشاف أكثر من وجه في الكاميرا",
  },
  NO_FACE: {
    label: "لا يوجد وجه",
    icon: AlertOctagon,
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    description: "لم يتم اكتشاف وجه أمام الكاميرا",
  },
  HEADPHONES_DETECTED: {
    label: "سماعات رأس",
    icon: Headphones,
    text: "text-orange-500",
    border: "border-orange-500/30 bg-orange-500/10",
    description: "تم اكتشاف استخدام سماعات",
  },
  MOBILE_DEVICE: {
    label: "جهاز محمول",
    icon: Smartphone,
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    description: "الدخول من جهاز محمول أثناء امتحان مكتبي",
  },
};

export const EVENT_TYPE_ORDER: AntiCheatEventType[] = Object.keys(
  EVENT_TYPE_CONFIG,
) as AntiCheatEventType[];

export const SEVERITY_ORDER: AntiCheatSeverity[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export const RULE_ACTION_CONFIG: Record<
  AntiCheatRuleAction,
  { label: string; text: string; border: string; dot: string }
> = {
  FLAG: {
    label: "تسجيل حالة",
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    dot: "bg-amber-500",
  },
  AUTO_BLOCK: {
    label: "حظر تلقائي",
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
    dot: "bg-red-500",
  },
  NOTIFY: {
    label: "إشعار المدير",
    text: "text-blue-500",
    border: "border-blue-500/30 bg-blue-500/10",
    dot: "bg-blue-500",
  },
  LOG_ONLY: {
    label: "تسجيل فقط",
    text: "text-slate-400",
    border: "border-slate-400/30 bg-slate-400/10",
    dot: "bg-slate-400",
  },
};

// ─────────────────────────────────────────────
//  أدوات مساعدة
// ─────────────────────────────────────────────

export interface RiskLevel {
  label: string;
  text: string;
  bar: string;
  glow: string;
  bg: string;
  ring: string;
}

function safeFormat(
  d: Date,
  options: Intl.DateTimeFormatOptions,
): string {
  try {
    return d.toLocaleString("ar-EG", options);
  } catch {
    return d.toISOString();
  }
}

export function riskLevel(score: number): RiskLevel {
  if (score < 0) score = 0;
  if (score >= 80) {
    return {
      label: "حرجة",
      text: "text-red-500",
      bar: "bg-gradient-to-r from-red-500 to-rose-500",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.5)]",
      bg: "bg-red-500/10",
      ring: "ring-red-500/30",
    };
  }
  if (score >= 60) {
    return {
      label: "عالية",
      text: "text-orange-500",
      bar: "bg-gradient-to-r from-orange-500 to-amber-500",
      glow: "shadow-[0_0_10px_rgba(249,115,22,0.4)]",
      bg: "bg-orange-500/10",
      ring: "ring-orange-500/30",
    };
  }
  if (score >= 30) {
    return {
      label: "متوسطة",
      text: "text-amber-500",
      bar: "bg-gradient-to-r from-amber-500 to-yellow-500",
      glow: "",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/30",
    };
  }
  return {
    label: "منخفضة",
    text: "text-emerald-500",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    glow: "",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
  };
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return safeFormat(new Date(value), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return safeFormat(new Date(value), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return safeFormat(new Date(value), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Returns a relative time string. To stay SSR-safe, callers in client
 * components should pass `now` from a `useEffect`-derived state, or
 * render this only on the client (e.g. mount-gated). On the server,
 * omit `now` to fall back to an absolute formatted date.
 */
export function timeAgo(
  value: string | null | undefined,
  now?: number,
): string {
  if (!value) return "—";
  if (typeof now !== "number") {
    return formatDate(value);
  }
  const d = new Date(value).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 0) return formatDate(value);
  if (diff < 60) return `قبل ${diff} ثانية`;
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 2592000) return `قبل ${Math.floor(diff / 86400)} يوم`;
  return formatDate(value);
}

export function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "؟").trim();
  if (!source) return "؟";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  const first = parts[0] ?? "";
  if (parts.length >= 2) {
    const second = parts[1] ?? "";
    return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
  }
  return first.slice(0, 2).toUpperCase();
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [user = "", domain = ""] = email.split("@");
  if (user.length === 0) return `***@${domain}`;
  if (user.length === 1) return `${user}***@${domain}`;
  if (user.length === 2) return `${user[0] ?? ""}***@${domain}`;
  return `${user.slice(0, 2)}${"*".repeat(Math.max(3, user.length - 2))}@${domain}`;
}

export function maskIp(ip: string): string {
  if (!ip) return "—";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.***.***.${parts[3]}`;
  }
  return ip;
}