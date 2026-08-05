"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  BookOpen,
  FileText,
  Settings,
  Megaphone,
  Users,
  CreditCard,
  Zap,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";

const STYLES = {
  glass: "admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden",
};

const quickActionsConfig = [
  { title: "إضافة مستخدم", subtitle: "تسجيل حساب جديد", icon: UserPlus, href: "/admin/users?action=new", color: "blue" },
  { title: "مادة جديدة", subtitle: "بناء مسار تعليمي", icon: BookOpen, href: "/admin/subjects?action=new", color: "green" },
  { title: "إنشاء اختبار", subtitle: "بناء امتحان جديد", icon: FileText, href: "/admin/exams?action=new", color: "purple" },
  { title: "تحدي جديد", subtitle: "إطلاق تحدٍ للمستخدمين", icon: Zap, href: "/admin/challenges?action=new", color: "orange" },
  { title: "إعلان عام", subtitle: "رسالة لجميع المستخدمين", icon: Megaphone, href: "/admin/announcements?action=new", color: "rose" },
  { title: "كوبون خصم", subtitle: "إنشاء كود خصم جديد", icon: CreditCard, href: "/admin/coupons?action=new", color: "cyan" },
  { title: "إدارة المستخدمين", subtitle: "عرض وتصفية الحسابات", icon: Users, href: "/admin/users", color: "blue" },
  { title: "الإعدادات", subtitle: "إعدادات المنصة العامة", icon: Settings, href: "/admin/settings", color: "gray" },
] as const;

const quickActionColorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  purple: "bg-purple-500/10 text-purple-500",
  orange: "bg-orange-500/10 text-orange-500",
  gray: "bg-gray-500/10 text-gray-500",
  rose: "bg-rose-500/10 text-rose-500",
  cyan: "bg-cyan-500/10 text-cyan-500",
};

interface QuickActionsSectionProps {
  playSound: (sound: string) => void;
}

/**
 * QuickActionsSection — the grid of quick-action shortcut cards.
 */
export const QuickActionsSection = React.memo(function QuickActionsSection({
  playSound,
}: QuickActionsSectionProps) {
  return (
    <div className={STYLES.glass}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">الإجراءات السريعة</h3>
              <p className="text-sm text-gray-400">أهم العمليات اليومية بنقرة واحدة</p>
            </div>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
          >
            عرض كل الأقسام
            <ArrowLeft className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActionsConfig.map((action, i) => (
            <a
              key={i}
              href={action.href}
              onMouseEnter={() => playSound("hover")}
              onClick={() => playSound("click")}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <div className={cn("p-3 rounded-xl border border-white/5 group-hover:scale-110 transition-all", quickActionColorClasses[action.color] ?? quickActionColorClasses.blue)}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{action.title}</p>
                <p className="truncate text-[11px] text-gray-500">{action.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});
