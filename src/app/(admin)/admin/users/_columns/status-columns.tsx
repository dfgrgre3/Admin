"use client";

import { StatusBadge } from "@/components/admin/ui/admin-badge";
import { UserStatus } from "@/types/enums";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

const resolveStatus = (status: UserStatus): "active" | "suspended" | "pending" | "inactive" => {
  if (status === UserStatus.ACTIVE) return "active";
  if (status === UserStatus.SUSPENDED || status === UserStatus.BANNED) return "suspended";
  if (status === UserStatus.PENDING_VERIFICATION) return "pending";
  return "inactive";
};

export const statusColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "status",
  header: "الحالة",
  cell: ({ row }) => (
    <div className="flex flex-col gap-1">
      <StatusBadge status={resolveStatus(row.original.status)} />
      {row.original.isOnline && (
        <span className="text-[10px] text-success font-black flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          متصل الآن
        </span>
      )}
    </div>
  ),
};

export const verificationColumn: ColumnDef<AdminUserListItem> = {
  id: "verification",
  header: "التوثيق",
  cell: ({ row }) => (
    <div className="flex flex-wrap gap-1">
      <StatusBadge status={row.original.emailVerified ? "verified" : "unverified"} />
      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.original.phoneVerified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>الهاتف</span>
      {row.original.twoFactorEnabled && (
        <span className="rounded-full px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary">2FA</span>
      )}
    </div>
  ),
};