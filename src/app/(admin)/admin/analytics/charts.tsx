"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
} from "recharts";
import { AdminBadge } from "@/components/admin/ui/admin-badge";

export const COLORS = {
  primary: "hsl(var(--primary))",
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  lime: "#84cc16",
  indigo: "#6366f1",
} as const;

const PALETTE = Object.values(COLORS);

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
  padding: "8px 12px",
};

const formatDate = (value: string, opts?: Intl.DateTimeFormatOptions) => {
  try {
    return new Date(value).toLocaleDateString("ar-EG", opts);
  } catch {
    return value;
  }
};

// ─────────────────────────────────────────────────────
// Existing: DAU / Registrations / Role Distribution
// ─────────────────────────────────────────────────────

export const DailyActiveUsersChart = ({ data }: { data: Array<{ date: string; count: number }> }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RechartsAreaChart data={data}>
      <defs>
        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => formatDate(v, { weekday: "short" })} />
      <YAxis className="text-xs" />
      <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => formatDate(v)} />
      <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
    </RechartsAreaChart>
  </ResponsiveContainer>
);

export const DailyRegistrationsChart = ({ data }: { data: Array<{ date: string; count: number }> }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => formatDate(v, { weekday: "short" })} />
      <YAxis className="text-xs" />
      <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => formatDate(v)} />
      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
    </RechartsBarChart>
  </ResponsiveContainer>
);

export const RoleDistributionChart = ({ data }: { data: Array<{ name: string; value: number }> }) => (
  <>
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
      <RechartsPieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </RechartsPieChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {data.map((item, i) => (
        <AdminBadge key={item.name} variant="outline" size="sm">
          <span className="w-2 h-2 rounded-full ml-1" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
          {item.name}: {item.value}
        </AdminBadge>
      ))}
    </div>
  </>
);

// ─────────────────────────────────────────────────────
// NEW: Revenue Composed Chart (revenue + transactions)
// ─────────────────────────────────────────────────────

export const RevenueComposedChart = ({
  data,
}: {
  data: Array<{ month: number; revenue: number; transactions?: number }>;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <ComposedChart data={data}>
      <defs>
        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.4} />
          <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="month" className="text-xs" tickFormatter={(v) => `${v}`} />
      <YAxis yAxisId="left" className="text-xs" />
      <YAxis yAxisId="right" orientation="right" className="text-xs" />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: "12px" }} />
      <Area yAxisId="left" type="monotone" dataKey="revenue" name="الإيرادات" stroke={COLORS.emerald} fill="url(#rev)" strokeWidth={2.5} />
      <Bar yAxisId="right" dataKey="transactions" name="المعاملات" fill={COLORS.purple} radius={[4, 4, 0, 0]} barSize={20} />
    </ComposedChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────
// NEW: Multi-Series Line (compare periods)
// ─────────────────────────────────────────────────────

export const MultiLineChart = ({
  data,
  series,
}: {
  data: Array<Record<string, string | number>>;
  series: Array<{ key: string; name: string; color: string }>;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RechartsLineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="label" className="text-xs" />
      <YAxis className="text-xs" />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: "12px" }} />
      {series.map((s) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.name}
          stroke={s.color}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </RechartsLineChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────
// NEW: Horizontal Bar (top lists)
// ─────────────────────────────────────────────────────

export const HorizontalBarChart = ({
  data,
  dataKey = "value",
  nameKey = "name",
}: {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  nameKey?: string;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RechartsBarChart data={data} layout="vertical" margin={{ left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis type="number" className="text-xs" />
      <YAxis dataKey={nameKey} type="category" className="text-xs" width={100} />
      <Tooltip contentStyle={tooltipStyle} />
      <Bar dataKey={dataKey} fill={COLORS.blue} radius={[0, 6, 6, 0]} />
    </RechartsBarChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────
// NEW: Radial Progress (gauges)
// ─────────────────────────────────────────────────────

export const RadialProgressChart = ({
  data,
}: {
  data: Array<{ name: string; value: number; fill: string }>;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RadialBarChart innerRadius="20%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
      <RadialBar dataKey="value" background cornerRadius={8} />
      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "11px" }} />
      <Tooltip contentStyle={tooltipStyle} />
    </RadialBarChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────
// NEW: Stacked Bar (course engagement breakdown)
// ─────────────────────────────────────────────────────

export const StackedBarChart = ({
  data,
  stackKeys,
}: {
  data: Array<Record<string, string | number>>;
  stackKeys: Array<{ key: string; name: string; color: string }>;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="name" className="text-xs" />
      <YAxis className="text-xs" />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: "12px" }} />
      {stackKeys.map((s) => (
        <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} radius={[4, 4, 0, 0]} />
      ))}
    </RechartsBarChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────
// NEW: Prediction Chart (dashed forecast line)
// ─────────────────────────────────────────────────────

export const PredictionChart = ({
  data,
  forecastKey = "forecast",
  actualKey = "actual",
}: {
  data: Array<Record<string, string | number | null>>;
  forecastKey?: string;
  actualKey?: string;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <RechartsAreaChart data={data}>
      <defs>
        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.3} />
          <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => formatDate(String(v), { month: "short", day: "numeric" })} />
      <YAxis className="text-xs" />
      <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => formatDate(String(v))} />
      <Legend wrapperStyle={{ fontSize: "12px" }} />
      <Area type="monotone" dataKey={actualKey} name="فعلي" stroke={COLORS.blue} fill="transparent" strokeWidth={2.5} />
      <Area type="monotone" dataKey={forecastKey} name="تنبؤ" stroke={COLORS.purple} fill="url(#forecastGrad)" strokeWidth={2.5} strokeDasharray="6 4" />
    </RechartsAreaChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────────────
// NEW: Scatter (correlation: price vs enrollment)
// ─────────────────────────────────────────────────────

export const ScatterChartComponent = ({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
}) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
    <ScatterChart>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis type="number" dataKey={xKey} name={xLabel || xKey} className="text-xs" />
      <YAxis type="number" dataKey={yKey} name={yLabel || yKey} className="text-xs" />
      <ZAxis range={[60, 200]} />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} />
      <Scatter data={data} fill={COLORS.purple} />
    </ScatterChart>
  </ResponsiveContainer>
);