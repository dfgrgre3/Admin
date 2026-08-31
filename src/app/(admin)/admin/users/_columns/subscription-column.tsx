"use client";

import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

const SUBSCRIPTION_LABELS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "نشط", cls: "bg-success/10 text-success" },
  EXPIRED: { label: "منتهي", cls: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "ملغي", cls: "bg-warning/10 text-warning" },
};

export const subscriptionColumn: ColumnDef<AdminUserListItem> = {
  id: "subscription",
  header: "الاشتراك",
  cell: ({ row }) => {
    const sub = row.original.subscriptionStatus;
    const entry = SUBSCRIPTION_LABELS[sub as string] ?? { label: "بدون", cls: "bg-muted/50 text-muted-foreground" };
    return (
      <div className="flex flex-col">
        <span className={`text-[11px] font-black rounded-full px-2 py-0.5 w-fit ${entry.cls}`}>{entry.label}</span>
        {row.original.subscriptionExpiresAt && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            حتى {new Date(row.original.subscriptionExpiresAt).toLocaleDateString("ar-EG")}
          </span>
        )}
      </div>
    );
  },
};