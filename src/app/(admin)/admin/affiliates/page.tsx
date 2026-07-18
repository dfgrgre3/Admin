"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, DollarSign, Gift, CheckCircle2 } from "lucide-react";
import { billingApi } from "@/lib/api/billing-api";

export default function AffiliatesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliates"],
    queryFn: () => billingApi.listAffiliates(),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => billingApi.payAffiliate(id),
    onSuccess: (res) => {
      toast.success(`تم صرف عمولات بقيمة ${res.paid.toFixed(2)} ج.م`);
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    },
    onError: () => toast.error("فشل صرف العمولات"),
  });

  const affiliates = data ?? [];
  const totalEarned = affiliates.reduce((s, a) => s + a.totalEarned, 0);
  const totalPaid = affiliates.reduce((s, a) => s + a.totalPaid, 0);
  const pending = affiliates.filter((a) => a.status === "PENDING" || a.status === "PAID").length;

  return (
    <div className="space-y-6">
      <PageHeader title="المسوقون بالعمولة" description="إدارة نظام الأفلييت والعمولات" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatsCard title="إجمالي الأرباح" value={`${totalEarned.toFixed(2)} ج.م`} icon={DollarSign} />
        <AdminStatsCard title="إجمالي المسدد" value={`${totalPaid.toFixed(2)} ج.م`} icon={CheckCircle2} />
        <AdminStatsCard title="مسوقون نشطون" value={pending} icon={Users} />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-right">الكود</th>
                <th className="p-3 text-right">الفئة</th>
                <th className="p-3 text-right">نسبة العمولة</th>
                <th className="p-3 text-right">الأرباح</th>
                <th className="p-3 text-right">المسدد</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3 font-mono">{a.code}</td>
                  <td className="p-3">{a.tier}</td>
                  <td className="p-3">{a.commissionRate}%</td>
                  <td className="p-3">{a.totalEarned.toFixed(2)} ج.م</td>
                  <td className="p-3">{a.totalPaid.toFixed(2)} ج.م</td>
                  <td className="p-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{a.status}</span>
                  </td>
                  <td className="p-3">
                    <AdminButton size="sm" variant="outline" onClick={() => payMutation.mutate(a.id)}>
                      <Gift className="mr-1 h-3 w-3" /> صرف
                    </AdminButton>
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">لا يوجد مسوقون بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
