"use client";

import type { UserDetails } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Zap, BookOpen, Crown, Clock, CheckCircle, Trophy, TrendingUp } from "lucide-react";

export function UserStatsGrid({ user }: { user: UserDetails }) {
  const totalStudyHours = Math.floor((user.totalStudyTime ?? 0) / 60);
  const totalStudyMins = (user.totalStudyTime ?? 0) % 60;

  const stats = [
    {
      label: "إجمالي الخبرة",
      value: (user.totalXP ?? 0).toLocaleString(),
      unit: "XP",
      icon: Flame,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/10",
      gradient: "from-amber-500/20 to-transparent",
      sub: `المستوى ${user.level ?? 1}`,
    },
    {
      label: "التتابع الحالي",
      value: user.currentStreak ?? 0,
      unit: "يوم",
      icon: Zap,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/10",
      gradient: "from-orange-500/20 to-transparent",
      sub: `أطول: ${user.longestStreak ?? 0} يوم`,
    },
    {
      label: "ساعات المذاكرة",
      value: totalStudyHours,
      unit: totalStudyMins > 0 ? `سا ${totalStudyMins} د` : "ساعة",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/10",
      gradient: "from-blue-500/20 to-transparent",
      sub: `${user._count?.studySessions ?? 0} جلسة مذاكرة`,
    },
    {
      label: "الاختبارات المجتازة",
      value: user.examsPassed ?? 0,
      unit: "اختبار",
      icon: Trophy,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      glow: "shadow-purple-500/10",
      gradient: "from-purple-500/20 to-transparent",
      sub: `من ${user._count?.examResults ?? 0} إجمالي`,
    },
    {
      label: "المهام المنجزة",
      value: user.tasksCompleted ?? 0,
      unit: "مهمة",
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      glow: "shadow-green-500/10",
      gradient: "from-green-500/20 to-transparent",
      sub: `من ${user._count?.tasks ?? 0} إجمالي`,
    },
    {
      label: "الإنجازات المحققة",
      value: user._count?.achievements ?? 0,
      unit: "إنجاز",
      icon: Crown,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      glow: "shadow-yellow-500/10",
      gradient: "from-yellow-500/20 to-transparent",
      sub: `${user.achievements?.slice(0, 1)[0]?.achievement?.title ?? "لا يوجد بعد"}`,
    },
    {
      label: "التسجيلات الدراسية",
      value: user._count?.subjectEnrollments ?? 0,
      unit: "مادة",
      icon: BookOpen,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
      gradient: "from-cyan-500/20 to-transparent",
      sub: `${user.interestedSubjects?.length ?? 0} مادة مهتم بها`,
    },
    {
      label: "جلسات بومودورو",
      value: user.pomodoroSessions ?? 0,
      unit: "جلسة",
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "shadow-rose-500/10",
      gradient: "from-rose-500/20 to-transparent",
      sub: `${user.deepWorkSessions ?? 0} جلسة عمل عميق`,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className={`border shadow-lg ${stat.glow} shadow-lg bg-card/60 backdrop-blur-md overflow-hidden relative group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ${stat.border}`}
        >
          <CardContent className="p-5">
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-30 pointer-events-none`}
            />

            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md relative`}>
              <stat.icon className="h-5 w-5" />
            </div>

            <div className="relative">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <h3 className="text-2xl font-black tracking-tight tabular-nums leading-none">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>
                  {stat.unit}
                </span>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 leading-tight">
                {stat.label}
              </p>
              {stat.sub && (
                <p className="text-[9px] text-muted-foreground/70 mt-1 truncate" title={stat.sub}>
                  {stat.sub}
                </p>
              )}
            </div>
          </CardContent>
          <div
            className={`absolute bottom-0 left-0 h-0.5 w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right ${stat.bg.replace("/10", "")} opacity-60`}
          />
        </Card>
      ))}
    </div>
  );
}
