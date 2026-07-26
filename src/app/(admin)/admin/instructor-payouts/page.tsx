"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, Search, Download, RefreshCw, Eye, DollarSign, CheckCircle, XCircle, Clock, CreditCard,
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

interface Payout {
  id: string;
  instructorId: string;
  instructorName: string | null;
  instructorEmail: string;
  amount: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED" | "FAILED";
  paymentMethod: string;
  transactionId: string | null;
  notes: string | null;
  requestedAt: string;
  paidAt: string | null;
}

interface PayoutsResponse {
  data: { payouts: Payout[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalPayouts: number; pendingCount: number; paidCount: number; totalAmount: number } };
}

const payoutStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  APPROVED: { label: "موافق عليه", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  PAID: { label: "تم الدفع", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  REJECTED: { label: "مرفوض", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  FAILED: { label: "فاشل", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

export default function AdminInstructorPayoutsPage() {
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
    queryKey: ["admin", "instructor-payouts", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/instructor-payouts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch payouts");
      return (await response.json()) as PayoutsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const payouts = data?.data?.payouts || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalPayouts: 0, pendingCount: 0, paidCount: 0, totalAmount: 0 };

  const handleExport = () => {
    if (!payouts.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<Payout>[] = [
      { header: "المدرّس", accessor: (p) => p.instructorName || p.instructorEmail },
      { header: "المبلغ", accessor: (p) => p.amount },
      { header: "طريقة الدفع", accessor: (p) => p.paymentMethod },
      { header: "الحالة", accessor: (p) => payoutStatusConfig[p.status]?.label || p.status },
      { header: "تاريخ الطلب", accessor: (p) => new Date(p.requestedAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(payouts, cols, "instructor-payouts");
    toast.success("تم التصدير بنجاح");
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/instructor-payouts/${id}/approve`, { method: "POST" });
      if (response.ok) { toast.success("تمت الموافقة على الدفعة"); queryClient.invalidateQueries({ queryKey: ["admin", "instructor-payouts"] }); }
      else { toast.error("فشل في الموافقة"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("سبب الرفض:");
    if (!reason) return;
    try {
      const response = await adminApi.fetch(`/api/admin/instructor-payouts/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }), headers: { "Content-Type": "application/json" } });
      if (response.ok) { toast.success("تم رفض الدفعة"); queryClient.invalidateQueries({ queryKey: ["admin", "instructor-payouts"] }); }
      else { toast.error("فشل في الرفض"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<Payout>[] = [
    { accessorKey: "instructorName", header: "المدرّس", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.instructorName || "مدرّس"}</p><p className="text-[10px] text-muted-foreground">{row.original.instructorEmail}</p></div> },
    { accessorKey: "amount", header: "المبلغ", cell: ({ row }) => <span className="font-black text-xs">{row.original.amount.toLocaleString()} {row.original.currency}</span> },
    { accessorKey: "paymentMethod", header: "طريقة الدفع", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.paymentMethod}</Badge> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = payoutStatusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "requestedAt", header: "تاريخ الطلب", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.requestedAt).toLocaleDateString("ar-EG")}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => { const p = row.original; return ( <div className="flex items-center gap-1"> {p.status === "PENDING" && canManage && ( <> <button onClick={() => handleApprove(p.id)} className="p-1.5 text-xs text-green-500 hover:bg-green-500/10 rounded-lg" title="موافقة"><CheckCircle className="h-3.5 w-3.5" /></button> <button onClick={() => handleReject(p.id)} className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg" title="رفض"><XCircle className="h-3.5 w-3.5" /></button> </> )} </div> ); } },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="دفعات المدرّسين 💰" description="إدارة طلبات سحب الأرباح للمدرّسين." eyebrow="المالية" badge={summary.totalPayouts.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي الدفعات" value={summary.totalPayouts} icon={Wallet} color="blue" description="دفعة" />
        <AdminStatsCard title="قيد الانتظار" value={summary.pendingCount} icon={Clock} color="amber" description="بانتظار المراجعة" />
        <AdminStatsCard title="تم الدفع" value={summary.paidCount} icon={CheckCircle} color="green" description="دفعة مكتملة" />
        <AdminStatsCard title="إجمالي المبلغ" value={summary.totalAmount.toLocaleString()} icon={DollarSign} color="purple" description="قيمة الدفعات" />
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary">الكل</TabsTrigger>
          <TabsTrigger value="PENDING" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-amber-500 data-[state=active]:text-white">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="APPROVED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">موافق عليه</TabsTrigger>
          <TabsTrigger value="PAID" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white">تم الدفع</TabsTrigger>
          <TabsTrigger value="REJECTED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white">مرفوض</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={payouts} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد دفعات", description: "لم يتم العثور على أي دفعات." }} />
      </div>
    </div>
  );
}