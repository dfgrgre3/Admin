"use client";

import * as React from "react";
import { motion as m } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { cn } from "@/lib/utils";
import { formatDuration } from "../_lib/utils";

interface HourPoint {
  hour: string;
  calls: number;
  errors: number;
  avgMs: number;
}

interface TimelineChartProps {
  data: HourPoint[];
}

export function ApiLogsTimelineChart({ data }: TimelineChartProps) {
  const max = React.useMemo(() => Math.max(1, ...data.map((d) => d.calls)), [data]);

  if (!data.length) {
    return (
      <AdminCard className="p-8 text-center">
        <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">لا توجد بيانات زمنية</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard variant="glass" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            حركة الـ API خلال 24 ساعة
          </h3>
          <p className="text-xs text-muted-foreground">عدد الطلبات والأخطاء لكل ساعة</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            طلبات
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            أخطاء
          </span>
        </div>
      </div>

      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end gap-1">
          {data.map((point, idx) => {
            const callH = (point.calls / max) * 100;
            const errorH = (point.errors / Math.max(1, max)) * 100;
            return (
              <div
                key={point.hour + idx}
                className="flex-1 flex flex-col justify-end gap-0.5 group relative"
                title={`${point.hour} • ${point.calls} طلب • ${point.errors} خطأ • متوسط ${formatDuration(point.avgMs)}`}
              >
                <div
                  className={cn(
                    "bg-rose-500/80 rounded-t-sm transition-all",
                    point.errors === 0 && "opacity-0"
                  )}
                  style={{ height: `${Math.max(errorH, point.errors > 0 ? 4 : 0)}%`, minHeight: 0 }}
                />
                <div
                  className="bg-gradient-to-t from-primary/80 to-primary rounded-t-sm transition-all group-hover:from-primary group-hover:to-primary"
                  style={{ height: `${callH}%`, minHeight: callH > 0 ? "4px" : "0" }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="rounded-lg border border-border bg-popover px-2 py-1 text-[10px] font-bold shadow-lg whitespace-nowrap">
                    <div className="text-foreground">{point.hour}</div>
                    <div className="text-muted-foreground">{point.calls} طلب • {point.errors} خطأ</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between mt-3 text-[10px] font-bold text-muted-foreground">
        <span>{data[0]?.hour}</span>
        <span>{data[Math.floor(data.length / 2)]?.hour}</span>
        <span>{data[data.length - 1]?.hour}</span>
      </div>
    </AdminCard>
  );
}

// Latency line chart (avg ms per hour)
export function ApiLogsLatencyChart({ data }: TimelineChartProps) {
  const max = React.useMemo(() => Math.max(1, ...data.map((d) => d.avgMs)), [data]);
  const min = React.useMemo(() => Math.min(0, ...data.map((d) => d.avgMs)), [data]);
  const range = Math.max(1, max - min);

  if (!data.length) {
    return (
      <AdminCard className="p-8 text-center">
        <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">لا توجد بيانات للزمن</p>
      </AdminCard>
    );
  }

  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * 100;
    const y = 100 - ((d.avgMs - min) / range) * 100;
    return { x, y, ...d };
  });
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <AdminCard variant="glass" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            متوسط زمن الاستجابة
          </h3>
          <p className="text-xs text-muted-foreground">آخر 24 ساعة</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-blue-500">
            {formatDuration(Math.round(data.reduce((s, d) => s + d.avgMs, 0) / data.length))}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground">المتوسط العام</p>
        </div>
      </div>

      <div className="relative h-44">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="0.2"
            />
          ))}
          <m.path
            d={`${path} L 100 100 L 0 100 Z`}
            fill="url(#latencyFill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <m.path
            d={path}
            fill="none"
            stroke="rgb(59 130 246)"
            strokeWidth="0.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="0.7" fill="rgb(59 130 246)" />
          ))}
        </svg>
      </div>

      <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
        <span>{data[0]?.hour}</span>
        <span>{data[data.length - 1]?.hour}</span>
      </div>
    </AdminCard>
  );
}