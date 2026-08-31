"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

export const selectionColumn: ColumnDef<AdminUserListItem> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="تحديد الكل"
      className="translate-y-[2px] border-white/20"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="تحديد الصف"
      className="translate-y-[2px] border-white/20"
    />
  ),
  enableSorting: false,
  enableHiding: false,
};