"use client";

import { Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { Course } from "./course-types";

interface CourseStatsProps {
  courses: Course[];
}

interface StatCardProps {
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
  Icon: typeof BookOpen;
}

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </AdminCard>
  );
}

export function CourseStats({ courses }: CourseStatsProps) {
  const completed = courses.filter((c) => c.status === "COMPLETED").length;
  const inProgress = courses.filter((c) => c.status === "IN_PROGRESS").length;
  const avgProgress =
    courses.length > 0
      ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="إجمالي الكورسات"
        value={courses.length}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
        Icon={BookOpen}
      />
      <StatCard
        label="مكتملة"
        value={completed}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
        Icon={Award}
      />
      <StatCard
        label="قيد التقدم"
        value={inProgress}
        iconBg="bg-yellow-500/10"
        iconColor="text-yellow-500"
        Icon={Clock}
      />
      <StatCard
        label="متوسط التقدم"
        value={`${avgProgress}%`}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-500"
        Icon={TrendingUp}
      />
    </div>
  );
}