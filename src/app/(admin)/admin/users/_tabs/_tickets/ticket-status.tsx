"use client";

import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TicketBadgeVariant, TicketStatus } from "./ticket-types";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: TicketBadgeVariant; icon: LucideIcon }
> = {
  open: { label: "مفتوح", variant: "destructive", icon: AlertTriangle },
  in_progress: { label: "قيد المعالجة", variant: "secondary", icon: Clock },
  resolved: { label: "تم الحل", variant: "default", icon: CheckCircle },
  closed: { label: "مغلق", variant: "outline", icon: XCircle },
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open!;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}