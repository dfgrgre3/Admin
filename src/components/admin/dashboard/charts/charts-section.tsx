"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { TrendingUp, Zap, Activity, BarChart3, PieChart, LineChart } from "lucide-react";
import dynamic from "next/dynamic";

const CHART_SKELETON = (
  <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-[2rem] border border-white/10" />
);

const UserGrowthChart = dynamic(() => import("../user-growth-chart").then(mod => mod.UserGrowthChart), {
  ssr: false,
  loading: () => CHART_SKELETON
});

const ActivityChart = dynamic(() => import("../activity-chart").then(mod => mod.ActivityChart), {
  ssr: false,
  loading: () => CHART_SKELETON
});

const ActivityHeatmap = dynamic(() => import("../activity-heatmap").then(mod => mod.ActivityHeatmap), {
  ssr: false,
  loading: () => CHART_SKELETON
});

const DistributionChart = dynamic(() => import("../distribution-chart").then(mod => mod.DistributionChart), {
  ssr: false,
  loading: () => CHART_SKELETON
});

interface ChartsSectionProps {
  userGrowthData: Array<{ month: string; users: number }>;
  activityData: Array<{ day: string; sessions: number }>;
  heatmapData: Array<{ date: string; count: number }>;
  distributionData: Array<{ name: string; value: number; color: string }>;
}

export function ChartsSection({
  userGrowthData,
  activityData,
  heatmapData,
  distributionData
}: ChartsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Main Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AdminCard variant="glass" className="border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>نمو المنصة</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>شهري</span>
            </div>
          </div>
          <div className="h-[300px]">
            <UserGrowthChart data={userGrowthData} />
          </div>
        </AdminCard>

        <AdminCard variant="glass" className="border-amber-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>نشاط المستخدمين</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LineChart className="w-4 h-4" />
              <span>يومي</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ActivityChart data={activityData} />
          </div>
        </AdminCard>
      </div>

      {/* Heatmap and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AdminCard variant="glass" className="border-purple-500/20 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span>خريطة نشاط الطلاب</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>84 يوم</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ActivityHeatmap 
                data={heatmapData} 
                title="" 
                color="purple" 
                className="h-full"
              />
            </div>
          </AdminCard>
        </div>

        <div>
          <AdminCard variant="glass" className="border-blue-500/20 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                <span>توزيع المحتوى</span>
              </h3>
            </div>
            <div className="h-[300px]">
              <DistributionChart 
                data={distributionData} 
                title="" 
                description="" 
                className="h-full"
                height={260}
              />
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
