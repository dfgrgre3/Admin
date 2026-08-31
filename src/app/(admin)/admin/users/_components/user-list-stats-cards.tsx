"use client";

import * as React from "react";
import {
  BadgeCheck,
  Ban,
  BookOpen,
  Calendar,
  GraduationCap,
  Shield,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import type { AdminUsersPage as AdminUsersPageData } from "@/lib/api/admin-users-api";

interface UserListStatsCardsProps {
  summary: AdminUsersPageData["summary"] | undefined;
}

export function UserListStatsCards({ summary }: UserListStatsCardsProps) {
  const summaryCards: Array<{ title: string; value: number; icon: React.ElementType; color: "blue" | "green" | "yellow" | "red" | "fuchsia" | "purple" | "amber" | "slate" | "default"; description: string }> = [
    { title: "إجمالي المستخدمين", value: summary?.totalUsers || 0, icon: Users, color: "blue", description: "مستخدم في المنصة" },
    { title: "الطلاب", value: summary?.totalStudents || 0, icon: GraduationCap, color: "fuchsia", description: "حساب طالب" },
    { title: "المعلمون", value: summary?.totalTeachers || 0, icon: BookOpen, color: "purple", description: "حساب معلم" },
    { title: "المشرفون", value: summary?.totalModerators || 0, icon: ShieldCheck, color: "amber", description: "حساب مشرف" },
    { title: "المدراء", value: summary?.totalAdmins || 0, icon: Shield, color: "yellow", description: "حساب إداري" },
    { title: "موثقون", value: summary?.verified || 0, icon: BadgeCheck, color: "green", description: "بريد موثق" },
    { title: "غير موثقين", value: summary?.notVerified || 0, icon: UserX, color: "slate", description: "بانتظار التحقق" },
    { title: "نشطون", value: summary?.active || 0, icon: UserCheck, color: "green", description: "حساب نشط" },
    { title: "موقوفون", value: summary?.suspended || 0, icon: Ban, color: "yellow", description: "حساب موقوف" },
    { title: "محظورون", value: summary?.blocked || 0, icon: ShieldX, color: "red", description: "حساب محظور" },
    { title: "محذوفون", value: summary?.deleted || 0, icon: Trash2, color: "slate", description: "حساب محذوف" },
    { title: "جدد اليوم", value: summary?.newToday || 0, icon: Sparkles, color: "blue", description: "اليوم" },
    { title: "جدد هذا الأسبوع", value: summary?.newThisWeek || 0, icon: Calendar, color: "purple", description: "آخر 7 أيام" },
    { title: "جدد هذا الشهر", value: summary?.newThisMonth || 0, icon: Calendar, color: "fuchsia", description: "آخر 30 يوم" },
    { title: "متصلون الآن", value: summary?.onlineNow || 0, icon: Zap, color: "green", description: "نشاط الآن" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {summaryCards.map((card) => (
        <AdminStatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          description={card.description}
          className="hover:scale-[1.02] transition-transform duration-300 shadow-sm hover:shadow-md"
        />
      ))}
    </div>
  );
}
