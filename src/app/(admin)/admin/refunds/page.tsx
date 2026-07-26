"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw, Search, Download, RefreshCw, Eye, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Refund {
  id: string;
  paymentId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  amount: number;
  currency: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  requestedAt: string;
  processedAt: string | null;
  processedBy: string | null;
  notes: string | null;
}

interface RefundsResponse {
  data: { refunds: Refund[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalRefunds: number; pendingCount: number; approvedCount: number; rejectedCount: number; totalAmount: number } };
}

const refundStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  APPROVED: { label: "تمت الموافقة", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  REJECTED: { label: "مرفوض", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  PROCESSED: { label: "تمت المعالجة", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
};

export default function AdminRefundsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.ANALYTICS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get("status") || "all");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "refunds", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/refunds?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch refunds");
      return (await response.json()) as RefundsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const refunds = data?.data?.refunds || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalRefunds: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalAmount: 0 };

  const handleExport = () => {
    if (!refunds.length) { toast.error("لا توجد بيانات للتصدير"); return; }
    const cols: ExportColumn<Refund>[] = [
      { header: "المستخدم", accessor: (r) => r.userName || r.userEmail },
      { header: "المبلغ", accessor: (r) => r.amount },
      { header: "السبب", accessor: (r) => r.reason },
      { header: "الحالة", accessor: (r) => refundStatusConfig[r.status]?.label || r.status },
      { header: "تاريخ الطلب", accessor: (r) => new Date(r.requestedAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(refunds, cols, "refunds");
    toast.success("تم التصدير بنجاح");
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/refunds/${id}/approve`, { method: "POST" });
      if (response.ok) { toast.success("تمت الموافقة على طلب الاسترداد"); queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الموافقة"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("سبب الرفض:");
    if (!reason) return;
    try {
      const response = await adminApi.fetch(`/api/admin/refunds/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }), headers: { "Content-Type": "application/json" } });
      if (response.ok) { toast.success("تم رفض طلب الاسترداد"); queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الرفض"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<Refund>[] = [
    { accessorKey: "userName", header: "المستخدم", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.userName || "مستخدم"}</p><p className="text-[10px] text-muted-foreground">{row.original.userEmail}</p></div> },
    { accessorKey: "amount", header: "المبلغ", cell: ({ row }) => <span className="font-black text-xs">{row.original.amount.toLocaleString()} {row.original.currency}</span> },
    { accessorKey: "reason", header: "السبب", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground max-w-[200px] truncate block">{row.original.reason}</span> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = refundStatusConfig[row.original.status] ?? refundStatusConfig["PENDING"] ?? { color: "text-slate-400", label: row.original.status }; return <Badge variant="outline" className={`font-black text-xs ${c.color}`}>{c.label}</Badge>; } },
    { accessorKey: "requestedAt", header: "تاريخ الطلب", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.requestedAt).toLocaleDateString("ar-EG")}</span> },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-1">
            {r.status === "PENDING" && canManage && (
              <>
                <button onClick={() => handleApprove(r.id)} className="p-1.5 text-xs text-green-500 hover:bg-green-500/10 rounded-lg" title="موافقة"><CheckCircle className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleReject(r.id)} className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg" title="رفض"><XCircle className="h-3.5 w-3.5" /></button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة الاستردادات 🔄" description="إدارة طلبات استرداد المبالغ المالية من المستخدمين." eyebrow="المالية" badge={summary.totalRefunds.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي طلبات الاسترداد" value={summary.totalRefunds} icon={RotateCcw} color="blue" description="طلب استرداد" />
        <AdminStatsCard title="قيد الانتظار" value={summary.pendingCount} icon={Clock} color="amber" description="بانتظار المراجعة" />
        <AdminStatsCard title="تمت الموافقة" value={summary.approvedCount} icon={CheckCircle} color="green" description="طلب معتمد" />
        <AdminStatsCard title="إجمالي المبلغ" value={summary.totalAmount.toLocaleString()} icon={DollarSign} color="purple" description="قيمة الاستردادات" />
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary">الكل</TabsTrigger>
          <TabsTrigger value="PENDING" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-amber-500 data-[state=active]:text-white">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="APPROVED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white">تمت الموافقة</TabsTrigger>
          <TabsTrigger value="REJECTED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white">مرفوض</TabsTrigger>
          <TabsTrigger value="PROCESSED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">تمت المعالجة</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={refunds} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد طلبات استرداد", description: "لم يتم العثور على أي طلبات استرداد." }} />
      </div>
    </div>
  );
}