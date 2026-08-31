"use client";

import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RoleOverviewCardProps {
  label: string;
  description: string;
  total: number;
  totalPermissions: number;
  percentage: number;
  badgeClass: string;
  isSystem?: boolean;
}

export function RoleOverviewCard({
  label,
  description,
  total,
  totalPermissions,
  percentage,
  badgeClass,
  isSystem,
}: RoleOverviewCardProps) {
  return (
    <Card
      className={`p-4 space-y-2 border ${badgeClass} hover:shadow-lg transition-all cursor-default`}
    >
      <div className="flex items-center justify-between">
        <p className="font-black text-sm">{label}</p>
        {isSystem ? <Lock className="h-3 w-3 opacity-50" /> : null}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black">{total}</span>
        <span className="text-xs text-muted-foreground">
          / {totalPermissions} صلاحية
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-current opacity-60 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] font-bold opacity-70 line-clamp-2">{description}</p>
    </Card>
  );
}