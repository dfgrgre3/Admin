"use client";

import { Wallet } from "lucide-react";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

interface PaymentColumnDeps {
  canViewFinancial: boolean;
}

const PAYMENT_LABELS: Record<string, { label: string; cls: string }> = {
  PAID: { label: "مدفوع", cls: "bg-success/10 text-success" },
  OVERDUE: { label: "متأخر عن السداد", cls: "bg-danger/10 text-danger" },
  TRIAL: { label: "فترة تجريبية", cls: "bg-amber-500/10 text-amber-600" },
};

const createPaymentColumn = (deps: PaymentColumnDeps): ColumnDef<AdminUserListItem> => ({
  id: "payment",
  header: "حالة الدفع",
  cell: ({ row }) => {
    const { paymentStatus, trialEndsAt } = row.original;
    if (!deps.canViewFinancial) {
      return <span className="text-xs text-muted-foreground">مخفي</span>;
    }
    const entry = PAYMENT_LABELS[paymentStatus as string] ?? { label: "بدون دفع", cls: "bg-muted/50 text-muted-foreground" };
    return (
      <div className="flex flex-col">
        <span className={`text-[11px] font-black rounded-full px-2 py-0.5 w-fit ${entry.cls}`}>{entry.label}</span>
        {paymentStatus === "TRIAL" && trialEndsAt && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            تنتهي {new Date(trialEndsAt).toLocaleDateString("ar-EG")}
          </span>
        )}
      </div>
    );
  },
});

const createWalletColumn = (deps: PaymentColumnDeps): ColumnDef<AdminUserListItem> => ({
  id: "wallet",
  header: "الرصيد",
  cell: ({ row }) =>
    deps.canViewFinancial ? (
      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
        <Wallet className="h-3.5 w-3.5" />
        {(row.original.walletBalance || 0).toLocaleString()} ج.م
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">مخفي</span>
    ),
});

export const getPaymentColumn = (deps: PaymentColumnDeps) => createPaymentColumn(deps);
export const getWalletColumn = (deps: PaymentColumnDeps) => createWalletColumn(deps);