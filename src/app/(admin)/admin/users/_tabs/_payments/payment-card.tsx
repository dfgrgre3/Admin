"use client";

import { CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "./payment-types";
import { PaymentStatusBadge } from "./payment-status-badge";

interface PaymentCardProps {
  payment: Payment;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold text-white">
            {payment.description || payment.subject || "دفعة"}
          </p>
          <p className="text-sm text-muted-foreground">
            {payment.method} • {payment.reference}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(payment.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-left">
          <p className="text-lg font-black text-primary">
            {formatCurrency(payment.amount)}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>
    </div>
  );
}