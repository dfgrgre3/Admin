"use client";

import { CheckCircle, Clock, Eye, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { REPORT_PRIORITY_LABELS, REPORT_TYPE_LABELS } from "./report-types";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: LucideIcon }> = {
  pending: { label: "معلق", variant: "secondary", icon: Clock },
  reviewing: { label: "قيد المراجعة", variant: "default", icon: Eye },
  resolved: { label: "تم الحل", variant: "default", icon: CheckCircle },
  dismissed: { label: "مرفوض", variant: "outline", icon: XCircle },
};

const DEFAULT_STATUS_CONFIG = STATUS_CONFIG.pending!;

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_STATUS_CONFIG;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const cfg = REPORT_TYPE_LABELS[type] ?? REPORT_TYPE_LABELS.other!;
  return <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cfg = REPORT_PRIORITY_LABELS[priority] ?? REPORT_PRIORITY_LABELS.medium!;
  return <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>;
}