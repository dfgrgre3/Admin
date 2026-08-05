"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, ArrowDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  method: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
  subject?: string;
  description?: string;
}

interface UserPaymentsTabProps {
  userId: string;
}

export function UserPaymentsTab({ userId: _userId }: UserPaymentsTabProps) {
  const [payments] = React.useState<Payment[]>([]);
  const [loading] = React.useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />مكتمل</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />معلق</Badge>;
      case "failed":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />فاشل</Badge>;
      case "refunded":
        return <Badge variant="outline" className="gap-1"><ArrowDown className="h-3 w-3" />مسترد</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);

  if (loading) {
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

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي المدفوعات</p>
              <p className="text-2xl font-black">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">عدد المعاملات</p>
              <p className="text-2xl font-black">{payments.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">نسبة النجاح</p>
              <p className="text-2xl font-black">
                {payments.length > 0
                  ? Math.round((payments.filter((p) => p.status === "completed").length / payments.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Payments List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">سجل المدفوعات</h3>
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد مدفوعات</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
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
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}