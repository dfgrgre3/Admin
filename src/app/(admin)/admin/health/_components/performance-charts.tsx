"use client";

import {
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { PerformanceMetrics } from "../_types/health";

interface PerformanceChartsProps {
  performance: PerformanceMetrics | undefined;
}

export function PerformanceCharts({ performance }: PerformanceChartsProps) {
  if (!performance) return null;

  return (
    <AdminCard variant="glass">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          تحليل الأداء الزمني
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          تحديث تلقائي
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Response Time Chart */}
        <PerformanceChartCard
          title="زمن الاستجابة"
          unit="ms"
          data={performance.responseTimeHistory || []}
          currentValue={performance.avgResponseTime}
          color="#3b82f6"
          gradientId="responseTimeGradient"
        />

        {/* Error Rate Chart */}
        <PerformanceChartCard
          title="معدل الأخطاء"
          unit="%"
          data={performance.errorRateHistory || []}
          currentValue={performance.errorRate * 100}
          color="#ef4444"
          gradientId="errorRateGradient"
          decimalPlaces={2}
        />

        {/* Requests Per Minute Chart */}
        <PerformanceChartCard
          title="الطلبات/دقيقة"
          unit="RPM"
          data={performance.requestsHistory || []}
          currentValue={performance.requestsPerMinute}
          color="#10b981"
          gradientId="requestsGradient"
        />
      </div>
    </AdminCard>
  );
}

interface PerformanceChartCardProps {
  title: string;
  unit: string;
  data: Array<{ time: string; value: number }>;
  currentValue: number;
  color: string;
  gradientId: string;
  decimalPlaces?: number;
}

function PerformanceChartCard({
  title,
  unit,
  data,
  currentValue,
  color,
  gradientId,
  decimalPlaces = 0,
}: PerformanceChartCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-muted-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={180} minWidth={1} minHeight={1}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
          <XAxis
            dataKey="time"
            className="text-[10px]"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <YAxis
            className="text-[10px]"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "8px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">المعدل الحالي</span>
        <span className="font-black" style={{ color }}>
          {currentValue.toFixed(decimalPlaces)}
        </span>
      </div>
    </div>
  );
}