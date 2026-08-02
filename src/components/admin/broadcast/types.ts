import { MessageSquareText, Book, Award, AlertCircle, BellRing, Wrench, RefreshCcw, Sparkles, type LucideIcon } from "lucide-react";

export type MessageType = "info" | "success" | "warning" | "error";

export interface MessageTemplate {
  id: string;
  label: string;
  title: string;
  message: string;
  type: MessageType;
  icon: LucideIcon;
  description: string;
  category?: string;
}

export const BROADCAST_TEMPLATES: MessageTemplate[] = [
  { 
    id: "custom", 
    label: "رسالة مخصصة", 
    title: "", 
    message: "", 
    type: "info",
    icon: MessageSquareText,
    description: "كتابة رسالة جديدة من الصفر"
  },
  { 
    id: "welcome", 
    label: "رسالة ترحيب", 
    title: "مرحباً بك في منصتنا التعليمية 👋", 
    message: "يسعدنا انضمامك إلينا. استعد لبدء رحلتك التعليمية وتطوير مهاراتك مع أفضل الخبراء!", 
    type: "info",
    icon: Sparkles,
    description: "رسالة ترحيبية للمستخدمين الجدد"
  },
  { 
    id: "warning_absence", 
    label: "تنبيه غياب", 
    title: "تنبيه: لقد افتقدناك مؤخراً ⚠️", 
    message: "لاحظنا عدم نشاطك على المنصة خلال الفترة الماضية. ندعوك للعودة ومواصلة دروسك لتحقيق أهدافك التعليمية.", 
    type: "warning",
    icon: Book,
    description: "تنبيه للمستخدمين غير النشطين"
  },
  { 
    id: "reward", 
    label: "إرسال مكافأة", 
    title: "مكافأة خاصة تقديراً لجهودك 🎁", 
    message: "تقديراً لتميزك في الدروس الأخيرة، تم إضافة مكافأة خاصة لحسابك. يمكنك الاطلاع عليها في صفحة المكافآت.", 
    type: "success",
    icon: Award,
    description: "إرسال حوافز ومكافآت للمتميزين"
  },
  { 
    id: "ban_threat", 
    label: "تحذير نهائي", 
    title: "تحذير نهائي بخصوص شروط الاستخدام 🚫", 
    message: "تم رصد نشاط يخالف سياسات الاستخدام الخاصة بالمنصة. يرجى الالتزام بالقواعد لتجنب إيقاف الحساب نهائياً.", 
    type: "error",
    icon: AlertCircle,
    description: "تنبيه رسمي بخصوص مخالفة السياسات"
  },
  // ── Additional notification-draft templates (shared with users hub) ──
  { 
    id: "update", 
    label: "تحديث مهم", 
    title: "تحديث مهم على المنصة 🚀", 
    message: "تم تحديث المنصة بميزات جديدة. تفضل بزيارة القسم المحدث للاطلاع على التفاصيل.", 
    type: "info",
    icon: RefreshCcw,
    description: "إشعار بتحديثات وميزات جديدة",
    category: "تحديث"
  },
  { 
    id: "reminder", 
    label: "تذكير مهم", 
    title: "تذكير مهم 📌", 
    message: "يرجى مراجعة المهام أو الدروس المتاحة لديك قبل الموعد المحدد.", 
    type: "warning",
    icon: BellRing,
    description: "تذكير بالمهام والدروس المستحقة",
    category: "تذكير"
  },
  { 
    id: "maintenance", 
    label: "صيانة مجدولة", 
    title: "صيانة مجدولة 🛠️", 
    message: "سيتم إجراء صيانة للمنصة خلال الفترة القادمة، يرجى مراعاة ذلك.", 
    type: "warning",
    icon: Wrench,
    description: "إشعار بصيانة مجدولة",
    category: "صيانة"
  },
];

export function getBroadcastTemplates(): MessageTemplate[] {
  return BROADCAST_TEMPLATES;
}

export interface UserModel {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  avatar?: string | null;
  level?: number;
  role?: string;
  lastLogin?: string | null;
}

export interface BroadcastFormData {
  title: string;
  message: string;
  type: MessageType;
  actionUrl: string;
  channels: {
    app: boolean;
    email: boolean;
    sms: boolean;
  };
}

// ── Send-result types shared across the broadcast flow ──
export interface BroadcastSendSummary {
  success?: number;
  sent?: number;
  failure?: number;
  failed?: number;
}

export interface BroadcastSendResult {
  summary?: BroadcastSendSummary;
  message?: string;
  error?: string;
}

// Physical delivery channels the backend understands.
export type BroadcastDeliveryChannel = "IN_APP" | "PUSH" | "EMAIL" | "SMS";

export const CHANNEL_LABELS: Record<BroadcastDeliveryChannel, string> = {
  IN_APP: "داخل التطبيق",
  PUSH: "Push",
  EMAIL: "البريد الإلكتروني",
  SMS: "رسالة نصية",
};

// Map the UI boolean channel object to backend channel identifiers.
export function resolveChannels(channels: BroadcastFormData["channels"]): BroadcastDeliveryChannel[] {
  const result: BroadcastDeliveryChannel[] = [];
  if (channels.app) result.push("IN_APP", "PUSH");
  if (channels.email) result.push("EMAIL");
  if (channels.sms) result.push("SMS");
  return result;
}