"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { billingApi } from "@/lib/api/billing-api";
import {
  statusLabels,
  tierLabels,
  tierBadgeClasses,
  getAffiliateRemaining,
  Affiliate,
} from "./types";
import {
  CheckCircle2,
  Pencil,
  Gift,
  Eye,
  Copy,
  Users,
  BadgePercent,
  Wallet,
  Link2,
} from "lucide-react";

interface AffiliateDetailsDialogProps {
  affiliate: Affiliate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (affiliate: Affiliate) => void;
  onPay?: (affiliate: Affiliate) => void;
  onViewReferrals?: (affiliate: Affiliate) => void;
}

export function AffiliateDetailsDialog({
  affiliate,
  open,
  onOpenChange,
  onEdit,
  onPay,
  onViewReferrals,
}: AffiliateDetailsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliates", affiliate?.id, "details"],
    queryFn: () => billingApi.getAffiliate(affiliate!.id),
    enabled: !!affiliate && open,
  });

  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ["admin", "affiliates", affiliate?.id, "referrals"],
    queryFn: () => billingApi.listAffiliateReferrals(affiliate!.id),
    enabled: !!affiliate && open,
  });

  const detail = data?.affiliate ?? affiliate;
  const pendingCount = data?.pendingCount;
  const referrals = React.useMemo(() => referralsData ?? [], [referralsData]);

  const remaining = detail ? getAffiliateRemaining(detail) : 0;

  const breakdown = React.useMemo(() => {
    const byStatus: Record<string, { count: number; commission: number }> = {};
    for (const r of referrals) {
      const b = byStatus[r.status] ?? { count: 0, commission: 0 };
      b.count += 1;
      b.commission += r.commission;
      byStatus[r.status] = b;
    }
    return byStatus;
  }, [referrals]);

  const recentReferrals = React.useMemo(
    () =>
      [...referrals]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 8),
    [referrals]
  );

  const copyCode = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.code);
      toast.success("تم نسخ كود الإحالة");
    } catch {
      toast.error("تعذر نسخ الكود");
    }
  };

  const status = detail ? statusLabels[detail.status] || { label: detail.status, className: "bg-muted text-muted-foreground border border-border" } : null;
  const initials = (detail?.user?.name || detail?.user?.email || "؟").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />

        {isLoading && !detail ? (
          <div className="p-8 text-center text-muted-foreground py-16">جاري تحميل التفاصيل...</div>
        ) : !detail ? (
          <div className="p-8 text-center text-muted-foreground py-16">لا توجد بيانات</div>
        ) : (
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black">تفاصيل المسوق</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                نظرة شاملة على أداء حساب المسوق وعملياته المالية.
              </DialogDescription>
            </DialogHeader>

            {/* User profile header */}
            <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 rounded-2xl border border-white/10">
                {detail.user?.avatar && (
                  <AvatarImage src={detail.user.avatar} alt={detail.user?.name || ""} />
                )}
                <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-black text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black">
                    {detail.user?.name || detail.user?.username || "—"}
                  </h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status?.className}`}>
                    {status?.label}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tierBadgeClasses[detail.tier] || "bg-muted text-muted-foreground"}`}>
                    {tierLabels[detail.tier] || detail.tier}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {detail.user?.email || detail.userId}
                </p>
                <p className="text-xs text-muted-foreground">
                  مسجّل منذ {new Date(detail.createdAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2" dir="ltr">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm font-black">{detail.code}</span>
                  <button
                    onClick={copyCode}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                    title="نسخ الكود"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <BadgePercent className="h-3.5 w-3.5 text-primary" />
                  نسبة العمولة: {detail.commissionRate}%
                </span>
              </div>
            </div>

            {/* Financial stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  إجمالي الأرباح
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-500">
                  {detail.totalEarned.toFixed(2)}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">ج.م</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  إجمالي المسدد
                </p>
                <p className="mt-1 text-2xl font-black text-blue-500">{detail.totalPaid.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-muted-foreground">ج.م</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  المتبقي غير المسدد
                </p>
                <p className="mt-1 text-2xl font-black text-amber-500">{remaining.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-muted-foreground">ج.م</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  إحالات معلّقة
                </p>
                <p className="mt-1 text-2xl font-black">
                  {pendingCount ?? breakdown["PENDING"]?.count ?? 0}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">إحالة</p>
              </div>
            </div>

            {/* Breakdown by status */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-4 flex items-center gap-2 text-sm font-black">
                <Wallet className="h-4 w-4 text-primary" />
                توزيع العمولات حسب الحالة
              </p>
              {referralsLoading ? (
                <div className="text-sm text-muted-foreground py-4">جاري التحميل...</div>
              ) : referrals.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">لا توجد إحالات بعد</div>
              ) : (
                <div className="space-y-3">
                  {(["PENDING", "PAID", "CANCELLED"] as const).map((s) => {
                    const b = breakdown[s] || { count: 0, commission: 0 };
                    const pct = referrals.length ? Math.round((b.count / referrals.length) * 100) : 0;
                    const color =
                      s === "PENDING" ? "bg-amber-500" : s === "PAID" ? "bg-blue-500" : "bg-muted";
                    const label = statusLabels[s]?.label || s;
                    return (
                      <div key={s}>
                        <div className="mb-1 flex items-center justify-between text-xs font-bold">
                          <span>{label}</span>
                          <span className="text-muted-foreground">
                            {b.count} إحالة · {b.commission.toFixed(2)} ج.م ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent referrals */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-4 flex items-center gap-2 text-sm font-black">
                <Users className="h-4 w-4 text-primary" />
                أحدث الإحالات
              </p>
              {referralsLoading ? (
                <div className="text-sm text-muted-foreground py-4">جاري التحميل...</div>
              ) : recentReferrals.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">لا توجد إحالات بعد</div>
              ) : (
                <div className="space-y-2">
                  {recentReferrals.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{r.user?.name || r.user?.email || r.userId}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold">{r.amount.toFixed(2)} ج.م</p>
                        <p className="text-[10px] font-bold text-emerald-500">
                          +{r.commission.toFixed(2)} ج.م
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusLabels[r.status]?.className || "bg-muted text-muted-foreground"}`}>
                        {statusLabels[r.status]?.label || r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {onViewReferrals && (
                <AdminButton variant="outline" icon={Eye} onClick={() => onViewReferrals(detail)}>
                  كل الإحالات
                </AdminButton>
              )}
              {remaining > 0 && onPay && (
                <AdminButton variant="outline" icon={Gift} onClick={() => onPay(detail)}>
                  صرف العمولات
                </AdminButton>
              )}
              {onEdit && (
                <AdminButton variant="outline" icon={Pencil} onClick={() => onEdit(detail)}>
                  تعديل
                </AdminButton>
              )}
              <AdminButton
                icon={CheckCircle2}
                onClick={() => onOpenChange(false)}
                className="h-11 px-6 text-sm font-black rounded-2xl"
              >
                إغلاق
              </AdminButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
