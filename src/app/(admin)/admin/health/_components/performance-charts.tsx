"use client";

import { BarChart3, ChartNoAxesCombined } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { PerformanceMetrics } from "../_types/health";

interface PerformanceChartsProps {
  performance: PerformanceMetrics | undefined;
  autoRefresh: boolean;
}

type HistoryPoint = { time: string; value: number };

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("ar-EG", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export function PerformanceCharts({ performance, autoRefresh }: PerformanceChartsProps) {
  if (!performance) return null;

  const errorHistory = (performance.errorRateHistory ?? []).map((point) => ({
    ...point,
    value: point.value * 100,
  }));

  return (
    <AdminCard variant="glass">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xl font-black">
          <BarChart3 className="h-5 w-5 text-primary" />
          تحليل الأداء الزمني
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${autoRefresh ? "animate-pulse bg-emerald-500" : "bg-muted-foreground"}`} />
          {autoRefresh ? "التحديث التلقائي مفعّل" : "التحديث التلقائي متوقف"}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <PerformanceChartCard title="زمن الاستجابة" unit="ms" data={performance.responseTimeHistory ?? []} color="#3b82f6" gradientId="responseTimeGradient" />
        <PerformanceChartCard title="معدل الأخطاء" unit="%" data={errorHistory} color="#ef4444" gradientId="errorRateGradient" decimals={2} />
        <PerformanceChartCard title="حجم الطلبات" unit="طلب" data={performance.requestsHistory ?? []} color="#10b981" gradientId="requestsGradient" />
      </div>
    </AdminCard>
  );
}

interface PerformanceChartCardProps {
  title: string;
  unit: string;
  data: HistoryPoint[];
  color: string;
  gradientId: string;
  decimals?: number;
}

function PerformanceChartCard({ title, unit, data, color, gradientId, decimals = 0 }: PerformanceChartCardProps) {
  return (
    <section className="min-w-0 rounded-xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold">{title}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      {data.length === 0 ? (
        <div className="flex h-[210px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center text-muted-foreground">
          <ChartNoAxesCombined className="h-7 w-7" />
          <p className="text-sm font-medium">لا توجد نقاط تاريخية في هذا النطاق</p>
          <p className="text-xs">ستظهر البيانات عند تسجيل طلبات فعلية.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
            <XAxis dataKey="time" tickFormatter={formatTime} axisLine={false} tickLine={false} minTickGap={30} tick={{ fill: "currentColor", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 10 }} />
            <Tooltip
              labelFormatter={(label) => formatTime(String(label))}
              formatter={(value) => [`${Number(value).toFixed(decimals)} ${unit}`, title]}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
