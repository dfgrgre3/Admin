"use client";

import { Activity, Award, BookOpen } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { ActivityItem } from "./activity-types";

interface ActivityStatsProps {
  activities: ActivityItem[];
}

interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: typeof Activity;
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

export function ActivityStats({ activities }: ActivityStatsProps) {
  const studyCount = activities.filter((a) => a.type === "study").length;
  const examCount = activities.filter((a) => a.type === "exam").length;
  const achievementCount = activities.filter((a) => a.type === "achievement").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="إجمالي الأنشطة"
        value={activities.length}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
        Icon={Activity}
      />
      <StatCard
        label="جلسات دراسة"
        value={studyCount}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
        Icon={BookOpen}
      />
      <StatCard
        label="اختبارات"
        value={examCount}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-500"
        Icon={Activity}
      />
      <StatCard
        label="إنجازات"
        value={achievementCount}
        iconBg="bg-yellow-500/10"
        iconColor="text-yellow-500"
        Icon={Award}
      />
    </div>
  );
}