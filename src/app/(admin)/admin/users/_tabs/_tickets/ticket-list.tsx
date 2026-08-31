"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import type { SupportTicketItem } from "./ticket-types";
import { TicketCard } from "./ticket-card";

interface TicketListProps {
  tickets: SupportTicketItem[];
}

export function TicketList({ tickets }: TicketListProps) {
  return (
    <AdminCard variant="glass" className="p-6">
      <h3 className="text-xl font-black mb-4">التذاكر</h3>
      {tickets.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد تذاكر</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </AdminCard>
  );
}

export function TicketLoadingState() {
  return (
    <AdminCard variant="glass" className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}