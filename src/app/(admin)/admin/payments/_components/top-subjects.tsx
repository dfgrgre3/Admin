"use client";

import * as React from "react";
import { GraduationCap, TrendingUp } from "lucide-react";
import type { TopSubjectStat } from "./types";
import { formatEGP, formatCompact } from "./utils";

interface TopSubjectsProps {
  subjects: TopSubjectStat[];
}

export function TopSubjects({ subjects }: TopSubjectsProps) {
  if (!subjects.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <GraduationCap className="h-10 w-10 opacity-40" />
        <p className="text-sm font-bold">لا توجد مواد بعد</p>
      </div>
    );
  }

  const maxCount = Math.max(...subjects.map((s) => s.count), 1);
  const totalRevenue = subjects.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="space-y-4">
      {subjects.map((subject, index) => {
        const pct = (subject.count / maxCount) * 100;
        const revenueShare = totalRevenue > 0 ? (subject.revenue / totalRevenue) * 100 : 0;
        return (
          <div key={subject.id} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[11px] font-black text-primary">
                  {index + 1}
                </span>
                <span className="truncate text-sm font-black">{subject.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  {subject.count.toLocaleString("ar-EG")} عملية
                </span>
                <span className="text-xs font-black text-emerald-500">
                  {formatEGP(subject.revenue)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-500 group-hover:brightness-110"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="flex w-14 shrink-0 items-center justify-end gap-1 text-[10px] font-bold text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {formatCompact(revenueShare)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
