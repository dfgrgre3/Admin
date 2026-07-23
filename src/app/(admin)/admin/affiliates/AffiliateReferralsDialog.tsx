"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing-api";
import { statusLabels, Affiliate } from "./types";
import { X } from "lucide-react";

interface AffiliateReferralsDialogProps {
  affiliate: Affiliate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AffiliateReferralsDialog({
  affiliate,
  open,
  onOpenChange,
}: AffiliateReferralsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliates", affiliate?.id, "referrals"],
    queryFn: () => billingApi.listAffiliateReferrals(affiliate!.id),
    enabled: !!affiliate && open,
  });

  const referrals = data ?? [];
  const totalCommission = referrals.reduce((s, r) => s + r.commission, 0);
  const pendingCommission = referrals
    .filter((r) => r.status === "PENDING")
    .reduce((s, r) => s + r.commission, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">
              إحالات المسوق: {affiliate?.code}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              عرض جميع الإحالات والعمولات الخاصة بهذا المسوق.
            </DialogDescription>
          </DialogHeader>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                إجمالي الإحالات
              </p>
              <p className="text-2xl font-black">{referrals.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                إجمالي العمولات
              </p>
              <p className="text-2xl font-black text-emerald-500">
                {totalCommission.toFixed(2)} ج.م
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                العمولات المعلّقة
              </p>
              <p className="text-2xl font-black text-amber-500">
                {pendingCommission.toFixed(2)} ج.م
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              لا توجد إحالات لهذا المسوق بعد
            </div>
          ) : (
            <div className="max-h-[400px] overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-3 text-right font-bold">المستخدم المحال</th>
                    <th className="p-3 text-right font-bold">المبلغ</th>
                    <th className="p-3 text-right font-bold">العمولة</th>
                    <th className="p-3 text-right font-bold">الحالة</th>
                    <th className="p-3 text-right font-bold">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="p-3">{r.user?.name || r.user?.email || r.userId}</td>
                      <td className="p-3">{r.amount.toFixed(2)} ج.م</td>
                      <td className="p-3 font-bold text-emerald-500">
                        {r.commission.toFixed(2)} ج.م
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            statusLabels[r.status]?.className || "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusLabels[r.status]?.label || r.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
