"use client";

import { ArrowDown, CheckCircle, Clock, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    Icon: LucideIcon;
  }
> = {
  completed: { label: "مكتمل", variant: "default", Icon: CheckCircle },
  pending: { label: "معلق", variant: "secondary", Icon: Clock },
  failed: { label: "فاشل", variant: "destructive", Icon: XCircle },
  refunded: { label: "مسترد", variant: "outline", Icon: ArrowDown },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  const { label, variant, Icon } = config;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}