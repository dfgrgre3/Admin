"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// Common chart colors
const CHART_COLORS = [
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
];

interface BaseChartProps {
  data: any[];
  className?: string;
  height?: number;
}

interface LineChartProps extends BaseChartProps {
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  curve?: "monotone" | "linear" | "step" | "stepBefore" | "stepAfter";
}

export function ChartLine({
  data,
  dataKey,
  xAxisKey = "name",
  color = "#f97316",
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  curve = "monotone",
}: LineChartProps) {
  return (
    <div className={cn("w-full min-h-[200px]", className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
          )}
          {showLegend && <Legend />}
          <Line
            type={curve}
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartProps extends BaseChartProps {
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  horizontal?: boolean;
}

export function ChartBar({
  data,
  dataKey,
  xAxisKey = "name",
  color = "#f97316",
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  horizontal = false,
}: BarChartProps) {
  return (
    <div className={cn("w-full min-h-[200px]", className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
        <BarChart data={data} layout={horizontal ? "horizontal" : "vertical"}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            dataKey={horizontal ? dataKey : xAxisKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            dataKey={horizontal ? xAxisKey : dataKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
          )}
          {showLegend && <Legend />}
          <Bar dataKey={horizontal ? xAxisKey : dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function ChartDonut({
  data,
  dataKey,
  nameKey = "name",
  colors = CHART_COLORS,
  className,
  height = 300,
  showTooltip = true,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 80,
}: PieChartProps) {
  return (
    <div className={cn("w-full min-h-[200px]", className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
          )}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MultiLineChartProps extends BaseChartProps {
  lines: Array<{
    dataKey: string;
    color: string;
    name?: string;
  }>;
  xAxisKey?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  curve?: "monotone" | "linear" | "step" | "stepBefore" | "stepAfter";
}

export function ChartMultiLine({
  data,
  lines,
  xAxisKey = "name",
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  curve = "monotone",
}: MultiLineChartProps) {
  return (
    <div className={cn("w-full min-h-[200px]", className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
          )}
          {showLegend && <Legend />}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type={curve}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MultiBarChartProps extends BaseChartProps {
  bars: Array<{
    dataKey: string;
    color: string;
    name?: string;
  }>;
  xAxisKey?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export function ChartMultiBar({
  data,
  bars,
  xAxisKey = "name",
  className,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
}: MultiBarChartProps) {
  return (
    <div className={cn("w-full min-h-[200px]", className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
        <BarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
          )}
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
