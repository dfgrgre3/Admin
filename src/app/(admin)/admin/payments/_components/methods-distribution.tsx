"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MethodStat } from "./types";
import { getMethodColor, getMethodLabel } from "./constants";
import { formatEGP, formatCompact, methodsTotal } from "./utils";

interface MethodsDistributionProps {
  methods: MethodStat[];
  height?: number;
}

export function MethodsDistribution({ methods, height = 260 }: MethodsDistributionProps) {
  const total = methodsTotal(methods);
  const data = methods.map((m, i) => ({
    name: getMethodLabel(m.method),
    value: m.total,
    count: m.count,
    color: getMethodColor(m.method, i),
  }));

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-bold text-muted-foreground">
        لا توجد بيانات كافية
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={1}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "14px",
              color: "hsl(var(--foreground))",
              direction: "rtl",
            }}
            formatter={(value: any, name: any, item: any) => [
              `${formatEGP(Number(value))} (${item?.payload?.count?.toLocaleString("ar-EG") ?? ""} عملية)`,
              name,
            ]}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs font-bold text-muted-foreground">{value}</span>
            )}
            iconType="circle"
            iconSize={9}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {data.map((entry, i) => {
          const pct = total > 0 ? (entry.value / total) * 100 : 0;
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold">{entry.name}</span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  ({entry.count.toLocaleString("ar-EG")} عملية)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-500">{formatEGP(entry.value)}</span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {formatCompact(pct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
