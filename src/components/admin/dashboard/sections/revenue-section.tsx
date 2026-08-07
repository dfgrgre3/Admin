"use client";

import * as React from "react";
import { RevenueOverview } from "@/components/admin/dashboard/revenue/revenue-overview";
import type { DashboardRevenueData } from "@/lib/dashboard-payload-mapper";

interface RevenueSectionProps {
  revenue: DashboardRevenueData;
}

export const RevenueSection = React.memo(function RevenueSection({ revenue }: RevenueSectionProps) {
  return (
    <RevenueOverview
      dailyRevenue={revenue.dailyRevenue}
      monthlyRevenue={revenue.monthlyRevenue}
      yearlyRevenue={revenue.yearlyRevenue}
      pendingRevenue={revenue.pendingRevenue}
      dailyTrend={revenue.dailyTrend}
      monthlyTrend={revenue.monthlyTrend}
      yearlyTrend={revenue.yearlyTrend}
    />
  );
});
