import type {
  PlanFilterInterval,
  PlanFormValues,
  PlanInterval,
  PlanStatusFilter,
} from "./types";

// التسميات العربية للمدد الزمنية
export const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: "شهري",
  YEARLY: "سنوي",
  FOREVER: "مدى الحياة",
};

// ألوان شارات المدد في الجدول
export const INTERVAL_COLORS: Record<string, string> = {
  MONTHLY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  YEARLY: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  FOREVER: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

// ألوان النقاط في توزيع المدد
export const INTERVAL_DOT_COLORS: Record<string, string> = {
  MONTHLY: "bg-blue-500",
  YEARLY: "bg-purple-500",
  FOREVER: "bg-amber-500",
};

// أيقونات المدد
export const INTERVAL_ICON_COLORS: Record<string, string> = {
  MONTHLY: "text-blue-500",
  YEARLY: "text-purple-500",
  FOREVER: "text-amber-500",
};

// قيم النموذج الافتراضية
export const DEFAULT_FORM_VALUES: PlanFormValues = {
  name: "",
  nameAr: "",
  description: "",
  price: 0,
  currency: "EGP",
  interval: "MONTHLY",
  isActive: true,
  features: "",
  groupKey: "",
};

// عملات مقترحة عند الإدخال
export const CURRENCY_OPTIONS = ["EGP", "SAR", "AED", "USD"];

// خيارات فلترة الحالة
export const STATUS_FILTER_OPTIONS: { value: PlanStatusFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "active", label: "مفعّلة" },
  { value: "inactive", label: "معطّلة" },
];

// خيارات فلترة المدة
export const INTERVAL_FILTER_OPTIONS: { value: PlanFilterInterval; label: string }[] = [
  { value: "all", label: "كل المدد" },
  { value: "MONTHLY", label: "شهري" },
  { value: "YEARLY", label: "سنوي" },
  { value: "FOREVER", label: "مدى الحياة" },
];

// ترتيب المدد في التوزيع
export const INTERVAL_ORDER: PlanInterval[] = ["MONTHLY", "YEARLY", "FOREVER"];

// تسميات أعمدة الجدول لقائمة "الأعمدة"
export const PLAN_COLUMN_LABELS: Record<string, string> = {
  nameAr: "الخطة",
  price: "السعر",
  interval: "المدة",
  groupKey: "المجموعة",
  features: "المميزات",
  isActive: "الحالة",
  createdAt: "تاريخ الإنشاء",
  actions: "التحكم",
};
