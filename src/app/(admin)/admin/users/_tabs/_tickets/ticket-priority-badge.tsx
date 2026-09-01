"use client";

import { Badge } from "@/components/ui/badge";
import { TICKET_PRIORITY_LABELS } from "./ticket-types";

export function TicketPriorityBadge({ priority }: { priority: string }) {
  const config = TICKET_PRIORITY_LABELS[priority] ?? TICKET_PRIORITY_LABELS.medium!;
  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
}