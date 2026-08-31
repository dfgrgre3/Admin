"use client";

import * as React from "react";
import { TicketList, TicketLoadingState } from "../_tabs/_tickets/ticket-list";
import { TicketStats } from "../_tabs/_tickets/ticket-stats";
import type { SupportTicketItem, UserTicketsTabProps } from "../_tabs/_tickets/ticket-types";

export function UserTicketsTab({ userId: _userId }: UserTicketsTabProps) {
  const [tickets] = React.useState<SupportTicketItem[]>([]);
  const [loading] = React.useState(false);

  if (loading) return <TicketLoadingState />;

  return (
    <div className="space-y-4">
      <TicketStats tickets={tickets} />
      <TicketList tickets={tickets} />
    </div>
  );
}