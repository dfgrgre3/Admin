"use client";

import * as React from "react";
import { m } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface TrendChartProps {
  data: { date: string; flags: number; events?: number }[];
  loading?: boolean;
  height?: number;
}

export function TrendChart({ data, loading, height = 200 }: TrendChartProps) {
  const max = Math.max(
    1,
    ...data.map((d: { flags: number; events?: number }) =>
      Math.max(d.flags, d.events ?? 0)
    )
  );
  const trend = React.useMemo(() => {
    if (data.length < 2) return { direction: "flat" as const, percent: 0 };
    const first = data[0]?.flags ?? 0;
    const last = data[data.length - 1]?.flags ?? 0;
    if (first === 0) return { direction: "flat" as const, percent: 0 };
    const percent = ((last - first) / first) * 100;
    return {
      direction: percent > 0 ? ("up" as const) : percent < 0 ? ("down" as const) : ("flat" as const),
      percent: Math.abs(percent),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-48 animate-pulse rounded bg-muted/50" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 text-xs font-bold text-muted-foreground">
        لا توجد بيانات لعرضها
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black">اتجاه الحالات خلال الأسبوع</h3>
          <p className="mt-1 text-[11px] font-bold text-muted-foreground">
            تطور حالات الغش والأحداث المرصودة
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black",
            trend.direction === "up" && "bg-red-500/10 text-red-500",
            trend.direction === "down" && "bg-emerald-500/10 text-emerald-500",
            trend.direction === "flat" && "bg-slate-500/10 text-slate-500"
          )}
        >
          {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
          {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
          {trend.percent.toFixed(0)}%
        </div>
      </div>

      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-bold text-muted-foreground/50">
          {[1, 0.75, 0.5, 0.25, 0].map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span>{formatNumber(max * p)}</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 mr-12 flex items-end justify-between gap-1">
          {data.map((point, idx) => {
            const flagHeight = (point.flags / max) * 100;
            const eventHeight = point.events ? (point.events / max) * 100 : 0;
            const date = new Date(point.date);
            const dayLabel = date.toLocaleDateString("ar-EG", {
              weekday: "short",
            });
            return (
              <div
                key={point.date}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-0.5"
              >
                <div className="relative h-full w-full overflow-visible">
                  <m.div
                    initial={{ height: 0 }}
                    animate={{ height: `${flagHeight}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                    className="absolute bottom-0 left-1/2 w-3/5 -translate-x-1/2 rounded-t-md bg-gradient-to-t from-red-500 to-rose-400"
                  />
                  {point.events !== undefined && (
                    <m.div
                      initial={{ height: 0 }}
                      animate={{ height: `${eventHeight}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 + 0.1, ease: "easeOut" }}
                      className="absolute bottom-0 right-1/2 w-3/5 translate-x-[60%] rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400 opacity-70"
                    />
                  )}
                </div>
                <span className="mt-1 text-[9px] font-bold text-muted-foreground">
                  {dayLabel}
                </span>
                <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg border border-border/70 bg-card px-3 py-2 text-[10px] font-bold opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <p className="text-foreground">
                    {point.flags} حالة
                    {point.events !== undefined && ` • ${point.events} حدث`}
                  </p>
                  <p className="text-muted-foreground">{date.toLocaleDateString("ar-EG")}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-red-500" />
          <span>حالات الغش</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-blue-500" />
          <span>الأحداث المرصودة</span>
        </div>
      </div>
    </div>
  );
}