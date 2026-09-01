"use client";

import { ChartNoAxesCombined, LineChart as LineChartIcon } from "lucide-react";
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
import type { ServiceHealthHistoryPoint } from "../_hooks/use-service-health-history";

interface ServiceHistoryChartProps {
  history: ServiceHealthHistoryPoint[];
}

const statusColor: Record<string, string> = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  unhealthy: "#ef4444",
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("ar-EG", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export function ServiceHistoryChart({ history }: ServiceHistoryChartProps) {
  const data = history.map((point) => ({
    time: point.checkedAt,
    value: point.latencyMs,
    status: point.status,
  }));

  return (
    <AdminCard variant="glass">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-black">
          <LineChartIcon className="h-5 w-5 text-primary" />
          زمن الاستجابة عبر الوقت
        </h3>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center text-muted-foreground">
          <ChartNoAxesCombined className="h-7 w-7" />
          <p className="text-sm font-medium">لا توجد بيانات تاريخية بعد لهذه الخدمة</p>
          <p className="text-xs">
            سيبدأ عرض السجل خلال دقائق من تشغيل فحص الخدمة الدوري.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="serviceLatencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
            <XAxis dataKey="time" tickFormatter={formatTime} axisLine={false} tickLine={false} minTickGap={30} tick={{ fill: "currentColor", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 10 }} />
            <Tooltip
              labelFormatter={(label) => formatTime(String(label))}
              formatter={(value, _name, item) => {
                const status = (item?.payload as { status?: string } | undefined)?.status;
                const statusLabel =
                  status === "healthy" ? "سليمة" : status === "degraded" ? "متدهورة" : "غير متاحة";
                return [`${Number(value).toFixed(1)} ms — ${statusLabel}`, "زمن الاستجابة"];
              }}
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#serviceLatencyGradient)"
              activeDot={(props: { cx?: number; cy?: number; payload?: { status?: string } }) => {
                const { cx, cy, payload } = props;
                const color = statusColor[payload?.status ?? "healthy"] ?? "#3b82f6";
                return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </AdminCard>
  );
}
