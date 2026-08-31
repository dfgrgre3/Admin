"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  CheckCircle2,
  Plus,
  Eye,
  Trash2,
  Search,
  Clock,
  BadgePercent,
  Copy,
  Gift,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Download,
} from "lucide-react";
import { billingApi, Affiliate } from "@/lib/api/billing-api";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { AffiliateFormDialog } from "./AffiliateFormDialog";
import { AffiliateReferralsDialog } from "./AffiliateReferralsDialog";
import { AffiliateDetailsDialog } from "./AffiliateDetailsDialog";
import {
  statusLabels,
  tierLabels,
  tierBadgeClasses,
  getAffiliateRemaining,
} from "./types";

type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

export default function AffiliatesPage() {
  const qc = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.MARKETING_MANAGE);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [tierFilter, setTierFilter] = React.useState("ALL");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAffiliate, setEditingAffiliate] = React.useState<Affiliate | null>(null);
  const [detailsAffiliate, setDetailsAffiliate] = React.useState<Affiliate | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [referralsAffiliate, setReferralsAffiliate] = React.useState<Affiliate | null>(null);
  const [referralsOpen, setReferralsOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Affiliate | null>(null);
  const [payTarget, setPayTarget] = React.useState<Affiliate | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "affiliates"],
    queryFn: () => billingApi.listAffiliates(),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => billingApi.payAffiliate(id),
    onSuccess: (res) => {
      toast.success(`تم صرف ${res.paid.toFixed(2)} ج.م (${res.count} إحالة)`);
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      setPayTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "فشل صرف العمولات");
      setPayTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billingApi.deleteAffiliate(id),
    onSuccess: () => {
      toast.success("تم حذف المسوق بنجاح");
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("فشل حذف المسوق");
      setDeleteTarget(null);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      Promise.all(ids.map((id) => billingApi.updateAffiliate(id, { status }))),
    onSuccess: (_res, vars) => {
      toast.success(`تم تحديث حالة ${vars.ids.length} مسوق`);
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    },
    onError: () => toast.error("فشل تحديث حالة المسوقين"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => billingApi.deleteAffiliate(id))),
    onSuccess: (_res, ids) => {
      toast.success(`تم حذف ${ids.length} مسوق`);
      qc.invalidateQueries({ queryKey: ["admin", "affiliates"] });
    },
    onError: () => toast.error("فشل حذف المسوقين المحددين"),
  });

  // Apply status + tier filters (stats stay stable while typing in search)
  const baseFiltered = React.useMemo(
    () =>
      (data ?? []).filter(
        (a) =>
          (statusFilter === "ALL" || a.status === statusFilter) &&
          (tierFilter === "ALL" || a.tier === tierFilter)
      ),
    [data, statusFilter, tierFilter]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseFiltered;
    return baseFiltered.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.tier.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.user?.email?.toLowerCase().includes(q) ||
        a.user?.name?.toLowerCase().includes(q) ||
        a.user?.username?.toLowerCase().includes(q)
    );
  }, [baseFiltered, search]);

  const totalEarned = baseFiltered.reduce((s, a) => s + a.totalEarned, 0);
  const totalPaid = baseFiltered.reduce((s, a) => s + a.totalPaid, 0);
  const pendingCommissions = baseFiltered.reduce((s, a) => s + getAffiliateRemaining(a), 0);
  const activeCount = baseFiltered.filter((a) => a.status === "ACTIVE").length;
  const avgRate = baseFiltered.length
    ? baseFiltered.reduce((s, a) => s + a.commissionRate, 0) / baseFiltered.length
    : 0;

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`تم نسخ الكود ${code}`);
    } catch {
      // clipboard unavailable
    }
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const cols: ExportColumn<Affiliate>[] = [
      { header: "الكود", accessor: (a) => a.code },
      { header: "الاسم", accessor: (a) => a.user?.name || a.user?.username || "" },
      { header: "البريد", accessor: (a) => a.user?.email || "" },
      { header: "الفئة", accessor: (a) => tierLabels[a.tier] || a.tier },
      { header: "نسبة العمولة", accessor: (a) => a.commissionRate },
      { header: "الأرباح", accessor: (a) => a.totalEarned },
      { header: "المسدد", accessor: (a) => a.totalPaid },
      { header: "المتبقي", accessor: (a) => getAffiliateRemaining(a) },
      { header: "الحالة", accessor: (a) => statusLabels[a.status]?.label || a.status },
      { header: "تاريخ التسجيل", accessor: (a) => formatDate(a.createdAt) },
    ];
    exportToCSV(filtered, cols, "affiliates");
    toast.success("تم تصدير المسوقين بنجاح");
  };

  const columns = React.useMemo<ColumnDef<Affiliate>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="تحديد الكل"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="تحديد الصف"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "code",
        header: "الكود",
        cell: ({ row }) => (
          <button
            onClick={() => copyCode(row.original.code)}
            className="group flex items-center gap-1.5 font-mono font-black text-primary hover:underline"
            title="نسخ كود الإحالة"
          >
            {row.original.code}
            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        ),
      },
      {
        accessorKey: "user",
        header: "المستخدم",
        cell: ({ row }) => {
          const u = row.original.user;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-xl">
                {u?.avatar && <AvatarImage src={u.avatar} alt={u?.name || ""} />}
                <AvatarFallback className="rounded-xl bg-primary/10 text-[10px] font-black text-primary">
                  {(u?.name || u?.email || "؟").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{u?.name || u?.username || "—"}</span>
                <span className="text-[11px] text-muted-foreground" dir="ltr">
                  {u?.email || row.original.userId.slice(0, 8)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "tier",
        header: "الفئة",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              tierBadgeClasses[row.original.tier] || "bg-muted text-muted-foreground"
            }`}
          >
            {tierLabels[row.original.tier] || row.original.tier}
          </span>
        ),
      },
      {
        accessorKey: "commissionRate",
        header: "نسبة العمولة",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-sm font-black">
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
            {row.original.commissionRate}%
          </span>
        ),
      },
      {
        accessorKey: "totalEarned",
        header: "الأرباح",
        cell: ({ row }) => (
          <span className="font-bold text-emerald-500">
            {row.original.totalEarned.toFixed(2)} ج.م
          </span>
        ),
      },
      {
        accessorKey: "totalPaid",
        header: "المسدد",
        cell: ({ row }) => (
          <span className="font-bold text-blue-500">{row.original.totalPaid.toFixed(2)} ج.م</span>
        ),
      },
      {
        accessorFn: (a) => getAffiliateRemaining(a),
        id: "remaining",
        header: "المتبقي",
        cell: ({ row }) => {
          const remaining = getAffiliateRemaining(row.original);
          return remaining > 0 ? (
            <span className="font-black text-amber-500">{remaining.toFixed(2)} ج.م</span>
          ) : (
            <span className="text-muted-foreground">0.00 ج.م</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
          const s = statusLabels[row.original.status] || {
            label: row.original.status,
            className: "bg-muted text-muted-foreground",
          };
          return (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.className}`}>
              {s.label}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "تاريخ التسجيل",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "إجراءات",
        cell: ({ row }) => {
          const a = row.original;
          const remaining = getAffiliateRemaining(a);
          return (
            <RowActions
              row={a}
              onView={() => {
                setDetailsAffiliate(a);
                setDetailsOpen(true);
              }}
              onEdit={canManage ? () => handleEdit(a) : undefined}
              onDelete={canManage ? () => setDeleteTarget(a) : undefined}
              extraActions={[
                {
                  icon: Eye,
                  label: "عرض الإحالات",
                  onClick: (aff) => handleViewReferrals(aff),
                },
                {
                  icon: Gift,
                  label: "صرف العمولات",
                  onClick: (aff) => setPayTarget(aff),
                  disabled: remaining <= 0 || !canManage,
                  disabledReason: remaining <= 0 ? "لا توجد عمولات معلقة" : undefined,
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage]
  );

  const columnLabels: Record<string, string> = {
    code: "الكود",
    user: "المستخدم",
    tier: "الفئة",
    commissionRate: "نسبة العمولة",
    totalEarned: "الأرباح",
    totalPaid: "المسدد",
    remaining: "المتبقي",
    status: "الحالة",
    createdAt: "تاريخ التسجيل",
    actions: "الإجراءات",
  };

  const handleCreate = () => {
    setEditingAffiliate(null);
    setFormOpen(true);
  };

  const handleEdit = (affiliate: Affiliate) => {
    setDetailsOpen(false);
    setEditingAffiliate(affiliate);
    setFormOpen(true);
  };

  const handleViewReferrals = (affiliate: Affiliate) => {
    setDetailsOpen(false);
    setReferralsAffiliate(affiliate);
    setReferralsOpen(true);
  };

  const statusTabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: "ALL", label: "الكل", count: data?.length ?? 0 },
    { value: "ACTIVE", label: "نشط", count: (data ?? []).filter((a) => a.status === "ACTIVE").length },
    { value: "PENDING", label: "قيد الانتظار", count: (data ?? []).filter((a) => a.status === "PENDING").length },
    { value: "SUSPENDED", label: "موقوف", count: (data ?? []).filter((a) => a.status === "SUSPENDED").length },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="المسوقون بالعمولة"
        description="إدارة نظام الأفلييت والعمولات وإحالات المسوقين، مع متابعة الأداء وصرف العمولات."
        eyebrow="التسويق"
        badge={(data?.length ?? 0).toLocaleString()}
      >
        {canManage && (
          <AdminButton icon={Plus} onClick={handleCreate}>
            إضافة مسوق
          </AdminButton>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="إجمالي الأرباح"
          value={totalEarned.toFixed(2)}
          icon={TrendingUp}
          color="green"
          description="إجمالي العمولات المحققة"
        />
        <AdminStatsCard
          title="إجمالي المسدد"
          value={totalPaid.toFixed(2)}
          icon={CheckCircle2}
          color="blue"
          description="عمولات تم صرفها"
        />
        <AdminStatsCard
          title="عمولات معلقة"
          value={pendingCommissions.toFixed(2)}
          icon={Clock}
          color="amber"
          description="بانتظار الصرف"
        />
        <AdminStatsCard
          title="مسوقون نشطون"
          value={activeCount}
          icon={Users}
          color="violet"
          description={`من إجمالي ${baseFiltered.length} مسوق · متوسط العمولة ${avgRate.toFixed(1)}%`}
        />
      </div>

      {/* Status tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as StatusFilter)}
          className="w-full"
        >
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-0 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
            {statusTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary whitespace-nowrap ${
                  tab.value === "ACTIVE"
                    ? "data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                    : tab.value === "PENDING"
                    ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                    : tab.value === "SUSPENDED"
                    ? "data-[state=active]:bg-red-500 data-[state=active]:text-white"
                    : ""
                }`}
              >
                {tab.label}
                <span className="mr-1 text-xs opacity-70">({tab.count})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary"
          >
            <option value="ALL">كل الفئات</option>
            {Object.entries(tierLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          selectable
          pageSize={10}
          columnLabels={columnLabels}
          actions={{
            onExport: handleExport,
            onRefresh: () => refetch(),
          }}
          toolbar={
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالكود، البريد، الاسم، الفئة..."
                className="h-10 w-full rounded-xl border border-border bg-accent/10 px-4 pr-10 text-sm font-bold outline-none ring-primary transition focus:ring-1"
              />
            </div>
          }
          bulkActions={[
            {
              label: "تصدير المحدد",
              icon: Download,
              onClick: (rows) => {
                if (!rows.length) return;
                const cols: ExportColumn<Affiliate>[] = [
                  { header: "الكود", accessor: (a) => a.code },
                  { header: "الاسم", accessor: (a) => a.user?.name || "" },
                  { header: "البريد", accessor: (a) => a.user?.email || "" },
                  { header: "الأرباح", accessor: (a) => a.totalEarned },
                  { header: "المسدد", accessor: (a) => a.totalPaid },
                  { header: "المتبقي", accessor: (a) => getAffiliateRemaining(a) },
                  { header: "الحالة", accessor: (a) => statusLabels[a.status]?.label || a.status },
                ];
                exportToCSV(rows, cols, "affiliates-selected");
                toast.success("تم تصدير المسوقين المحددين");
              },
            },
            {
              label: "تفعيل",
              icon: PlayCircle,
              onClick: (rows) =>
                bulkStatusMutation.mutate({ ids: rows.map((r: Affiliate) => r.id), status: "ACTIVE" }),
              disabled: !canManage,
            },
            {
              label: "إيقاف",
              icon: PauseCircle,
              onClick: (rows) =>
                bulkStatusMutation.mutate({ ids: rows.map((r: Affiliate) => r.id), status: "SUSPENDED" }),
              disabled: !canManage,
            },
            {
              label: "حذف",
              icon: Trash2,
              variant: "destructive",
              onClick: (rows) => bulkDeleteMutation.mutate(rows.map((r: Affiliate) => r.id)),
              disabled: !canManage,
            },
          ]}
          emptyMessage={{
            title: "لا يوجد مسوقون",
            description: "ابدأ بإضافة أول مسوق بالعمولة لتفعيل برنامج الأفلييت.",
          }}
        />
      </div>

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

      {/* Details Dialog */}
      <AffiliateDetailsDialog
        affiliate={detailsAffiliate}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEdit}
        onPay={(a) => {
          setDetailsOpen(false);
          setPayTarget(a);
        }}
        onViewReferrals={handleViewReferrals}
      />

      {/* Referrals Dialog */}
      <AffiliateReferralsDialog
        affiliate={referralsAffiliate}
        open={referralsOpen}
        onOpenChange={setReferralsOpen}
      />

      {/* Pay Confirm */}
      <ConfirmDialog
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        title="صرف العمولات"
        description={
          payTarget
            ? `سيتم صرف ${getAffiliateRemaining(payTarget).toFixed(2)} ج.م من العمولات المعلقة للمسوق "${payTarget.code}"، وتحديث جميع الإحالات المعلقة إلى مدفوعة.`
            : ""
        }
        confirmText="صرف الآن"
        loading={payMutation.isPending}
        onConfirm={() => {
          if (payTarget) payMutation.mutate(payTarget.id);
        }}
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
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
