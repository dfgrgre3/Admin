"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";
import type { HeatmapPoint, DistributionPoint } from "@/lib/dashboard-utils";

const CHART_SKELETON = (
  <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-[2rem] border border-white/10" />
);

const ActivityHeatmap = dynamic(() => import("@/components/admin/dashboard/activity-heatmap").then(mod => mod.ActivityHeatmap), {
  ssr: false,
  loading: () => CHART_SKELETON,
});
const DistributionChart = dynamic(() => import("@/components/admin/dashboard/distribution-chart").then(mod => mod.DistributionChart), {
  ssr: false,
  loading: () => CHART_SKELETON,
});

interface ActivityDistributionSectionProps {
  heatmapData: HeatmapPoint[];
  distributionData: DistributionPoint[];
}

/**
 * ActivityDistributionSection — activity heatmap + content distribution chart.
 *
 * Extracted from the God Component. Both chart components are dynamically
 * imported so their heavy charting libraries are code-split.
 */
export const ActivityDistributionSection = React.memo(function ActivityDistributionSection({
  heatmapData,
  distributionData,
}: ActivityDistributionSectionProps) {
  return (
    <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل الرسوم البيانية</div>}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActivityHeatmap
            data={heatmapData}
            title="خريطة دراسة ونشاط الطلاب"
            color="purple"
            className="h-full"
          />
        </div>
        <div>
          <DistributionChart
            data={distributionData}
            title="توزيع المحتوى التعليمي"
            description="عرض لنسب تصنيف المحتوى الدراسي"
            className="h-full"
            height={260}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
});