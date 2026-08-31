"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import type { Payment } from "./payment-types";
import { PaymentCard } from "./payment-card";

interface PaymentListProps {
  payments: Payment[];
}

export function PaymentList({ payments }: PaymentListProps) {
  return (
    <AdminCard variant="glass" className="p-6">
      <h3 className="text-xl font-black mb-4">سجل المدفوعات</h3>
      {payments.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد مدفوعات</p>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </AdminCard>
  );
}

export function PaymentLoadingState() {
  return (
    <AdminCard variant="glass" className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}