export type NotificationChannel = "IN_APP" | "PUSH" | "EMAIL";

export interface NotificationDraft {
  title: string;
  body: string;
  channels: NotificationChannel[];
}

export interface NotificationDraftValidationResult {
  isValid: boolean;
  errors: string[];
  preview: {
    summary: string;
    channels: string[];
  };
}

export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  category: string;
}

export interface NotificationRecipientCandidate {
  id: string;
  role?: string;
}

export type NotificationAudienceType = "all" | "roles" | "custom";

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  IN_APP: "داخل التطبيق",
  PUSH: "Push",
  EMAIL: "البريد الإلكتروني",
};

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "الطلاب",
  PARENT: "أولياء الأمور",
  TEACHER: "المعلمون",
  MODERATOR: "المشرفون",
  ADMIN: "المدراء",
  SUPPORT: "الدعم الفني",
  SUPER_ADMIN: "المدراء العامون",
};

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: "welcome",
    title: "أهلاً بك في منصة ثانوية",
    body: "مرحباً بك، نأمل أن تجد في المنصة تجربة تعليمية مميزة ومريحة.",
    category: "ترحيب",
  },
  {
    id: "update",
    title: "تحديث مهم على المنصة",
    body: "تم تحديث المنصة بميزات جديدة. تفضل بزيارة القسم المحدث للاطلاع على التفاصيل.",
    category: "تحديث",
  },
  {
    id: "reminder",
    title: "تذكير مهم",
    body: "يرجى مراجعة المهام أو الدروس المتاحة لديك قبل الموعد المحدد.",
    category: "تذكير",
  },
  {
    id: "maintenance",
    title: "صيانة مجدولة",
    body: "سيتم إجراء صيانة للمنصة خلال الفترة القادمة، يرجى مراعاة ذلك.",
    category: "صيانة",
  },
];

export function getNotificationTemplates(): NotificationTemplate[] {
  return DEFAULT_TEMPLATES;
}

export function buildAudienceSummary(type: NotificationAudienceType, roles: string[] = []): string {
  if (type === "roles" && roles.length > 0) {
    return roles.map((role) => ROLE_LABELS[role] || role).join("، ");
  }

  if (type === "custom") {
    return "مستخدمون مخصصون";
  }

  return "جميع المستخدمين";
}

export function resolveNotificationTargets(
  baseIds: string[],
  candidates: NotificationRecipientCandidate[],
  type: NotificationAudienceType,
  roles: string[] = [],
): string[] {
  if (!baseIds.length) {
    return [];
  }

  if (type === "roles") {
    const selectedRoles = new Set(roles);
    return candidates
      .filter((candidate) => baseIds.includes(candidate.id) && selectedRoles.has(candidate.role || ""))
      .map((candidate) => candidate.id);
  }

  return baseIds;
}

export function validateNotificationDraft(
  draft: Partial<NotificationDraft>,
  targetLabel: string,
): NotificationDraftValidationResult {
  const errors: string[] = [];

  if (!draft.title?.trim()) {
    errors.push("أدخل عنوان الإشعار قبل الإرسال.");
  }

  if (!draft.body?.trim()) {
    errors.push("أدخل نص الإشعار قبل الإرسال.");
  }

  if (!draft.channels || draft.channels.length === 0) {
    errors.push("اختر قناة واحدة على الأقل للإرسال.");
  }

  const previewChannels = (draft.channels || []).map((channel) => CHANNEL_LABELS[channel] || channel);

  return {
    isValid: errors.length === 0,
    errors,
    preview: {
      summary: `${draft.title?.trim() ? `إرسال: ${draft.title.trim()}` : "إرسال إشعار جديد"} إلى ${targetLabel}`,
      channels: previewChannels,
    },
  };
}
