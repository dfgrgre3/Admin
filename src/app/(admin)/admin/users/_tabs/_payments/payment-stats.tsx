"use client";

import { CheckCircle, CreditCard, TrendingUp } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "./payment-types";

interface PaymentStatsProps {
  payments: Payment[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  Icon: typeof CreditCard;
}

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </AdminCard>
  );
}

export function PaymentStats({ payments }: PaymentStatsProps) {
  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);

  const successRate =
    payments.length > 0
      ? Math.round(
          (payments.filter((p) => p.status === "completed").length /
            payments.length) *
            100,
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="إجمالي المدفوعات"
        value={formatCurrency(totalSpent)}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
        Icon={TrendingUp}
      />
      <StatCard
        label="عدد المعاملات"
        value={payments.length}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
        Icon={CreditCard}
      />
      <StatCard
        label="نسبة النجاح"
        value={`${successRate}%`}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-500"
        Icon={CheckCircle}
      />
    </div>
  );
}