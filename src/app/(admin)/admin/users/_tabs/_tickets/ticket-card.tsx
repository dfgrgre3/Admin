"use client";

import { Ticket } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { SupportTicketItem } from "./ticket-types";
import { TicketStatusBadge } from "./ticket-status";
import { TicketPriorityBadge } from "./ticket-priority-badge";

interface TicketCardProps {
  ticket: SupportTicketItem;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Ticket className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold text-white">{ticket.subject}</p>
          <p className="text-sm text-muted-foreground">
            {ticket.category} • {ticket.messages} رسالة
          </p>
          <p className="text-xs text-muted-foreground">
            تاريخ الإنشاء: {formatDate(ticket.createdAt)}
            {ticket.resolvedAt ? ` • تم الحل: ${formatDate(ticket.resolvedAt)}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TicketPriorityBadge priority={ticket.priority} />
        <TicketStatusBadge status={ticket.status} />
      </div>
    </div>
  );
}