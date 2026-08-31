"use client";

import * as React from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  buildHeatmapMatrix,
  getHeatmapIntensity,
} from "../_lib/utils";
import type { AntiCheatEvent, AntiCheatFlag } from "./types";

interface HeatmapViewProps {
  events?: AntiCheatEvent[];
  flags?: AntiCheatFlag[];
  loading?: boolean;
}

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function HeatmapView({ events, flags, loading }: HeatmapViewProps) {
  const derivedEvents = React.useMemo<AntiCheatEvent[]>(() => {
    if (events && events.length > 0) return events;
    if (flags && flags.length > 0) {
      return flags
        .filter((f) => f.lastEventAt)
        .map(
          (f): AntiCheatEvent => ({
            id: f.id,
            userId: f.userId,
            userName: f.userName,
            userEmail: f.userEmail,
            examId: f.examId,
            examTitle: f.examTitle,
            attemptId: f.attemptId,
            eventType: "TAB_SWITCH",
            severity: "MEDIUM",
            detail: f.reason,
            metadata: {},
            ipAddress: f.ipAddress,
            userAgent: "",
            createdAt: f.lastEventAt ?? f.createdAt,
          })
        );
    }
    return [];
  }, [events, flags]);

  const matrix = React.useMemo(
    () => buildHeatmapMatrix(derivedEvents),
    [derivedEvents]
  );
  const max = React.useMemo(
    () => Math.max(1, ...matrix.map((m) => m.count)),
    [matrix]
  );
  const totalEvents = derivedEvents.length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-48 animate-pulse rounded bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black">خريطة النشاط الزمنية</h3>
          <p className="mt-1 text-[11px] font-bold text-muted-foreground">
            توزيع الأحداث على مدار الأسبوع والساعة ({ totalEvents} حدث)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
          <span>أقل</span>
          <div className="flex gap-1">
            <span className="h-3 w-3 rounded-sm bg-emerald-500/30" />
            <span className="h-3 w-3 rounded-sm bg-amber-500/40" />
            <span className="h-3 w-3 rounded-sm bg-orange-500/60" />
            <span className="h-3 w-3 rounded-sm bg-red-500/80" />
          </div>
          <span>أكثر</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="mb-1 flex">
            <div className="w-16 shrink-0" />
            <div className="grid flex-1 grid-cols-24 gap-1">
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="text-center text-[9px] font-bold text-muted-foreground/70"
                >
                  {h.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>

          {DAYS_AR.map((dayName, dayIdx) => {
            const rowMax = Math.max(
              1,
              ...matrix.filter((c) => c.day === dayIdx).map((c) => c.count)
            );
            return (
              <div key={dayIdx} className="mb-1 flex items-center">
                <div className="w-16 shrink-0 text-[10px] font-black text-muted-foreground">
                  {dayName}
                </div>
                <div className="grid flex-1 grid-cols-24 gap-1">
                  {matrix
                    .filter((c) => c.day === dayIdx)
                    .map((cell) => {
                      const intensity = getHeatmapIntensity(cell.count, max);
                      return (
                        <m.div
                          key={cell.hour}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: cell.hour * 0.005, duration: 0.2 }}
                          className={cn(
                            "aspect-square rounded-sm border border-border/30",
                            intensity.bg
                          )}
                          style={{ opacity: cell.count > 0 ? 1 : 0.3 }}
                          title={`${dayName} ${cell.hour.toString().padStart(2, "0")}:00 - ${cell.count} حدث`}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}