import {
  EVENT_TYPE_CONFIG,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  type AntiCheatSeverity,
  type AntiCheatStatus,
} from "../_components/types";

// ─────────────────────────────────────────────
//  ثوابت عامة لقسم مكافحة الغش
// ─────────────────────────────────────────────

export const ANTI_CHEAT_QUERY_KEY = "anti-cheat";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 5;

export const REFRESH_INTERVALS = {
  FAST: 15_000,
  NORMAL: 30_000,
  SLOW: 60_000,
  REALTIME: 10_000,
  FLAGS: 20_000,
  EVENTS: 15_000,
  WHITELIST: 60_000,
  POLICIES: 120_000,
} as const;

export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 80,
} as const;

export const REVIEW_REASONS = [
  { value: "MANUAL", label: "مراجعة يدوية" },
  { value: "AUTO_RULE", label: "قاعدة تلقائية" },
  { value: "STUDENT_REPORT", label: "بلاغ طالب" },
  { value: "TEACHER_REPORT", label: "بلاغ معلم" },
  { value: "PATTERN_DETECTED", label: "نمط مكتشف" },
] as const;

export const WHITELIST_TYPES = [
  { value: "USER", label: "مستخدم", icon: "User" },
  { value: "IP", label: "عنوان IP", icon: "Globe" },
  { value: "DEVICE", label: "جهاز", icon: "Monitor" },
  { value: "EXAM", label: "امتحان", icon: "BookOpen" },
] as const;

export const POLICY_PRESETS = [
  {
    id: "strict",
    name: "صارم",
    description: "مناسب للامتحانات النهائية والاختبارات المعتمدة",
    blockCameraOff: true,
    blockTabSwitch: true,
    blockCopyPaste: true,
    blockMultipleDevices: true,
    blockVoiceDetected: true,
    requireFullscreen: true,
    requireWebcam: true,
    requireMicrophone: true,
    recordSession: true,
    fingerprintCheck: true,
    randomChecks: true,
    maxWarnings: 2,
    warningThreshold: 50,
    blockOnCritical: true,
  },
  {
    id: "moderate",
    name: "متوسط",
    description: "مناسب للاختبارات الفصلية والواجبات الموقوتة",
    blockCameraOff: false,
    blockTabSwitch: true,
    blockCopyPaste: true,
    blockMultipleDevices: true,
    blockVoiceDetected: false,
    requireFullscreen: true,
    requireWebcam: false,
    requireMicrophone: false,
    recordSession: true,
    fingerprintCheck: true,
    randomChecks: true,
    maxWarnings: 5,
    warningThreshold: 60,
    blockOnCritical: true,
  },
  {
    id: "lenient",
    name: "متساهل",
    description: "مناسب للتمارين الذاتية والتقييمات التكوينية",
    blockCameraOff: false,
    blockTabSwitch: false,
    blockCopyPaste: false,
    blockMultipleDevices: false,
    blockVoiceDetected: false,
    requireFullscreen: false,
    requireWebcam: false,
    requireMicrophone: false,
    recordSession: false,
    fingerprintCheck: false,
    randomChecks: false,
    maxWarnings: 10,
    warningThreshold: 80,
    blockOnCritical: false,
  },
] as const;

export const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: "FileText" },
  { value: "json", label: "JSON", icon: "Code" },
  { value: "pdf", label: "PDF", icon: "FileText" },
] as const;

export const SEVERITY_WEIGHT: Record<AntiCheatSeverity, number> = {
  LOW: SEVERITY_CONFIG.LOW.weight,
  MEDIUM: SEVERITY_CONFIG.MEDIUM.weight,
  HIGH: SEVERITY_CONFIG.HIGH.weight,
  CRITICAL: SEVERITY_CONFIG.CRITICAL.weight,
};

export const STATUS_WEIGHT: Record<AntiCheatStatus, number> = {
  OPEN: 4,
  UNDER_REVIEW: 3,
  CLEARED: 1,
  DISMISSED: 0,
  BLOCKED: 5,
};

// عدد أيام افتراضي للترند
export const TREND_DAYS = 7;

// أعلى عدد عناصر في الرسوم البيانية
export const MAX_CHART_ITEMS = 12;

// ─────────────────────────────────────────────
//  قواعد افتراضية (تُستخدم عند إنشاء قواعد جديدة)
// ─────────────────────────────────────────────

export const DEFAULT_RULE_TEMPLATES = [
  {
    name: "تبديل التبويبات المتكرر",
    eventType: "TAB_SWITCH",
    threshold: 3,
    windowMinutes: 5,
    severity: "MEDIUM" as AntiCheatSeverity,
    action: "FLAG" as const,
  },
  {
    name: "إيقاف الكاميرا المطول",
    eventType: "CAMERA_OFF",
    threshold: 2,
    windowMinutes: 3,
    severity: "HIGH" as AntiCheatSeverity,
    action: "AUTO_BLOCK" as const,
  },
  {
    name: "محاولات النسخ المتكررة",
    eventType: "COPY_PASTE",
    threshold: 5,
    windowMinutes: 10,
    severity: "HIGH" as AntiCheatSeverity,
    action: "FLAG" as const,
  },
  {
    name: "كشف عدة وجوه",
    eventType: "MULTIPLE_FACES",
    threshold: 1,
    windowMinutes: 1,
    severity: "CRITICAL" as AntiCheatSeverity,
    action: "AUTO_BLOCK" as const,
  },
  {
    name: "استخدام VPN",
    eventType: "VPN_DETECTED",
    threshold: 1,
    windowMinutes: 1,
    severity: "MEDIUM" as AntiCheatSeverity,
    action: "NOTIFY" as const,
  },
  {
    name: "الدخول من جهاز محمول",
    eventType: "MOBILE_DEVICE",
    threshold: 1,
    windowMinutes: 1,
    severity: "HIGH" as AntiCheatSeverity,
    action: "FLAG" as const,
  },
];

export { STATUS_CONFIG, SEVERITY_CONFIG, EVENT_TYPE_CONFIG };