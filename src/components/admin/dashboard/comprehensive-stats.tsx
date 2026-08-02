"use client";

import * as React from "react";
import { cn, formatNumber, formatCurrency } from "@/lib/utils";
import { dashboardColorConfig, type DashboardColor } from "@/lib/constants/colors";
import { AdminCard } from "../ui/admin-card";
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Clock,
  Award,
  FileText,
  DollarSign,
  UserPlus,
  UserMinus,
  ShoppingCart,
  Ticket,
  Flag,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  Download,
  Calendar,
  BarChart3,
} from "lucide-react";

interface StatItem {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: DashboardColor;
  onClick?: () => void;
}

export type StatColor = DashboardColor;

interface ComprehensiveStatsProps {
  stats: {
    // Users
    totalUsers?: number;
    activeStudents?: number;
    totalTeachers?: number;
    newUsersToday?: number;
    newUsersThisWeek?: number;
    
    // Courses
    totalSubjects?: number;
    publishedCourses?: number;
    reviewCourses?: number;
    draftCourses?: number;
    
    // Exams & Resources
    totalExams?: number;
    totalResources?: number;
    
    // Engagement
    activeChallenges?: number;
    completedTasks?: number;
    studyMinutes?: number;
    examsTaken?: number;
    achievementsEarned?: number;
    completionRate?: number;
    
    // Revenue
    dailyRevenue?: number;
    monthlyRevenue?: number;
    
    // Subscriptions
    newSubscriptions?: number;
    cancelledSubscriptions?: number;
    
    // Operations
    pendingOrders?: number;
    openTickets?: number;
    moderationQueue?: number;
    pendingApprovals?: number;
    
    // Top Courses
    topSellingCourses?: Array<{
      id: string;
      title: string;
      sales: number;
      revenue: number;
    }>;
    
    // KPIs
    criticalKPIs?: Array<{
      name: string;
      value: number;
      target: number;
      unit: string;
    }>;
    
    // Alerts
    systemAlerts?: Array<{
      id: string;
      type: string;
      message: string;
      severity: string;
      createdAt: string;
    }>;
  };
  timeFilter: string;
  onTimeFilterChange: (filter: "today" | "week" | "month" | "year") => void;
  onExport: () => void;
  className?: string;
}

export function ComprehensiveStats({
  stats,
  timeFilter,
  onTimeFilterChange,
  onExport,
  className,
}: ComprehensiveStatsProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const statCards: StatItem[] = [
    // Users Section
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers || 0,
      description: `${stats.newUsersToday || 0} مستخدم جديد اليوم`,
      icon: Users,
      color: "blue",
      trend: {
        value: Math.abs(stats.newUsersThisWeek || 0),
        isPositive: (stats.newUsersThisWeek || 0) >= 0,
      },
    },
    {
      title: "الطلاب النشطون",
      value: stats.activeStudents || 0,
      description: "طالب مسجل حالياً",
      icon: GraduationCap,
      color: "green",
    },
    {
      title: "المدرّسون",
      value: stats.totalTeachers || 0,
      description: "مدرس معتمد",
      icon: Users,
      color: "purple",
    },
    
    // Courses Section
    {
      title: "الكورسات المنشورة",
      value: stats.publishedCourses || 0,
      description: `منشور من أصل ${stats.totalSubjects || 0}`,
      icon: BookOpen,
      color: "green",
    },
    {
      title: "قيد المراجعة",
      value: stats.reviewCourses || 0,
      description: "بانتظار الموافقة",
      icon: ClipboardList,
      color: "yellow",
    },
    {
      title: "المسودات",
      value: stats.draftCourses || 0,
      description: "لم يتم نشرها",
      icon: FileText,
      color: "zinc",
    },
    
    // Exams & Resources
    {
      title: "الامتحانات",
      value: stats.totalExams || 0,
      description: `${stats.examsTaken || 0} محاولة اختبار`,
      icon: Target,
      color: "purple",
    },
    {
      title: "المصادر التعليمية",
      value: stats.totalResources || 0,
      description: "مادة تعليمية",
      icon: BookOpen,
      color: "cyan",
    },
    
    // Engagement
    {
      title: "المهام النشطة",
      value: stats.activeChallenges || 0,
      description: "تحدي قيد التنفيذ",
      icon: ClipboardList,
      color: "orange",
    },
    {
      title: "معدل الإكمال",
      value: `${Math.round(stats.completionRate || 0)}%`,
      description: "نسبة إكمال الدورات",
      icon: Target,
      color: "green",
      trend: {
        value: Math.round(stats.completionRate || 0),
        isPositive: (stats.completionRate || 0) >= 80,
      },
    },
    
    // Revenue
    {
      title: "الإيرادات اليومية",
      value: formatCurrency(stats.dailyRevenue || 0),
      description: "أجمالي اليوم",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "الإيرادات الشهرية",
      value: formatCurrency(stats.monthlyRevenue || 0),
      description: "إجمالي الشهر",
      icon: TrendingUp,
      color: "blue",
    },
    
    // Subscriptions
    {
      title: "اشتراكات جديدة",
      value: stats.newSubscriptions || 0,
      description: "هذه الفترة",
      icon: UserPlus,
      color: "green",
    },
    {
      title: "اشتراكات ملغاة",
      value: stats.cancelledSubscriptions || 0,
      description: "هذه الفترة",
      icon: UserMinus,
      color: "red",
    },
    
    // Operations
    {
      title: "طلبات معلقة",
      value: stats.pendingOrders || 0,
      description: "بانتظار المعالجة",
      icon: ShoppingCart,
      color: "yellow",
    },
    {
      title: "تذاكر مفتوحة",
      value: stats.openTickets || 0,
      description: "تحتاج متابعة",
      icon: Ticket,
      color: "orange",
    },
    {
      title: "البلاغات",
      value: stats.moderationQueue || 0,
      description: "قيد المراجعة",
      icon: Flag,
      color: "red",
    },
    {
      title: "مهام تحتاج موافقة",
      value: stats.pendingApprovals || 0,
      description: "بانتظار القرار",
      icon: CheckCircle,
      color: "purple",
    },
  ];

  const timeFilters = [
    { id: "today", label: "اليوم", icon: Calendar },
    { id: "week", label: "أسبوع", icon: Calendar },
    { id: "month", label: "شهر", icon: Calendar },
    { id: "year", label: "سنة", icon: Calendar },
  ] as const;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with filters and export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <span>لوحة المعلومات الرئيسية</span>
          </h2>
          <p className="text-gray-400 font-medium mt-1">
            نظرة شاملة على أداء المنصة
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filters */}
          <div className="flex items-center gap-2 bg-card/50 p-1.5 rounded-xl border border-border">
            {timeFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => onTimeFilterChange(filter.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    timeFilter === filter.id
                      ? "bg-primary text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 inline-block ml-1" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-card/50 hover:bg-card border border-border rounded-xl text-sm font-bold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const config = dashboardColorConfig[stat.color || "blue"];
          const Icon = stat.icon;

          return (
            <AdminCard
              key={index}
              variant="glass"
              interactive={true}
              onClick={stat.onClick}
              className={cn(
                "relative overflow-hidden group border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-500",
                "hover:-translate-y-1 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
                stat.onClick && "cursor-pointer"
              )}
            >
              {/* Background glow */}
              <div
                className={cn(
                  "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-transform duration-700 ease-out group-hover:scale-150",
                  config.text.includes("blue") && "bg-blue-500",
                  config.text.includes("green") && "bg-emerald-500",
                  config.text.includes("yellow") && "bg-amber-500",
                  config.text.includes("red") && "bg-red-500",
                  config.text.includes("purple") && "bg-purple-500",
                  config.text.includes("cyan") && "bg-cyan-500",
                  config.text.includes("orange") && "bg-orange-500",
                  config.text.includes("pink") && "bg-pink-500",
                  config.text.includes("zinc") && "bg-zinc-500"
                )}
              />

              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className={cn("text-3xl font-black font-mono tracking-tight", config.text)}>
                        {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
                      </p>
                    </div>
                  </div>

                  {Icon && (
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 shadow-lg transition-all duration-300",
                        "group-hover:scale-110 group-hover:rotate-6",
                        config.bg
                      )}
                    >
                      <Icon className={cn("h-6 w-6", config.text)} />
                    </div>
                  )}
                </div>

                {/* Trend and description */}
                <div className="flex items-center gap-2 flex-wrap">
                  {stat.trend && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border transition-colors duration-300",
                        stat.trend.isPositive
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : stat.trend.value === 0
                          ? "bg-muted/50 text-muted-foreground border-white/5"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}
                    >
                      {stat.trend.value === 0 ? (
                        <span>—</span>
                      ) : stat.trend.isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3 rotate-180" />
                      )}
                      {Math.abs(stat.trend.value)}%
                    </span>
                  )}
                  {stat.description && (
                    <span className="text-[11px] font-bold text-muted-foreground/80">
                      {stat.description}
                    </span>
                  )}
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* Top Selling Courses */}
      {stats.topSellingCourses && stats.topSellingCourses.length > 0 && (
        <AdminCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-black">أعلى الكورسات مبيعاً</h3>
          </div>
          <div className="space-y-3">
            {stats.topSellingCourses.map((course, index) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(course.sales)} مبيعة
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-black text-primary text-lg">
                    {formatCurrency(course.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      {/* Critical KPIs */}
      {stats.criticalKPIs && stats.criticalKPIs.length > 0 && (
        <AdminCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-black">مؤشرات الأداء الحرجة</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.criticalKPIs.map((kpi, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-muted-foreground">
                    {kpi.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    الهدف: {kpi.target}{kpi.unit}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-black text-primary">
                    {typeof kpi.value === "number" ? kpi.value.toFixed(1) : kpi.value}
                    {kpi.unit}
                  </p>
                  {kpi.value >= kpi.target ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mb-1" />
                  )}
                </div>
                <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      kpi.value >= kpi.target ? "bg-green-500" : "bg-yellow-500"
                    )}
                    style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      {/* System Alerts */}
      {stats.systemAlerts && stats.systemAlerts.length > 0 && (
        <AdminCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-black">تنبيهات النظام</h3>
          </div>
          <div className="space-y-3">
            {stats.systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border",
                  alert.severity === "CRITICAL" && "bg-red-500/10 border-red-500/20",
                  alert.severity === "WARNING" && "bg-yellow-500/10 border-yellow-500/20",
                  alert.severity === "INFO" && "bg-blue-500/10 border-blue-500/20"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    alert.severity === "CRITICAL" && "bg-red-500/20",
                    alert.severity === "WARNING" && "bg-yellow-500/20",
                    alert.severity === "INFO" && "bg-blue-500/20"
                  )}
                >
                  {alert.severity === "CRITICAL" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {alert.severity === "WARNING" && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {alert.severity === "INFO" && (
                    <Bell className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.createdAt).toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}