"use client";

import * as React from "react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Users, UserPlus, BookOpen, FileText, Clock, Target, Award, Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainStatsCardProps {
  stats: {
    totalUsers: number;
    activeStudents: number;
    totalTeachers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    totalSubjects: number;
    publishedCourses: number;
    reviewCourses: number;
    draftCourses: number;
    totalExams: number;
    totalResources: number;
    activeChallenges: number;
    completedTasks: number;
    studyMinutes: number;
    examsTaken: number;
    achievementsEarned: number;
    completionRate: number;
    dailyRevenue: number;
    monthlyRevenue: number;
    newSubscriptions: number;
    cancelledSubscriptions: number;
    pendingOrders: number;
    openTickets: number;
    moderationQueue: number;
    pendingApprovals: number;
  };
  timeFilter: string;
  onTimeFilterChange?: (filter: "today" | "week" | "month" | "year") => void;
}

export function MainStatsCard({ stats, timeFilter, onTimeFilterChange }: MainStatsCardProps) {
  const userStats = [
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "blue" as const,
      description: `${stats.newUsersToday} مستخدم جديد اليوم`,
      trend: { value: stats.newUsersThisWeek, isPositive: stats.newUsersThisWeek > 0 }
    },
    {
      title: "الطلاب النشطين",
      value: stats.activeStudents.toLocaleString(),
      icon: Activity,
      color: "green" as const,
      description: "مستخدم نشط هذا الأسبوع",
    },
    {
      title: "المعلمين",
      value: stats.totalTeachers.toLocaleString(),
      icon: UserPlus,
      color: "purple" as const,
      description: "معلم مسجل",
    },
    {
      title: "معدل النمو",
      value: `${stats.newUsersThisWeek > 0 ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: "yellow" as const,
      description: "نمو أسبوعي",
    },
  ];

  const contentStats = [
    {
      title: "المواد الدراسية",
      value: stats.totalSubjects.toLocaleString(),
      icon: BookOpen,
      color: "green" as const,
      description: `${stats.publishedCourses} منشورة • ${stats.draftCourses} مسودة`,
    },
    {
      title: "الامتحانات",
      value: stats.totalExams.toLocaleString(),
      icon: FileText,
      color: "purple" as const,
      description: `${stats.examsTaken} تم أداؤها`,
    },
    {
      title: "المصادر التعليمية",
      value: stats.totalResources.toLocaleString(),
      icon: BookOpen,
      color: "blue" as const,
      description: "مصدر متاح",
    },
    {
      title: "التحديات النشطة",
      value: stats.activeChallenges.toLocaleString(),
      icon: Target,
      color: "amber" as const,
      description: `${stats.completedTasks} مكتملة`,
    },
  ];

  const engagementStats = [
    {
      title: "ساعات الدراسة",
      value: Math.round(stats.studyMinutes / 60).toLocaleString(),
      icon: Clock,
      color: "blue" as const,
      description: "دقيقة دراسة مجمعة",
    },
    {
      title: "المهام المكتملة",
      value: stats.completedTasks.toLocaleString(),
      icon: Target,
      color: "green" as const,
      description: "مهمة تم إنجازها",
    },
    {
      title: "الإنجازات",
      value: stats.achievementsEarned.toLocaleString(),
      icon: Award,
      color: "yellow" as const,
      description: "وسيمة تم كسبها",
    },
    {
      title: "معدل الإكمال",
      value: `${stats.completionRate}%`,
      icon: Activity,
      color: "purple" as const,
      description: "نسبة إكمال المحتوى",
    },
  ];

  const revenueStats = [
    {
      title: "إيرادات اليوم",
      value: stats.dailyRevenue.toLocaleString(),
      icon: TrendingUp,
      color: "green" as const,
      description: "ج.م",
    },
    {
      title: "إيرادات الشهر",
      value: stats.monthlyRevenue.toLocaleString(),
      icon: TrendingUp,
      color: "blue" as const,
      description: "ج.م",
    },
    {
      title: "اشتراكات جديدة",
      value: stats.newSubscriptions.toLocaleString(),
      icon: Users,
      color: "purple" as const,
      description: `${stats.cancelledSubscriptions} ملغاة`,
    },
    {
      title: "طلبات معلقة",
      value: stats.pendingOrders.toLocaleString(),
      icon: FileText,
      color: "amber" as const,
      description: "بانتظار المعالجة",
    },
  ];

  const supportStats = [
    {
      title: "تذاكر مفتوحة",
      value: stats.openTickets.toLocaleString(),
      icon: FileText,
      color: "red" as const,
      description: "تذكرة دعم فني",
    },
    {
      title: "قائمة المراجعة",
      value: stats.moderationQueue.toLocaleString(),
      icon: Target,
      color: "amber" as const,
      description: "محتوى بانتظار المراجعة",
    },
    {
      title: "الموافقات المعلقة",
      value: stats.pendingApprovals.toLocaleString(),
      icon: Award,
      color: "yellow" as const,
      description: "طلب بانتظار الموافقة",
    },
  ];

  return (
    <div className="space-y-8">
      {/* User Statistics */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          إحصائيات المستخدمين
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <AdminStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
              trend={stat.trend}
            />
          ))}
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          إحصائيات المحتوى
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentStats.map((stat, index) => (
            <AdminStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>
      </div>

      {/* Engagement Statistics */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          إحصائيات التفاعل
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {engagementStats.map((stat, index) => (
            <AdminStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>
      </div>

      {/* Revenue Statistics */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          الإحصائيات المالية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueStats.map((stat, index) => (
            <AdminStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>
      </div>

      {/* Support Statistics */}
      <div>
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          إحصائيات الدعم والمراجعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportStats.map((stat, index) => (
            <AdminStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
