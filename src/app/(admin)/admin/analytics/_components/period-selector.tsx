"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnalyticsPeriod = "day" | "week" | "month" | "quarter" | "year" | "all";

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (value: AnalyticsPeriod) => void;
  className?: string;
  size?: "sm" | "default";
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "اليوم",
  week: "آخر 7 أيام",
  month: "آخر 30 يوم",
  quarter: "آخر ربع سنة",
  year: "آخر سنة",
  all: "كل الفترة",
};

export function PeriodSelector({ value, onChange, className, size = "default" }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AnalyticsPeriod)}>
      <SelectTrigger
        className={cn(
          "rounded-xl border-border bg-background/80 backdrop-blur-sm",
          size === "sm" ? "h-9 w-36 text-xs" : "h-10 w-44",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {Object.entries(PERIOD_LABELS).map(([k, v]) => (
          <SelectItem key={k} value={k}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface DateRangeProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangeProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="h-9 rounded-lg border border-border bg-background/80 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <ChevronDown className="h-3 w-3 text-muted-foreground -rotate-90" />
      <input
        type="date"
        value={to}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="h-9 rounded-lg border border-border bg-background/80 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

interface CompareToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function CompareToggle({ enabled, onToggle }: CompareToggleProps) {
  return (
    <AdminButton
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(!enabled)}
      className={cn("text-xs", enabled && "shadow-md shadow-primary/20")}
    >
      مقارنة بالفترة السابقة
    </AdminButton>
  );
}