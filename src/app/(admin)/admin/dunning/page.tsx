"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { billingApi } from "@/lib/api/billing-api";

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE: { label: "قيد المتابعة", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  RECOVERED: { label: "تم التحصيل", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELLED: { label: "ملغي", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  PAUSED: { label: "متوقف", color: "bg-gray-100 text-gray-700", icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function DunningPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dunning"],
    queryFn: () => billingApi.listDunning(),
  });

  const records = data ?? [];
  const active = records.filter((r) => r.status === "ACTIVE").length;
  const recovered = records.filter((r) => r.status === "RECOVERED").length;
  const cancelled = records.filter((r) => r.status === "CANCELLED").length;
  const atRisk = records
    .filter((r) => r.status === "ACTIVE")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="إدارة فشل الدفع (Dunning)" description="متابعة محاولات تحصيل الاشتراكات الفاشلة وإعادة المحاولة التلقائية" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <AdminStatsCard title="قيد المتابعة" value={active} icon={Clock} />
        <AdminStatsCard title="تم التحصيل" value={recovered} icon={CheckCircle2} />
        <AdminStatsCard title="ملغاة" value={cancelled} icon={XCircle} />
        <AdminStatsCard title="مبلغ معرض للخطر" value={`${atRisk.toFixed(2)} ج.م`} icon={AlertTriangle} />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-right">المستخدم</th>
                <th className="p-3 text-right">المبلغ</th>
                <th className="p-3 text-right">المحاولات</th>
                <th className="p-3 text-right">الإيميلات</th>
                <th className="p-3 text-right">المحاولة القادمة</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const meta = statusMeta[r.status] ?? statusMeta.PAUSED;
                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{r.userId.slice(0, 8)}</td>
                    <td className="p-3">{r.amount.toFixed(2)} {r.currency}</td>
                    <td className="p-3">{r.attempts}/{r.maxAttempts}</td>
                    <td className="p-3">{r.emailsSent}</td>
                    <td className="p-3">{new Date(r.nextRetryAt).toLocaleDateString("ar-EG")}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${meta?.color ?? statusMeta.PAUSED!.color}`}>
                        {meta?.icon} {meta?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">لا توجد سجلات دunning</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
