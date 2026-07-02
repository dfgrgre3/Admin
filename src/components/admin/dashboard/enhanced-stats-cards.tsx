"use client";

import * as React from "react";
import { cn, formatNumber } from "@/lib/utils";
import { AdminCard } from "../ui/admin-card";
import {
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatItem {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "cyan" | "orange" | "pink";
  onClick?: () => void;
}

interface EnhancedStatsCardsProps {
  stats: StatItem[];
  layout?: "grid" | "carousel";
  animated?: boolean;
  className?: string;
}

const colorConfig = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    gradient: "from-blue-500/20 to-transparent",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/20",
    gradient: "from-green-500/20 to-transparent",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    border: "border-yellow-500/20",
    gradient: "from-yellow-500/20 to-transparent",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    gradient: "from-red-500/20 to-transparent",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    gradient: "from-purple-500/20 to-transparent",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500/20 to-transparent",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
    gradient: "from-orange-500/20 to-transparent",
  },
  pink: {
    bg: "bg-pink-500/10",
    text: "text-pink-500",
    border: "border-pink-500/20",
    gradient: "from-pink-500/20 to-transparent",
  },
} as const;

export type StatColor = keyof typeof colorConfig;

const AnimatedNumber = React.memo(function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return <span className={className}>{formatNumber(value)}</span>;
});

const StatCard = React.memo(function StatCard({ stat, animated, index }: { stat: StatItem; animated: boolean; index: number }) {
  const config = colorConfig[stat.color || "blue"];
  const Icon = stat.icon;

  return (
    <AdminCard
      variant="glass"
      interactive={true}
      onClick={stat.onClick}
      className={cn(
        "relative overflow-hidden group border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-500",
        "hover:-translate-y-1.5 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
        stat.onClick && "cursor-pointer"
      )}
    >
      {/* Background glow decoration */}
      <div
        className={cn(
          "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-transform duration-700 ease-out group-hover:scale-150",
          config.text.includes("blue") ? "bg-blue-500" :
          config.text.includes("green") ? "bg-emerald-500" :
          config.text.includes("yellow") ? "bg-amber-500" :
          config.text.includes("red") ? "bg-red-500" :
          config.text.includes("purple") ? "bg-purple-500" :
          config.text.includes("cyan") ? "bg-cyan-500" :
          config.text.includes("orange") ? "bg-orange-500" : "bg-pink-500"
        )}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.title}</p>
            <div className="flex items-baseline gap-2">
              {typeof stat.value === "number" && animated ? (
                <AnimatedNumber value={stat.value} className={cn("text-4xl font-black font-mono tracking-tight", config.text)} />
              ) : (
                <p className={cn("text-4xl font-black font-mono tracking-tight", config.text)}>
                  {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
                </p>
              )}
            </div>
          </div>

          {Icon && (
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/10 shadow-lg transition-all duration-300",
                "group-hover:scale-110 group-hover:rotate-6",
                config.bg
              )}
            >
              <Icon className={cn("h-7 w-7", config.text)} />
            </div>
          )}
        </div>

        {/* Trend and description */}
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          {stat.trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-colors duration-300",
                stat.trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : stat.trend.value === 0
                  ? "bg-muted/50 text-muted-foreground border-white/5"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              )}
            >
              {stat.trend.value === 0 ? (
                <Minus className="h-3 w-3" />
              ) : stat.trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(stat.trend.value)}%
            </span>
          )}
          {stat.description && (
            <span className="text-[11px] font-bold text-muted-foreground/80">{stat.description}</span>
          )}
        </div>
      </div>
    </AdminCard>
  );
});

export function EnhancedStatsCards({
  stats,
  layout = "grid",
  animated = false,
  className,
}: EnhancedStatsCardsProps) {
  if (layout === "carousel") {
    return (
      <div className={cn("relative", className)}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {stats.map((stat, index) => (
            <div key={index} className="snap-start flex-shrink-0 w-[280px]">
              <StatCard stat={stat} animated={animated} index={index} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} animated={animated} index={index} />
      ))}
    </div>
  );
}

// Quick Stats Row - Compact version
interface QuickStatsRowProps {
  stats: Array<{
    label: string;
    value: number | string;
    icon?: React.ElementType;
    color?: keyof typeof colorConfig;
  }>;
  className?: string;
}

export function QuickStatsRow({ stats, className }: QuickStatsRowProps) {
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {stats.map((stat, index) => {
        const config = colorConfig[stat.color || "blue"];
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2",
              config.bg,
              "animate-in fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {Icon && <Icon className={cn("h-4 w-4", config.text)} />}
            <span className="font-semibold">{typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Mini Chart Sparkline
interface SparklineProps {
  data: number[];
  color?: keyof typeof colorConfig;
  className?: string;
}

function Sparkline({ data, color = "blue", className }: SparklineProps) {
  const config = colorConfig[color];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className={cn("w-full h-8", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={config.text.includes("blue") ? "#3b82f6" : config.text.includes("green") ? "#22c55e" : "#8b5cf6"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
