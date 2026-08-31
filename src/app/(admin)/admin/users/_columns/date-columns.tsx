"use client";

import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

const formatArabicDate = (value: string) => new Date(value).toLocaleDateString("ar-EG");
const formatArabicTime = (value: string) => new Date(value).toLocaleTimeString("ar-EG");

export const createdAtColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "createdAt",
  header: "تاريخ التسجيل",
  cell: ({ row }) => (
    <div className="flex flex-col">
      <span className="text-sm font-black">{formatArabicDate(row.original.createdAt)}</span>
      <span className="text-[10px] text-muted-foreground font-bold italic">
        منذ {Math.max(0, Math.floor((Date.now() - new Date(row.original.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} يوم
      </span>
    </div>
  ),
};

export const lastLoginColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "lastLogin",
  header: "آخر دخول",
  cell: ({ row }) =>
    row.original.lastLogin ? (
      <div>
        <p className="text-sm font-bold">{formatArabicDate(row.original.lastLogin)}</p>
        <p className="text-[10px] text-muted-foreground">{formatArabicTime(row.original.lastLogin)}</p>
      </div>
    ) : (
      <span className="text-xs text-muted-foreground">لم يسجل دخولًا</span>
    ),
};