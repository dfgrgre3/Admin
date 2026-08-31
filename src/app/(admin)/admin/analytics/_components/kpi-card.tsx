"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

type ColorKey =
  | "default"
  | "violet"
  | "fuchsia"
  | "rose"
  | "amber"
  | "purple"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "slate";

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  delta?: number; // نسبة التغيير
  deltaLabel?: string; // مثل "مقارنة بالأسبوع الماضي"
  icon?: LucideIcon;
  color?: ColorKey;
  hint?: string;
  sparkline?: number[];
  loading?: boolean;
}

const colorClasses: Record<ColorKey, string> = {
  default: "text-primary",
  violet: "text-violet-500",
  fuchsia: "text-fuchsia-500",
  rose: "text-rose-500",
  amber: "text-amber-500",
  purple: "text-purple-500",
  blue: "text-blue-500",
  green: "text-emerald-500",
  yellow: "text-amber-500",
  red: "text-red-500",
  slate: "text-slate-500",
};

const iconBgClasses: Record<ColorKey, string> = {
  default: "bg-primary/10",
  violet: "bg-violet-500/10",
  fuchsia: "bg-fuchsia-500/10",
  rose: "bg-rose-500/10",
  amber: "bg-amber-500/10",
  purple: "bg-purple-500/10",
  blue: "bg-blue-500/10",
  green: "bg-emerald-500/10",
  yellow: "bg-amber-500/10",
  red: "bg-red-500/10",
  slate: "bg-slate-500/10",
};

export function KPICard({
  title,
  value,
  unit,
  delta,
  deltaLabel,
  icon: Icon,
  color = "default",
  hint,
  sparkline,
  loading,
}: KPICardProps) {
  const formatted =
    typeof value === "number" ? formatNumber(value) : value;
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;
  const isNeutral = delta === 0 || delta === undefined;

  const sparkPath = React.useMemo(() => {
    if (!sparkline || sparkline.length < 2) return null;
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    const w = 80;
    const h = 24;
    const step = w / (sparkline.length - 1);
    return sparkline
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [sparkline]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-xl shadow-lg shadow-black/5 transition-all hover:shadow-xl hover:-translate-y-0.5",
        loading && "animate-pulse"
      )}
    >
      <div
        className={cn(
          "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50",
          color === "default" && "bg-primary",
          color === "violet" && "bg-violet-500",
          color === "fuchsia" && "bg-fuchsia-500",
          color === "rose" && "bg-rose-500",
          color === "amber" && "bg-amber-500",
          color === "purple" && "bg-purple-500",
          color === "blue" && "bg-blue-500",
          color === "green" && "bg-emerald-500",
          color === "yellow" && "bg-amber-500",
          color === "red" && "bg-red-500",
          color === "slate" && "bg-slate-500"
        )}
      />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
            {title}
          </p>
          {Icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBgClasses[color])}>
              <Icon className={cn("h-5 w-5", colorClasses[color])} />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <p className={cn("text-3xl font-black tracking-tight drop-shadow-sm", colorClasses[color])}>
            {formatted}
          </p>
          {unit && (
            <span className="text-xs font-bold text-muted-foreground">{unit}</span>
          )}
        </div>
        {(delta !== undefined || hint) && (
          <div className="flex items-center gap-2 text-[11px]">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold",
                  isPositive && "bg-emerald-500/10 text-emerald-500",
                  isNegative && "bg-red-500/10 text-red-500",
                  isNeutral && "bg-muted text-muted-foreground"
                )}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
            {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
            {!deltaLabel && hint && <span className="text-muted-foreground/80 italic">{hint}</span>}
          </div>
        )}
        {sparkPath && (
          <svg viewBox="0 0 80 24" className="h-6 w-20 overflow-visible" preserveAspectRatio="none">
            <path
              d={sparkPath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                isPositive ? "stroke-emerald-500" : isNegative ? "stroke-red-500" : "stroke-muted-foreground"
              )}
            />
          </svg>
        )}
      </div>
    </div>
  );
}