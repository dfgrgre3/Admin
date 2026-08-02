"use client";

import * as React from "react";
import { MainStatsCard } from "@/components/admin/dashboard/stats/main-stats-card";

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
  timeFilter,
  onTimeFilterChange,
}: StatsSectionProps) {
  return (
    <div className="space-y-8">
      <MainStatsCard
        stats={comprehensiveStats as React.ComponentProps<typeof MainStatsCard>["stats"]}
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
      />
    </div>
  );
});