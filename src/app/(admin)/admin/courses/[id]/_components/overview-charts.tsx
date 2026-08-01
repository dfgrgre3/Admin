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
  RadialBarChart,
  RadialBar,
} from "recharts";

interface EnrollmentChartData {
  name: string;
  enrollments: number;
  revenue: number;
}

export function EnrollmentAreaChart({ data }: { data: EnrollmentChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontWeight: 700, fill: "#88888888" }}
          dy={10}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#88888888" }} />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #88888820",
            backgroundColor: "hsl(var(--card))",
            fontWeight: 900,
            direction: "rtl",
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="enrollments" name="تسجيلات" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradEnroll)" />
        <Area type="monotone" dataKey="revenue" name="إيرادات" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444";
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative flex items-center justify-center" style={{ height: 120 }}>
      <ResponsiveContainer width="100%" height={120} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
        <RadialBarChart
          cx="50%"
          cy="100%"
          innerRadius="80%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar background={{ fill: "#88888815" }} dataKey="value" cornerRadius={6} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color }}>{score}%</span>
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">جاهزية</span>
      </div>
    </div>
  );
}
