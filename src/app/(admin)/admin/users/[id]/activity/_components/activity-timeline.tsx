"use client";

import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { ActivityEventCard } from "./activity-event-card";
import type { ActivityEvent } from "../_hooks/use-activity-feed";

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const grouped = events.reduce<Record<string, ActivityEvent[]>>((acc, event) => {
    const date = isValid(new Date(event.timestamp))
      ? format(new Date(event.timestamp), "yyyy-MM-dd")
      : "unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {dates.map(dateKey => (
        <div key={dateKey} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-white/5">
              <Calendar className="h-3.5 w-3.5" />
              {isValid(new Date(dateKey))
                ? format(new Date(dateKey), "EEEE، d MMMM yyyy", { locale: ar })
                : dateKey}
            </div>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">{(grouped[dateKey] || []).length} حدث</span>
          </div>
          <div className="space-y-2 mr-4">
            {(grouped[dateKey] || []).map((event, idx) => (
              <ActivityEventCard key={event.id || idx} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}