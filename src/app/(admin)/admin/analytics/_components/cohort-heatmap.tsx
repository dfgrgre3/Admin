"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CohortHeatmapProps {
  data: Array<{
    cohort: string;
    sizes: number[]; // أحجام كل فترة (مثلاً أسبوع/شهر)
  }>;
  className?: string;
  maxPeriods?: number;
}

export function CohortHeatmap({ data, className, maxPeriods = 12 }: CohortHeatmapProps) {
  const maxRetention = 100;

  const getColor = (value: number) => {
    if (value === 0) return "bg-muted/30 text-muted-foreground/40";
    if (value >= 80) return "bg-emerald-500/80 text-white";
    if (value >= 60) return "bg-emerald-500/60 text-white";
    if (value >= 40) return "bg-emerald-500/40 text-emerald-50";
    if (value >= 25) return "bg-amber-500/40 text-amber-50";
    if (value >= 15) return "bg-amber-500/30 text-amber-100";
    if (value >= 5) return "bg-red-500/30 text-red-100";
    return "bg-red-500/20 text-red-200";
  };

  const periodHeaders = Array.from({ length: maxPeriods }, (_, i) => `P${i}`);

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border bg-card/50", className)}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/50 bg-muted/20">
            <th className="text-right p-3 font-black sticky right-0 bg-muted/30 backdrop-blur z-10">
              الكوهورت
            </th>
            <th className="text-center p-3 font-bold text-muted-foreground">الحجم</th>
            {periodHeaders.map((p) => (
              <th key={p} className="text-center p-2 font-bold text-muted-foreground min-w-[60px]">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={row.cohort} className="border-b border-border/30 last:border-0">
              <td className="text-right p-3 font-bold sticky right-0 bg-card/80 backdrop-blur">
                {row.cohort}
              </td>
              <td className="text-center p-3 text-muted-foreground font-bold">
                {row.sizes[0]}
              </td>
              {periodHeaders.map((_, colIdx) => {
                if (colIdx >= row.sizes.length) {
                  return (
                    <td key={colIdx} className="p-2 text-center text-muted-foreground/20">
                      -
                    </td>
                  );
                }
                const retention = row.sizes[0] > 0 ? Math.round((row.sizes[colIdx] / row.sizes[0]) * 100) : 0;
                return (
                  <td key={colIdx} className="p-1">
                    <div
                      className={cn(
                        "rounded-md py-2 text-center text-[11px] font-black transition-transform hover:scale-105",
                        getColor(retention)
                      )}
                      title={`الاحتفاظ: ${retention}%`}
                    >
                      {retention}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}