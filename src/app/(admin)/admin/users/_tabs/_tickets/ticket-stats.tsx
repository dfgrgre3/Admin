"use client";

import { AlertTriangle, CheckCircle, Clock, Ticket } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { SupportTicketItem } from "./ticket-types";

interface TicketStatsProps {
  tickets: SupportTicketItem[];
}

interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: typeof Ticket;
}

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </AdminCard>
  );
}

export function TicketStats({ tickets }: TicketStatsProps) {
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="إجمالي التذاكر"
        value={tickets.length}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
        Icon={Ticket}
      />
      <StatCard
        label="مفتوحة"
        value={openCount}
        iconBg="bg-red-500/10"
        iconColor="text-red-500"
        Icon={AlertTriangle}
      />
      <StatCard
        label="قيد المعالجة"
        value={inProgressCount}
        iconBg="bg-yellow-500/10"
        iconColor="text-yellow-500"
        Icon={Clock}
      />
      <StatCard
        label="تم الحل"
        value={resolvedCount}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
        Icon={CheckCircle}
      />
    </div>
  );
}