"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { DailyRevenuePoint } from "./types";
import { formatEGP, formatCompact } from "./utils";

interface RevenueTrendChartProps {
  data: DailyRevenuePoint[];
  height?: number;
}

export function RevenueTrendChart({ data, height = 320 }: RevenueTrendChartProps) {
  const chartData = React.useMemo(
    () =>
      data.map((point) => ({
        ...point,
        name: new Date(point.date).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "short",
        }),
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={1}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatCompact(v)}
          width={56}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "14px",
            color: "hsl(var(--foreground))",
            direction: "rtl",
          }}
          formatter={(value: any, name: any) => {
            if (name === "إيرادات") return [formatEGP(Number(value)), name];
            if (name === "معاملات") return [Number(value).toLocaleString("ar-EG"), name];
            return [value, name];
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: 700 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="إيرادات"
          stroke="#10b981"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#revGrad)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface RevenueCountBarsProps {
  data: DailyRevenuePoint[];
  height?: number;
}

export function RevenueCountBars({ data, height = 200 }: RevenueCountBarsProps) {
  const chartData = React.useMemo(
    () =>
      data.map((point) => ({
        ...point,
        name: new Date(point.date).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "short",
        }),
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={1}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={30} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "14px",
            color: "hsl(var(--foreground))",
            direction: "rtl",
          }}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          formatter={(value: any, name: any) => [Number(value).toLocaleString("ar-EG"), "معاملات"]}
        />
        <Bar dataKey="count" name="معاملات" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
