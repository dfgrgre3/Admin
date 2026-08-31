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
import { statusLabels, Affiliate, AffiliateReferral } from "./types";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Download,
  Search,
} from "lucide-react";

interface AffiliateReferralsDialogProps {
  affiliate: Affiliate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StatusFilter = "ALL" | "PENDING" | "PAID" | "CANCELLED";

export function AffiliateReferralsDialog({
  affiliate,
  open,
  onOpenChange,
}: AffiliateReferralsDialogProps) {
  const [filter, setFilter] = React.useState<StatusFilter>("ALL");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setFilter("ALL");
      setSearch("");
    }
  }, [open, affiliate?.id]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "affiliates", affiliate?.id, "referrals"],
    queryFn: () => billingApi.listAffiliateReferrals(affiliate!.id),
    enabled: !!affiliate && open,
  });

  const referrals = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q)
      );
    });
  }, [data, filter, search]);

  const totalCommission = referrals.reduce((s, r) => s + r.commission, 0);
  const pendingCommission = referrals
    .filter((r) => r.status === "PENDING")
    .reduce((s, r) => s + r.commission, 0);
  const paidCommission = referrals
    .filter((r) => r.status === "PAID")
    .reduce((s, r) => s + r.commission, 0);

  const handleExport = () => {
    if (!referrals.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const cols: ExportColumn<AffiliateReferral>[] = [
      { header: "المستخدم المحال", accessor: (r) => r.user?.name || r.user?.email || r.userId },
      { header: "المبلغ", accessor: (r) => r.amount },
      { header: "العمولة", accessor: (r) => r.commission },
      { header: "الحالة", accessor: (r) => statusLabels[r.status]?.label || r.status },
      { header: "التاريخ", accessor: (r) => new Date(r.createdAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(referrals, cols, `affiliate-referrals-${affiliate?.code}`);
    toast.success("تم تصدير الإحالات بنجاح");
  };

  const tabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: "ALL", label: "الكل", count: data?.length ?? 0 },
    { value: "PENDING", label: "قيد الانتظار", count: (data ?? []).filter((r) => r.status === "PENDING").length },
    { value: "PAID", label: "مدفوع", count: (data ?? []).filter((r) => r.status === "PAID").length },
    { value: "CANCELLED", label: "ملغي", count: (data ?? []).filter((r) => r.status === "CANCELLED").length },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-black">
                  إحالات المسوق: {affiliate?.code}
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">
                  عرض جميع الإحالات والعمولات الخاصة بهذا المسوق.
                </DialogDescription>
              </div>
              <AdminButton
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
                disabled={isLoading || !referrals.length}
              >
                تصدير
              </AdminButton>
            </div>
          </DialogHeader>

          {/* Summary cards */}
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <Users className="h-3.5 w-3.5" /> إجمالي الإحالات
              </p>
              <p className="mt-1 text-2xl font-black">{referrals.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <DollarSign className="h-3.5 w-3.5" /> إجمالي العمولات
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-500">
                {totalCommission.toFixed(2)} ج.م
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <Clock className="h-3.5 w-3.5" /> المعلّقة
              </p>
              <p className="mt-1 text-2xl font-black text-amber-500">
                {pendingCommission.toFixed(2)} ج.م
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <CheckCircle2 className="h-3.5 w-3.5" /> المدفوعة
              </p>
              <p className="mt-1 text-2xl font-black text-blue-500">{paidCommission.toFixed(2)} ج.م</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${
                    filter === tab.value
                      ? tab.value === "PENDING"
                        ? "bg-amber-500 text-white"
                        : tab.value === "PAID"
                        ? "bg-blue-500 text-white"
                        : tab.value === "CANCELLED"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو البريد..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pr-10 pl-4 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              لا توجد إحالات مطابقة
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
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{r.user?.name || r.user?.email || "—"}</span>
                          {r.user?.name && (
                            <span className="text-[11px] text-muted-foreground" dir="ltr">
                              {r.user?.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{r.amount.toFixed(2)} ج.م</td>
                      <td className="p-3 font-bold text-emerald-500">
                        +{r.commission.toFixed(2)} ج.م
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

          {isFetching && !isLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">جارٍ التحديث...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
