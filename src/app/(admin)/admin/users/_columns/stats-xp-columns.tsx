"use client";

import { Award, BookOpen, Monitor, Package, Wallet, Zap } from "lucide-react";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

interface CountsDeps {
  canViewFinancial: boolean;
  canManageUsers: boolean;
}

const createCountsColumn = (deps: CountsDeps): ColumnDef<AdminUserListItem> => ({
  id: "counts",
  header: "الإحصائيات",
  cell: ({ row }) => (
    <div className="flex items-center gap-2 flex-wrap">
      {(deps.canViewFinancial || deps.canManageUsers) && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الرصيد">
          <Wallet className="h-3 w-3" />{row.original.walletBalance || 0}
        </span>
      )}
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الكورسات">
        <BookOpen className="h-3 w-3" />{row.original.coursesCount ?? row.original._count?.courses ?? 0}
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الطلبات">
        <Package className="h-3 w-3" />{row.original.ordersCount ?? row.original._count?.orders ?? 0}
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الشهادات">
        <Award className="h-3 w-3" />{row.original.certificatesCount ?? row.original._count?.certificates ?? 0}
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الأجهزة">
        <Monitor className="h-3 w-3" />{row.original.devicesCount ?? row.original._count?.devices ?? 0}
      </span>
    </div>
  ),
});

export const xpColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "totalXP",
  header: "نقاط التفاعل",
  cell: ({ row }) => (
    <div className="flex flex-col">
      <span className="font-black text-primary flex items-center gap-1">
        <Zap className="w-3 h-3 fill-primary" />
        {(row.original.totalXP || 0).toLocaleString()} نقطة
      </span>
      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
        {row.original._count?.tasks || 0} نشاط مكتمل
      </span>
    </div>
  ),
};

export const getCountsColumn = (deps: CountsDeps) => createCountsColumn(deps);