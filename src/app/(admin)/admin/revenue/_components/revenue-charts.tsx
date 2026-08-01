"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number }>;
  gradientId?: string;
  height?: number;
}

export function RevenueAreaChart({
  data,
  gradientId = "colorRevenue",
  height = 350,
}: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "12px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface MrrChartProps {
  data: Array<{ name: string; revenue: number; mrr: number }>;
  height?: number;
}

export function MrrAreaChart({ data, height = 300 }: MrrChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(152 60% 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(152 60% 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }} />
        <Area type="monotone" dataKey="revenue" stroke="hsl(152 60% 45%)" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
