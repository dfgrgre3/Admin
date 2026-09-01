"use client";

import * as React from "react";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Receipt, RotateCcw, Banknote } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Payment } from "./types";
import { statusConfig, getMethodLabel } from "./constants";
import { shortId } from "./utils";
import { cn } from "@/lib/utils";

interface PaymentsTableProps {
  payments: Payment[];
  loading: boolean;
  totalRows: number;
  pageCount: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
  onExport: () => void;
  onView: (payment: Payment) => void;
  onRefund: (payment: Payment) => void;
  selectedPayments: Payment[];
  onSelectionChange: (payments: Payment[]) => void;
  canRefundSelected: boolean;
  onBulkRefund: (payments: Payment[]) => void;
}

export function PaymentsTable({
  payments,
  loading,
  totalRows,
  pageCount,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onExport,
  onView,
  onRefund,
  selectedPayments,
  onSelectionChange,
  canRefundSelected,
  onBulkRefund,
}: PaymentsTableProps) {
  const columns = React.useMemo<ColumnDef<Payment>[]>(() => {
    return [
      {
        accessorKey: "transactionId",
        header: "رقم العملية",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(var(--primary),0.1)]">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono font-black text-xs tracking-tight">
                  {p.transactionId ? shortId(p.transactionId, 12) : shortId(p.id, 8)}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold opacity-60">
                  {new Date(p.createdAt).toLocaleDateString("ar-EG")} •{" "}
                  {new Date(p.createdAt).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "user",
        header: "المستخدم",
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary text-[10px]">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-xs">{user?.name || "مستخدم"}</p>
                <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: ({ row }) => (
          <span className="font-black text-emerald-500 text-sm flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5" />
            {row.original.amount.toLocaleString()} {row.original.currency || "EGP"}
          </span>
        ),
      },
      {
        accessorKey: "subject",
        header: "الدورة/المادة",
        cell: ({ row }) => {
          const subject = row.original.subject;
          return subject ? (
            <Badge
              variant="outline"
              className="font-black text-[10px] uppercase px-3 py-1 rounded-lg bg-white/5 border-primary/20 text-primary"
            >
              {subject.nameAr || subject.name}
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
              عام
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
          const config = (statusConfig[row.original.status] || statusConfig.COMPLETED)!;
          const StatusIcon = config.icon;
          return (
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                config.bgColor
              )}
            >
              <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>
                {config.label}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "method",
        header: "طريقة الدفع",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-muted-foreground">
            {getMethodLabel(row.original.method)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                تفاصيل
              </button>
              {p.status === "COMPLETED" && (
                <button
                  onClick={() => onRefund(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  استرداد
                </button>
              )}
            </div>
          );
        },
      },
    ];
  }, [onView, onRefund]);

  return (
    <AdminDataTable
      columns={columns}
      data={payments}
      loading={loading}
      serverSide
      virtualized
      selectable
      onSelectionChange={onSelectionChange}
      totalRows={totalRows}
      pageCount={pageCount}
      currentPage={page}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      pageSize={limit}
      columnLabels={{
        transactionId: "رقم العملية",
        user: "المستخدم",
        amount: "المبلغ",
        subject: "الدورة/المادة",
        status: "الحالة",
        method: "طريقة الدفع",
        actions: "الإجراءات",
      }}
      actions={{ onRefresh, onExport }}
      bulkActions={[
        {
          label: "استرداد المحدد",
          icon: RotateCcw,
          onClick: onBulkRefund,
          variant: "destructive",
          disabled: !canRefundSelected,
        },
      ]}
      emptyMessage={{
        title: "لا توجد معاملات",
        description: "لم يتم العثور على معاملات مطابقة للفلاتر الحالية.",
      }}
    />
  );
}
