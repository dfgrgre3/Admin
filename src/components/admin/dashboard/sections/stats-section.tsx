"use client";

import * as React from "react";
import { ComprehensiveStats } from "@/components/admin/dashboard/comprehensive-stats";
import { QuickStatsRow } from "@/components/admin/dashboard/enhanced-stats-cards";
import { Clock, Target, Award, FileText } from "lucide-react";

interface StatsSectionProps {
  comprehensiveStats: ReturnType<typeof import("@/lib/dashboard-data").buildComprehensiveStats>;
  activity: {
    studyMinutes: number;
    tasksCompleted: number;
    achievementsEarned: number;
    examsTaken: number;
  };
  timeFilter: string;
  onTimeFilterChange: (filter: "today" | "week" | "month" | "year") => void;
  onExport: () => void;
}

/**
 * StatsSection — combines the comprehensive stats grid with the quick stats row.
 *
 * Extracted from the God Component so it only re-renders when its own props
 * change, not when unrelated dashboard state updates.
 */
export const StatsSection = React.memo(function StatsSection({
  comprehensiveStats,
  activity,
  timeFilter,
  onTimeFilterChange,
  onExport,
}: StatsSectionProps) {
  return (
    <div className="space-y-8">
      <ComprehensiveStats
        stats={comprehensiveStats}
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
        onExport={onExport}
      />

      <QuickStatsRow
        stats={[
          { label: "ساعة دراسة مجمعة", value: Math.round(activity.studyMinutes / 60), icon: Clock, color: "blue" },
          { label: "مهمة مكتملة", value: activity.tasksCompleted, icon: Target, color: "green" },
          { label: "إنجاز تعليمي", value: activity.achievementsEarned, icon: Award, color: "yellow" },
          { label: "اختبار تم أداؤه", value: activity.examsTaken, icon: FileText, color: "purple" },
        ]}
      />
    </div>
  );
});