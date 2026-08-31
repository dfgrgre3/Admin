"use client";

import { BadgeCheck, Globe } from "lucide-react";
import { RoleBadge } from "@/components/admin/ui/admin-badge";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

export const phoneColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "phone",
  header: "الهاتف",
  cell: ({ row }) => (
    <div className="flex flex-col">
      <span className="text-sm font-bold" dir="ltr">{row.original.phone || "—"}</span>
      {row.original.phoneVerified && (
        <span className="text-[10px] text-success font-bold flex items-center gap-1">
          <BadgeCheck className="h-3 w-3" /> موثق
        </span>
      )}
    </div>
  ),
};

export const roleColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "role",
  header: "الدور",
  cell: ({ row }) => <RoleBadge role={row.original.role} />,
};

export const countryColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "country",
  header: "الدولة",
  cell: ({ row }) => (
    <div className="flex flex-col">
      <span className="text-sm font-bold flex items-center gap-1">
        <Globe className="h-3 w-3 text-muted-foreground" />
        {row.original.country || "—"}
      </span>
      {row.original.city && <span className="text-[10px] text-muted-foreground">{row.original.city}</span>}
    </div>
  ),
};