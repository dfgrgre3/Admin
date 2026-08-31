"use client";

import {
  Activity,
  AlertTriangle,
  Ban,
  BookOpen,
  CheckCircle,
  CreditCard,
  Download,
  Eye,
  FileText,
  Lock,
  LogIn,
  LogOut,
  Shield,
  Ticket,
  Trophy,
  UserCheck,
  UserX,
} from "lucide-react";

export type EventCategory = "security" | "academic" | "financial" | "admin" | "system";

export interface EventConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  category: EventCategory;
}

export const eventConfig: Record<string, EventConfig> = {
  login:              { label: "تسجيل دخول",                 icon: LogIn,         color: "text-blue-500",   bg: "bg-blue-500/10",   category: "security" },
  logout:             { label: "تسجيل خروج",                 icon: LogOut,        color: "text-slate-500",  bg: "bg-slate-500/10",  category: "security" },
  failed_login:       { label: "محاولة دخول فاشلة",          icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-500/10",    category: "security" },
  password_changed:   { label: "تغيير كلمة المرور",          icon: Lock,          color: "text-purple-500", bg: "bg-purple-500/10", category: "security" },
  password_reset:     { label: "إعادة تعيين كلمة المرور",    icon: Lock,          color: "text-purple-500", bg: "bg-purple-500/10", category: "security" },
  email_changed:      { label: "تغيير البريد",                icon: Shield,        color: "text-cyan-500",   bg: "bg-cyan-500/10",   category: "security" },
  phone_changed:      { label: "تغيير الهاتف",                icon: Shield,        color: "text-cyan-500",   bg: "bg-cyan-500/10",   category: "security" },
  "2fa_enabled":      { label: "تفعيل التحقق الثنائي",       icon: Shield,        color: "text-green-500",  bg: "bg-green-500/10",  category: "security" },
  "2fa_disabled":     { label: "إلغاء التحقق الثنائي",        icon: Shield,        color: "text-red-500",    bg: "bg-red-500/10",    category: "security" },
  profile_updated:    { label: "تحديث الملف الشخصي",         icon: UserCheck,     color: "text-indigo-500", bg: "bg-indigo-500/10", category: "system" },
  role_changed:       { label: "تغيير الدور",                 icon: Shield,        color: "text-amber-500",  bg: "bg-amber-500/10",  category: "admin" },
  status_changed:     { label: "تغيير الحالة",                icon: Activity,      color: "text-orange-500", bg: "bg-orange-500/10", category: "admin" },
  banned:             { label: "حظر الحساب",                  icon: Ban,           color: "text-red-600",    bg: "bg-red-600/10",    category: "admin" },
  unbanned:           { label: "رفع الحظر",                   icon: UserCheck,     color: "text-green-600",  bg: "bg-green-600/10",  category: "admin" },
  suspended:          { label: "إيقاف مؤقت",                  icon: UserX,         color: "text-amber-600",  bg: "bg-amber-600/10",  category: "admin" },
  reactivated:        { label: "إعادة تفعيل",                 icon: UserCheck,     color: "text-green-500",  bg: "bg-green-500/10",  category: "admin" },
  enrolled:           { label: "تسجيل في دورة",               icon: BookOpen,      color: "text-violet-500", bg: "bg-violet-500/10", category: "academic" },
  unenrolled:         { label: "إلغاء تسجيل",                 icon: BookOpen,      color: "text-red-400",    bg: "bg-red-400/10",    category: "academic" },
  lesson_completed:   { label: "إتمام درس",                   icon: CheckCircle,   color: "text-emerald-500",bg: "bg-emerald-500/10",category: "academic" },
  course_completed:   { label: "إتمام دورة",                  icon: Trophy,        color: "text-yellow-500", bg: "bg-yellow-500/10", category: "academic" },
  certificate_issued: { label: "إصدار شهادة",                 icon: Trophy,        color: "text-amber-500",  bg: "bg-amber-500/10",  category: "academic" },
  order_created:      { label: "طلب جديد",                    icon: CreditCard,    color: "text-green-500",  bg: "bg-green-500/10",  category: "financial" },
  payment_succeeded:  { label: "دفع ناجح",                    icon: CreditCard,    color: "text-green-600",  bg: "bg-green-600/10",  category: "financial" },
  payment_failed:     { label: "فشل الدفع",                   icon: CreditCard,    color: "text-red-500",    bg: "bg-red-500/10",    category: "financial" },
  refund_issued:      { label: "استرداد مبلغ",                icon: CreditCard,    color: "text-purple-500", bg: "bg-purple-500/10", category: "financial" },
  ticket_created:     { label: "فتح تذكرة دعم",               icon: Ticket,        color: "text-sky-500",    bg: "bg-sky-500/10",    category: "system" },
  note_added:         { label: "إضافة ملاحظة إدارية",        icon: FileText,      color: "text-slate-500",  bg: "bg-slate-500/10",  category: "admin" },
  impersonated:       { label: "تبديل الهوية",                icon: Eye,           color: "text-red-500",    bg: "bg-red-500/10",    category: "admin" },
  data_export:        { label: "تصدير بيانات",                icon: Download,      color: "text-gray-500",   bg: "bg-gray-500/10",   category: "system" },
};

export const getEventConfig = (type: string): EventConfig =>
  eventConfig[type] ?? {
    label: type,
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted",
    category: "system",
  };

export const categoryLabels: Record<string, string> = {
  all: "كل الأحداث",
  security: "الأمان",
  academic: "أكاديمي",
  financial: "مالي",
  admin: "إداري",
  system: "النظام",
};