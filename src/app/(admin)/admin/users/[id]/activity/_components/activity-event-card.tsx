"use client";

import { format, isValid, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getEventConfig } from "../_lib/event-config";
import type { ActivityEvent } from "../_hooks/use-activity-feed";

interface ActivityEventCardProps {
  event: ActivityEvent;
}

export function ActivityEventCard({ event }: ActivityEventCardProps) {
  const cfg = getEventConfig(event.type);
  const Icon = cfg.icon;
  const eventDate = new Date(event.timestamp);
  const isValidDate = isValid(eventDate);
  const isSuccess = event.status === "success" || event.status === "SUCCESS";

  return (
    <div className="group relative flex gap-4 p-4 rounded-2xl border border-white/5 bg-card/40 hover:bg-card/80 hover:border-white/10 transition-all duration-200">
      <div className={`flex-none flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} transition-transform group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <p className="font-bold text-sm">{event.title || cfg.label}</p>
          <Badge variant="outline" className={`text-[10px] px-2 py-0 font-bold ${cfg.color} border-current/30 bg-transparent`}>
            {cfg.label}
          </Badge>
          {event.status && (
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0 font-bold ${
                isSuccess
                  ? "text-green-500 border-green-500/30"
                  : "text-red-500 border-red-500/30"
              }`}
            >
              {isSuccess ? "✓ نجاح" : "✗ فشل"}
            </Badge>
          )}
        </div>

        {event.detail && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.detail}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-muted-foreground/70">
          {event.ip && (
            <span className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <span dir="ltr" className="font-mono">{event.ip}</span>
            </span>
          )}
          {isValidDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(eventDate, "HH:mm:ss")}
            </span>
          )}
        </div>
      </div>

      <div className="text-right text-[11px] text-muted-foreground flex-none">
        {isValidDate ? formatDistanceToNow(eventDate, { locale: ar, addSuffix: true }) : "—"}
      </div>
    </div>
  );
}