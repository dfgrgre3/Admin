"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useInstructorPayouts } from "@/hooks/use-instructors";

interface InstructorPayoutsTabProps {
  instructorId: string;
}

export function InstructorPayoutsTab({ instructorId }: InstructorPayoutsTabProps) {
  const { data: payoutsData, isLoading } = useInstructorPayouts(instructorId);
  const payouts = payoutsData?.payouts || [];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "معلق", variant: "secondary", icon: Clock },
      processing: { label: "قيد المعالجة", variant: "default", icon: Clock },
      completed: { label: "مكتمل", variant: "default", icon: CheckCircle },
      failed: { label: "فاشل", variant: "destructive", icon: XCircle },
      cancelled: { label: "ملغى", variant: "outline", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    if (!config) {
      return <Badge variant="secondary">معلق</Badge>;
    }
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: "تحويل بنكي",
      paypal: "PayPal",
      stripe: "Stripe",
      other: "أخرى",
    };
    return labels[method] || method;
  };

  if (isLoading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي المدفوعات</p>
              <p className="text-2xl font-black">{formatCurrency(payouts.reduce((sum, p) => sum + p.amount, 0))}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">مكتملة</p>
              <p className="text-2xl font-black">
                {payouts.filter((p) => p.status === "completed").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">قيد المعالجة</p>
              <p className="text-2xl font-black">
                {payouts.filter((p) => p.status === "pending" || p.status === "processing").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">فاشلة</p>
              <p className="text-2xl font-black">
                {payouts.filter((p) => p.status === "failed").length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Payouts List */}
      <AdminCard variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">المدفوعات</h3>
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
        {payouts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد مدفوعات</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{formatCurrency(payout.amount)}</p>
                      <p className="text-xs text-muted-foreground">{payout.referenceNumber || payout.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(payout.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">طريقة الدفع</p>
                    <p className="font-bold">{getMethodLabel(payout.method)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">الفترة</p>
                    <p className="font-bold">
                      {formatDate(payout.period.startDate)} - {formatDate(payout.period.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">الطلبات</p>
                    <p className="font-bold">{payout.transactions} عملية • {payout.students} طالب</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">تاريخ الطلب</p>
                    <p className="font-bold">{formatDate(payout.requestedAt)}</p>
                  </div>
                </div>
                {payout.failureReason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500 font-bold mb-1">سبب الفشل</p>
                    <p className="text-sm text-white">{payout.failureReason}</p>
                  </div>
                )}
                {payout.completedAt && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    تم الإتمام: {formatDate(payout.completedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}