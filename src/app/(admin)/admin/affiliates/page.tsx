"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  Gift,
  CheckCircle2,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { billingApi, Affiliate } from "@/lib/api/billing-api";
import { AffiliateFormDialog } from "./AffiliateFormDialog";
import { AffiliateReferralsDialog } from "./AffiliateReferralsDialog";
import { statusLabels, tierLabels } from "./types";

export default function AffiliatesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAffiliate, setEditingAffiliate] = React.useState<Affiliate | null>(null);
  const [referralsAffiliate, setReferralsAffiliate] = React.useState<Affiliate | null>(null);
  const [referralsOpen, setReferralsOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Affiliate | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliates"],
    queryFn: () => billingApi.listAffiliates(),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => billingApi.payAffiliate(id),
    onSuccess: (res) => {
      toast.success(`تم صرف ${res.paid.toFixed(2)} ج.م (${res.count} إحالة)`);
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    },
    onError: (err: any) => toast.error(err?.message || "فشل صرف العمولات"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billingApi.deleteAffiliate(id),
    onSuccess: () => {
      toast.success("تم حذف المسوق بنجاح");
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    },
    onError: () => toast.error("فشل حذف المسوق"),
  });

  const affiliates = (data ?? []).filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.code.toLowerCase().includes(q) ||
      a.tier.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      a.user?.email?.toLowerCase().includes(q) ||
      a.user?.name?.toLowerCase().includes(q)
    );
  });

  const totalEarned = affiliates.reduce((s, a) => s + a.totalEarned, 0);
  const totalPaid = affiliates.reduce((s, a) => s + a.totalPaid, 0);
  const activeCount = affiliates.filter((a) => a.status === "ACTIVE").length;

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingAffiliate(null);
    setFormOpen(true);
  };

  const handleViewReferrals = (affiliate: Affiliate) => {
    setReferralsAffiliate(affiliate);
    setReferralsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="المسوقون بالعمولة"
        description="إدارة نظام الأفلييت والعمولات وإحالات المسوقين."
      >
        <AdminButton icon={Plus} onClick={handleCreate}>
          إضافة مسوق
        </AdminButton>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <AdminStatsCard
          title="إجمالي الأرباح"
          value={`${totalEarned.toFixed(2)} ج.م`}
          icon={DollarSign}
          color="green"
        />
        <AdminStatsCard
          title="إجمالي المسدد"
          value={`${totalPaid.toFixed(2)} ج.م`}
          icon={CheckCircle2}
          color="blue"
        />
        <AdminStatsCard
          title="مسوقون نشطون"
          value={activeCount}
          icon={Users}
          color="violet"
        />
        <AdminStatsCard
          title="إجمالي المسوقين"
          value={affiliates.length}
          icon={Users}
          color="amber"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث بالكود، البريد، الاسم، الفئة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-3 pr-10 pl-4 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : affiliates.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">لا يوجد مسوقون بعد</p>
          <AdminButton icon={Plus} onClick={handleCreate} className="mt-4">
            إضافة أول مسوق
          </AdminButton>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-right font-bold">الكود</th>
                  <th className="p-3 text-right font-bold">المستخدم</th>
                  <th className="p-3 text-right font-bold">الفئة</th>
                  <th className="p-3 text-right font-bold">نسبة العمولة</th>
                  <th className="p-3 text-right font-bold">الأرباح</th>
                  <th className="p-3 text-right font-bold">المسدد</th>
                  <th className="p-3 text-right font-bold">المتبقي</th>
                  <th className="p-3 text-right font-bold">الحالة</th>
                  <th className="p-3 text-right font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a) => {
                  const remaining = a.totalEarned - a.totalPaid;
                  const status = statusLabels[a.status] || { label: a.status, className: "bg-muted text-muted-foreground" };
                  return (
                    <tr key={a.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold">{a.code}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {a.user?.name || a.user?.username || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {a.user?.email || ""}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {tierLabels[a.tier] || a.tier}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{a.commissionRate}%</td>
                      <td className="p-3">{a.totalEarned.toFixed(2)} ج.م</td>
                      <td className="p-3">{a.totalPaid.toFixed(2)} ج.م</td>
                      <td className="p-3">
                        <span
                          className={
                            remaining > 0
                              ? "font-bold text-amber-500"
                              : "text-muted-foreground"
                          }
                        >
                          {remaining.toFixed(2)} ج.م
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <AdminButton
                            size="icon-sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => handleViewReferrals(a)}
                            title="عرض الإحالات"
                          />
                          <AdminButton
                            size="icon-sm"
                            variant="ghost"
                            icon={Pencil}
                            onClick={() => handleEdit(a)}
                            title="تعديل"
                          />
                          <AdminButton
                            size="icon-sm"
                            variant="ghost"
                            icon={Gift}
                            onClick={() => payMutation.mutate(a.id)}
                            loading={payMutation.isPending}
                            title="صرف العمولات"
                          />
                          <AdminButton
                            size="icon-sm"
                            variant="ghost"
                            icon={Trash2}
                            onClick={() => setDeleteTarget(a)}
                            title="حذف"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <AffiliateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingAffiliate={editingAffiliate}
        onSuccess={() => {
          setFormOpen(false);
          qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
        }}
      />

      {/* Referrals Dialog */}
      <AffiliateReferralsDialog
        affiliate={referralsAffiliate}
        open={referralsOpen}
        onOpenChange={setReferralsOpen}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف المسوق"
        description={`هل أنت متأكد من حذف المسوق "${deleteTarget?.code}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </div>
  );
}
