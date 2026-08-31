import {
  Info,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Users,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────
//  الأنواع الأساسية
// ────────────────────────────────────────────────────────────────────────────

export type AnnouncementType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type AnnouncementPriority = "LOW" | "MEDIUM" | "HIGH";

/** القنوات المسموح بها لإعادة إرسال الإعلان */
export type AnnouncementBroadcastChannel = "in_app" | "email" | "push" | "sms";

/** شرائح الجمهور المدعومة */
export type AnnouncementAudienceSegment =
  | "all"
  | "students"
  | "instructors"
  | "admins"
  | "parents"
  | "grade"
  | "role"
  | "custom";

/** إحصائيات تفاعل بسيطة (تُستخدم لعرض المؤشرات في الواجهة) */
export interface AnnouncementMetrics {
  /** عدد مرات الظهور في الصفحة الرئيسية */
  views: number;
  /** عدد نقرات "اعرف المزيد" إن وُجد رابط */
  clicks: number;
  /** عدد المستخدمين الذين وصلهم الإشعار فعلياً */
  delivered: number;
  /** عدد المستخدمين الذين فتحوا الإشعار */
  read: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  category?: string | null;
  link?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  /** تاريخ بدء النشر المجدول (null = فوري) */
  scheduledAt?: string | null;
  /** تاريخ انتهاء الصلاحية (null = لا تنتهي) */
  expiresAt?: string | null;
  /** شرائح الجمهور المستهدفة */
  audience?: AnnouncementAudienceSegment[];
  /** معرّفات المستخدمين المختارين (للشريحة المخصصة) */
  audienceUserIds?: string[];
  /** مستويات/صفوف مستهدفة عند اختيار شريحة grade */
  audienceGrades?: string[];
  /** القنوات المفعّلة للإرسال */
  channels?: AnnouncementBroadcastChannel[];
  /** إحصائيات التفاعل — اختيارية (متاحة فقط من API مفصّل) */
  metrics?: AnnouncementMetrics;
  /** ملاحظات داخلية بين فريق الإدارة فقط */
  internalNotes?: string | null;
  /** وسم/تاج للتتبع الداخلي */
  tags?: string[];
  /** هل تم جدولة النشر برمجياً (Scheduled) */
  isScheduled?: boolean;
  /** هل انتهت صلاحية الإعلان */
  isExpired?: boolean;
  /** حالة سير الموافقة */
  approvalStatus?: ApprovalStatus;
  /** التوقيع الإلكتروني (للإعلانات الحساسة) */
  signature?: DigitalSignature;
  /** هل يتطلب موافقة قبل النشر */
  requiresApproval?: boolean;
  /** معرّف المراجع المعتمد */
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  /** إعدادات الجدولة المتكررة */
  recurrence?: RecurrenceConfig;
  /** عدد التكرارات المنجزة (للتتبع) */
  recurrenceCount?: number;
  /** هل هذا إعلان A/B Test */
  isABTest?: boolean;
  /** معرّف الـ A/B Test */
  abTestId?: string;
  /** التقييم الذكي للمحتوى */
  contentScore?: number;
  author: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnnouncementsStats {
  total: number;
  active: number;
  inactive: number;
  thisWeek: number;
  lastWeek: number;
  scheduled: number;
  expired: number;
  urgent: number;
  success: number;
  draft: number;
  /** متوسط المشاهدات في اليوم لكل إعلان نشط */
  avgViewsPerDay: number;
  /** عدد السجلات التي بُنيت عليها الإحصائيات */
  loadedCount: number;
}

// ────────────────────────────────────────────────────────────────────────────
//  إعدادات النوع (Type/Priority) — موحدة ومُعاد استخدامها في كل الواجهات
// ────────────────────────────────────────────────────────────────────────────

export interface TypeConfig {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  textClass: string;
  bgClass: string;
  borderClass: string;
  gradientClass: string;
  description: string;
}

export const TYPE_CONFIG: Record<AnnouncementType, TypeConfig> = {
  INFO: {
    label: "إعلان عام",
    shortLabel: "عام",
    icon: Info,
    textClass: "text-blue-600",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    gradientClass: "from-blue-500/20 to-blue-500/5",
    description: "خبر أو معلومة عادية بدون تأثير عاجل على المستخدمين",
  },
  SUCCESS: {
    label: "خبر سار",
    shortLabel: "نجاح",
    icon: CheckCircle,
    textClass: "text-emerald-600",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    gradientClass: "from-emerald-500/20 to-emerald-500/5",
    description: "نجاح أو إنجاز يستحق إبرازاً إيجابياً",
  },
  WARNING: {
    label: "تنبيه هام",
    shortLabel: "تنبيه",
    icon: AlertTriangle,
    textClass: "text-amber-600",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    gradientClass: "from-amber-500/20 to-amber-500/5",
    description: "ينبه المستخدمين لضرورة اتخاذ إجراء لاحقاً",
  },
  ERROR: {
    label: "تحذير عاجل",
    shortLabel: "عاجل",
    icon: ShieldAlert,
    textClass: "text-red-600",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    gradientClass: "from-red-500/20 to-red-500/5",
    description: "تحذير طارئ يستوجب اهتماماً فورياً من جميع المستخدمين",
  },
};

export const TYPE_OPTIONS: { value: AnnouncementType; label: string }[] = [
  { value: "INFO", label: "إعلان عام" },
  { value: "SUCCESS", label: "خبر سار" },
  { value: "WARNING", label: "تنبيه هام" },
  { value: "ERROR", label: "تحذير عاجل" },
];

export interface PriorityConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  weight: number;
  description: string;
}

export const PRIORITY_CONFIG: Record<AnnouncementPriority, PriorityConfig> = {
  LOW: {
    label: "منخفضة",
    badgeClass: "text-slate-500 border-slate-500/30",
    dotClass: "bg-slate-400",
    weight: 1,
    description: "إعلانات روتينية، تظهر بشكل طبيعي في اللوحة",
  },
  MEDIUM: {
    label: "متوسطة",
    badgeClass: "text-amber-600 border-amber-500/30",
    dotClass: "bg-amber-500",
    weight: 2,
    description: "إعلانات تستحق الظهور المبكر مع تمييز متوسط",
  },
  HIGH: {
    label: "عالية",
    badgeClass: "text-red-600 border-red-500/30",
    dotClass: "bg-red-500",
    weight: 3,
    description: "إعلانات بارزة تُعرض في أعلى اللوحة مع شريط تنبيه",
  },
};

export const PRIORITY_OPTIONS: { value: AnnouncementPriority; label: string }[] = [
  { value: "LOW", label: "منخفضة" },
  { value: "MEDIUM", label: "متوسطة" },
  { value: "HIGH", label: "عالية" },
];

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "كل الحالات" },
  { value: "active", label: "منشور" },
  { value: "inactive", label: "مخفي" },
  { value: "scheduled", label: "مجدول" },
  { value: "expired", label: "منتهي الصلاحية" },
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "createdAt_desc", label: "الأحدث أولاً" },
  { value: "createdAt_asc", label: "الأقدم أولاً" },
  { value: "priority_desc", label: "الأعلى أولوية" },
  { value: "priority_asc", label: "الأقل أولوية" },
  { value: "title_asc", label: "العنوان (أ - ي)" },
  { value: "title_desc", label: "العنوان (ي - أ)" },
  { value: "scheduledAt_asc", label: "الجدول الزمني (الأقرب)" },
  { value: "expiresAt_asc", label: "الانتهاء (الأقرب)" },
];

// ────────────────────────────────────────────────────────────────────────────
//  الجمهور المستهدف (Audience)
// ────────────────────────────────────────────────────────────────────────────

export interface AudienceOption {
  value: AnnouncementAudienceSegment;
  label: string;
  description: string;
  icon: LucideIcon;
  requiresExtra?: "users" | "grades" | "roles";
}

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: "all",
    label: "جميع المستخدمين",
    description: "يصل الإعلان لكل المستخدمين على المنصة",
    icon: Users,
  },
  {
    value: "students",
    label: "الطلاب فقط",
    description: "يستهدف جميع الطلاب المسجلين",
    icon: GraduationCap,
  },
  {
    value: "instructors",
    label: "المعلمون فقط",
    description: "يستهدف فريق التدريس والمشرفين",
    icon: Sparkles,
  },
  {
    value: "admins",
    label: "المسؤولون فقط",
    description: "إعلان داخلي مخصص لفريق الإدارة",
    icon: ShieldCheck,
  },
  {
    value: "parents",
    label: "أولياء الأمور",
    description: "يصل لأولياء الأمور الذين فعّلوا حساب ولي الأمر",
    icon: Users,
  },
  {
    value: "grade",
    label: "صف دراسي محدد",
    description: "يستهدف الطلاب في صف دراسي بعينه",
    icon: GraduationCap,
    requiresExtra: "grades",
  },
  {
    value: "role",
    label: "دور محدد",
    description: "يقتصر على المستخدمين بدور إداري معين",
    icon: ShieldCheck,
    requiresExtra: "roles",
  },
  {
    value: "custom",
    label: "قائمة مخصصة",
    description: "اختر مستخدمين بعينهم يدوياً",
    icon: Users,
    requiresExtra: "users",
  },
];

export const AUDIENCE_SEGMENT_VALUES = AUDIENCE_OPTIONS.map((o) => o.value);

// ────────────────────────────────────────────────────────────────────────────
//  قنوات الإرسال
// ────────────────────────────────────────────────────────────────────────────

export interface ChannelOption {
  value: AnnouncementBroadcastChannel;
  label: string;
  description: string;
  icon: LucideIcon;
  recommended?: boolean;
}

export const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    value: "in_app",
    label: "إشعار داخل التطبيق",
    description: "صندوق الإشعارات وشريط التنبيهات العلوي",
    icon: Sparkles,
    recommended: true,
  },
  {
    value: "push",
    label: "إشعار المتصفح",
    description: "Web Push حتى لو كان التبويب مغلقاً",
    icon: ShieldCheck,
  },
  {
    value: "email",
    label: "البريد الإلكتروني",
    description: "يُرسل نسخة كاملة عبر البريد مع المرفقات",
    icon: Sparkles,
  },
  {
    value: "sms",
    label: "رسالة SMS",
    description: "للحالات العاجلة فقط — يتطلب رصيداً متاحاً",
    icon: ShieldAlert,
  },
];

export const CHANNEL_VALUES = CHANNEL_OPTIONS.map((o) => o.value);

// ────────────────────────────────────────────────────────────────────────────
//  فلاتر التاريخ (Period)
// ────────────────────────────────────────────────────────────────────────────

export const DATE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "كل الفترات" },
  { value: "today", label: "اليوم" },
  { value: "7d", label: "آخر 7 أيام" },
  { value: "30d", label: "آخر 30 يوم" },
  { value: "90d", label: "آخر 90 يوم" },
  { value: "custom", label: "نطاق مخصص" },
];

// ────────────────────────────────────────────────────────────────────────────
//  ثوابت الصفوف الدراسية والأدوار الافتراضية
// ────────────────────────────────────────────────────────────────────────────

export const DEFAULT_GRADE_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "الصف الأول الثانوي" },
  { value: "2", label: "الصف الثاني الثانوي" },
  { value: "3", label: "الصف الثالث الثانوي" },
];

export const DEFAULT_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "admin", label: "مدير عام" },
  { value: "moderator", label: "مشرف محتوى" },
  { value: "support", label: "الدعم الفني" },
  { value: "finance", label: "المالية" },
];

// ────────────────────────────────────────────────────────────────────────────
//  أدوات مساعدة للتحقق والاشتقاق
// ────────────────────────────────────────────────────────────────────────────

export function parseSort(value: string): { sortBy: string; sortDir: string } {
  const [sortBy, sortDir] = value.split("_");
  return { sortBy: sortBy || "createdAt", sortDir: sortDir || "desc" };
}

/** يتحقق هل الإعلان "حي" حالياً (نشط، غير منتهي، بدأ وقته) */
export function getAnnouncementStatus(
  a: Pick<Announcement, "isActive" | "scheduledAt" | "expiresAt">
): "draft" | "scheduled" | "active" | "expired" | "inactive" {
  if (!a.isActive) return "inactive";
  const now = Date.now();
  if (a.expiresAt && new Date(a.expiresAt).getTime() < now) return "expired";
  if (a.scheduledAt && new Date(a.scheduledAt).getTime() > now) return "scheduled";
  return "active";
}

/** يحوّل حالة الإعلان إلى نص عربي مختصر لاستخدامه في الشارات */
export function getAnnouncementStatusLabel(
  status: ReturnType<typeof getAnnouncementStatus>
): string {
  switch (status) {
    case "active":
      return "منشور";
    case "scheduled":
      return "مجدول";
    case "expired":
      return "منتهي";
    case "inactive":
      return "مخفي";
    default:
      return "مسودة";
  }
}

/** يحوّل شرائح الجمهور إلى قائمة مقروءة */
export function summarizeAudience(
  segments?: AnnouncementAudienceSegment[],
  extra?: { grades?: string[]; roles?: string[]; count?: number }
): string {
  if (!segments || segments.length === 0) return "غير محدد";
  const labels: string[] = [];
  for (const seg of segments) {
    const opt = AUDIENCE_OPTIONS.find((o) => o.value === seg);
    if (opt) labels.push(opt.label);
  }
  let out = labels.join(" • ");
  if (extra?.grades?.length) out += ` (${extra.grades.length} صف)`;
  if (extra?.roles?.length) out += ` (${extra.roles.length} دور)`;
  if (extra?.count) out += ` (${extra.count} مستخدم)`;
  return out;
}

/** يتحقق هل الإعلان قابل للنشر الآن بناءً على الحالة والصلاحية */
export function canPublishNow(a: Pick<Announcement, "scheduledAt" | "expiresAt">): {
  ok: boolean;
  reason?: string;
} {
  const now = Date.now();
  if (a.expiresAt && new Date(a.expiresAt).getTime() < now) {
    return { ok: false, reason: "تاريخ الانتهاء في الماضي" };
  }
  if (a.scheduledAt && new Date(a.scheduledAt).getTime() > now) {
    return {
      ok: false,
      reason: "لم يحن وقت النشر المجدول بعد",
    };
  }
  return { ok: true };
}

// ────────────────────────────────────────────────────────────────────────────
//  القوالب الجاهزة (Templates)
// ────────────────────────────────────────────────────────────────────────────

export type TemplateCategory =
  | "academic"
  | "exam"
  | "event"
  | "emergency"
  | "celebration"
  | "maintenance"
  | "general";

export interface AnnouncementTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  icon?: string;
  /** بيانات الإعلان الافتراضية */
  data: {
    title: string;
    content: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    category?: string;
    audience?: AnnouncementAudienceSegment[];
    channels?: AnnouncementBroadcastChannel[];
    tags?: string[];
    link?: string;
  };
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
  isPublic: boolean;
  authorId: string;
  authorName?: string;
}

export const TEMPLATE_CATEGORIES: Record<
  TemplateCategory,
  { label: string; color: string; icon: LucideIcon }
> = {
  academic: {
    label: "أكاديمي",
    color: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    icon: GraduationCap,
  },
  exam: {
    label: "امتحانات",
    color: "bg-red-500/15 text-red-500 border-red-500/30",
    icon: ShieldAlert,
  },
  event: {
    label: "فعاليات",
    color: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    icon: Sparkles,
  },
  emergency: {
    label: "طوارئ",
    color: "bg-red-500/15 text-red-600 border-red-500/40",
    icon: ShieldAlert,
  },
  celebration: {
    label: "احتفالات",
    color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    icon: CheckCircle,
  },
  maintenance: {
    label: "صيانة",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    icon: Info,
  },
  general: {
    label: "عام",
    color: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    icon: Info,
  },
};

/** القوالب الافتراضية المضمّنة في النظام */
export const BUILTIN_TEMPLATES: AnnouncementTemplate[] = [
  {
    id: "builtin-exam-reminder",
    name: "تذكير بامتحان",
    description: "قالب لتذكير الطلاب بامتحان قادم",
    category: "exam",
    data: {
      title: "تذكير: امتحان قادم",
      content:
        '<p>نود تذكيركم بوجود <strong>امتحان</strong> يوم <em>[التاريخ]</em> في تمام الساعة <em>[الوقت]</em>.</p><p>يرجى الالتزام بالحضور في الموعد.</p>',
      type: "WARNING",
      priority: "HIGH",
      category: "امتحانات",
      audience: ["students"],
      channels: ["in_app", "push"],
      tags: ["امتحان", "تذكير"],
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
    authorId: "system",
    authorName: "النظام",
  },
  {
    id: "builtin-maintenance",
    name: "صيانة مجدولة",
    description: "إعلان عن فترة صيانة للمنصة",
    category: "maintenance",
    data: {
      title: "صيانة مجدولة للنظام",
      content:
        '<p>سيتم إجراء <strong>صيانة مجدولة</strong> على النظام يوم <em>[التاريخ]</em> من الساعة <em>[وقت البداية]</em> حتى <em>[وقت النهاية]</em>.</p><p>قد يتعذر الوصول مؤقتاً خلال هذه الفترة.</p>',
      type: "INFO",
      priority: "MEDIUM",
      category: "صيانة",
      audience: ["all"],
      channels: ["in_app", "email"],
      tags: ["صيانة", "تنبيه"],
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
    authorId: "system",
    authorName: "النظام",
  },
  {
    id: "builtin-celebration",
    name: "إعلان تهنئة",
    description: "قالب للإعلانات الاحتفالية والتهنئة",
    category: "celebration",
    data: {
      title: "تهانينا!",
      content:
        '<p>نتقدم بأحر <strong>التهاني</strong> لجميع طلابنا وأولياء أمورهم على هذا الإنجاز الرائع! 🎉</p><p>استمر في التفوق.</p>',
      type: "SUCCESS",
      priority: "LOW",
      category: "تهنئة",
      audience: ["all"],
      channels: ["in_app"],
      tags: ["تهنئة", "احتفال"],
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
    authorId: "system",
    authorName: "النظام",
  },
  {
    id: "builtin-emergency",
    name: "تحذير طارئ",
    description: "قالب للحال العاجلة والتحذيرات الحرجة",
    category: "emergency",
    data: {
      title: "تنبيه طارئ - إجراء فوري",
      content:
        '<p>يرجى العلم بحدوث <em>[وصف الحدث]</em>. يرجى اتخاذ <strong>الإجراءات اللازمة</strong> فوراً.</p>',
      type: "ERROR",
      priority: "HIGH",
      category: "طوارئ",
      audience: ["all"],
      channels: ["in_app", "push", "sms"],
      tags: ["عاجل", "طارئ"],
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
    authorId: "system",
    authorName: "النظام",
  },
  {
    id: "builtin-event",
    name: "دعوة لفعالية",
    description: "قالب لدعوة المستخدمين لفعالية قادمة",
    category: "event",
    data: {
      title: "فعالية قادمة: [اسم الفعالية]",
      content:
        '<p>يسرنا دعوتكم لحضور <strong>[اسم الفعالية]</strong> يوم <em>[التاريخ]</em>.</p><p>المكان: <em>[المكان]</em></p><p>الزمن: <em>[الوقت]</em></p>',
      type: "INFO",
      priority: "MEDIUM",
      category: "فعاليات",
      audience: ["all"],
      channels: ["in_app", "email"],
      tags: ["فعالية", "دعوة"],
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
    authorId: "system",
    authorName: "النظام",
  },
  {
    id: "builtin-academic",
    name: "إعلان أكاديمي",
    description: "قالب للإعلانات الأكاديمية العامة",
    category: "academic",
    data: {
      title: "[موضوع الإعلان]",
      content:
        '<p>[المحتوى الأكاديمي]</p><p>لمزيد من المعلومات، يرجى زيارة صفحة المادة.</p>',
      type: "INFO",
      priority: "MEDIUM",
      category: "أكاديمي",
      audience: ["students"],
      channels: ["in_app"],
      tags: ["أكاديمي"],
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    isPublic: true,
    authorId: "system",
    authorName: "النظام",
  },
];

// ────────────────────────────────────────────────────────────────────────────
//  الجدولة المتكررة (Recurring Schedule)
// ────────────────────────────────────────────────────────────────────────────

export type RecurrenceFrequency =
  | "none"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "custom";

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  /** عدد التكرارات (0 = لا نهائي) */
  count: number;
  /** أيام الأسبوع للتكرار الأسبوعي (0=الأحد..6=السبت) */
  weekdays?: number[];
  /** يوم الشهر للتكرار الشهري */
  dayOfMonth?: number;
  /** ساعة النشر (0-23) */
  hour: number;
  /** الدقيقة (0-59) */
  minute: number;
  /** تاريخ انتهاء التكرار */
  endDate?: string;
}

export const RECURRENCE_OPTIONS: {
  value: RecurrenceFrequency;
  label: string;
  description: string;
}[] = [
  { value: "none", label: "بدون تكرار", description: "ينشر مرة واحدة فقط" },
  { value: "daily", label: "يومياً", description: "يتكرر كل يوم في نفس الوقت" },
  { value: "weekly", label: "أسبوعياً", description: "يتكرر كل أسبوع في يوم محدد" },
  { value: "biweekly", label: "كل أسبوعين", description: "مرة كل أسبوعين" },
  { value: "monthly", label: "شهرياً", description: "يتكرر كل شهر في نفس اليوم" },
  { value: "custom", label: "مخصص", description: "تكرار متقدم مع شرط Cron" },
];

export const WEEKDAY_LABELS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// ────────────────────────────────────────────────────────────────────────────
//  سير الموافقة (Approval Workflow)
// ────────────────────────────────────────────────────────────────────────────

export type ApprovalStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "archived";

export interface ApprovalAction {
  id: string;
  action:
    | "submit_for_review"
    | "approve"
    | "reject"
    | "request_changes"
    | "publish"
    | "unpublish"
    | "archive";
  actorId: string;
  actorName: string;
  comment?: string;
  createdAt: string;
}

export const APPROVAL_STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; icon: LucideIcon; description: string }
> = {
  draft: {
    label: "مسودة",
    color: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    icon: Info,
    description: "قابل للتعديل ولا يظهر للمستخدمين",
  },
  pending_review: {
    label: "بانتظار المراجعة",
    color: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    icon: AlertTriangle,
    description: "تم الإرسال للمراجعة من قبل المسؤول الأعلى",
  },
  approved: {
    label: "معتمد",
    color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    icon: CheckCircle,
    description: "معتمد وجاهز للنشر",
  },
  rejected: {
    label: "مرفوض",
    color: "bg-red-500/15 text-red-500 border-red-500/30",
    icon: ShieldAlert,
    description: "تم رفض الإعلان، يحتاج لتعديلات",
  },
  published: {
    label: "منشور",
    color: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    icon: Info,
    description: "منشور ومتوفرها للمستخدمين",
  },
  archived: {
    label: "مؤرشف",
    color: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    icon: Info,
    description: "مؤرشف ولم يعد نشطاً",
  },
};

// ────────────────────────────────────────────────────────────────────────────
//  التوقيع الإلكتروني (Digital Signature)
// ────────────────────────────────────────────────────────────────────────────

export interface DigitalSignature {
  signedBy: string;
  signedByName: string;
  signedAt: string;
  signature: string;
  /** ملاحظات أو تأكيد */
  confirmation: string;
  /** عنوان IP للأمان */
  ipAddress?: string;
}

// ────────────────────────────────────────────────────────────────────────────
//  نظام الإصدارات (Versioning)
// ────────────────────────────────────────────────────────────────────────────

export interface AnnouncementVersion {
  id: string;
  announcementId: string;
  version: number;
  /** لقطة من بيانات الإعلان في تلك اللحظة */
  snapshot: Partial<Announcement>;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  changeSummary?: string;
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// ────────────────────────────────────────────────────────────────────────────
//  A/B Testing
// ────────────────────────────────────────────────────────────────────────────

export type ABTestStatus = "draft" | "running" | "completed" | "cancelled";

export interface ABTestVariant {
  id: string;
  name: string;
  /** نسبة التوزيع (0-100) */
  weight: number;
  data: {
    title: string;
    content: string;
    type?: AnnouncementType;
  };
  /** المقاييس الفعلية بعد التجربة */
  metrics?: {
    views: number;
    clicks: number;
    ctr: number;
    conversions: number;
  };
}

export interface ABTest {
  id: string;
  announcementId: string;
  name: string;
  status: ABTestStatus;
  variants: ABTestVariant[];
  /** معيار قياس النجاح */
  goalMetric: "ctr" | "views" | "clicks" | "read_rate";
  startedAt?: string;
  endedAt?: string;
  /** الفائز الحالي (إن وُجد) */
  winner?: string;
  createdAt: string;
  createdBy: string;
}

export const AB_GOAL_OPTIONS = [
  { value: "ctr", label: "نسبة النقر (CTR)" },
  { value: "views", label: "المشاهدات" },
  { value: "clicks", label: "النقرات" },
  { value: "read_rate", label: "معدل القراءة" },
] as const;