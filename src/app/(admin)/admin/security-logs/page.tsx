"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Search, Download, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Clock, User,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface SecurityLog {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  riskScore: number;
  location: string | null;
  createdAt: string;
}

interface SecurityLogsResponse {
  data: { logs: SecurityLog[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalLogs: number; successCount: number; failedCount: number; blockedCount: number; highRiskCount: number } };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: "نجاح", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  FAILED: { label: "فشل", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  BLOCKED: { label: "محظور", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

export default function AdminSecurityLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get("status") || "all");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "security-logs", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/security-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch security logs");
      return (await response.json()) as SecurityLogsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalLogs: 0, successCount: 0, failedCount: 0, blockedCount: 0, highRiskCount: 0 };

  const handleExport = () => {
    if (!logs.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<SecurityLog>[] = [
      { header: "المستخدم", accessor: (l) => l.userName || l.userEmail },
      { header: "الإجراء", accessor: (l) => l.action },
      { header: "الحالة", accessor: (l) => statusConfig[l.status]?.label || l.status },
      { header: "عنوان IP", accessor: (l) => l.ipAddress },
      { header: "التاريخ", accessor: (l) => new Date(l.createdAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(logs, cols, "security-logs");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<SecurityLog>[] = [
    { accessorKey: "userName", header: "المستخدم", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.userName || "مستخدم"}</p><p className="text-[10px] text-muted-foreground">{row.original.userEmail}</p></div> },
    { accessorKey: "action", header: "الإجراء", cell: ({ row }) => <span className="font-black text-xs">{row.original.action}</span> },
    { accessorKey: "resource", header: "المورد", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.resource}</Badge> },
    { accessorKey: "ipAddress", header: "عنوان IP", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ipAddress}</span> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = statusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "riskScore", header: "مخاطر", cell: ({ row }) => ( <div className="flex items-center gap-2"> <div className={`h-2 w-2 rounded-full ${row.original.riskScore > 70 ? "bg-red-500" : row.original.riskScore > 30 ? "bg-amber-500" : "bg-green-500"}`} /> <span className="font-black text-xs">{row.original.riskScore}</span> </div> ) },
    { accessorKey: "createdAt", header: "التاريخ", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("ar-EG")}</span> },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="سجلات الأمان 🔒" description="مراقبة محاولات الدخول والأنشطة المشبوهة." eyebrow="الأمان" badge={summary.totalLogs.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي السجلات" value={summary.totalLogs} icon={Shield} color="blue" description="سجل أمني" />
        <AdminStatsCard title="عمليات ناجحة" value={summary.successCount} icon={CheckCircle} color="green" description="عملية" />
        <AdminStatsCard title="عمليات فاشلة" value={summary.failedCount} icon={XCircle} color="red" description="عملية" />
        <AdminStatsCard title="محظورة" value={summary.blockedCount} icon={AlertTriangle} color="amber" description="عملية" />
        <AdminStatsCard title="مخاطر عالية" value={summary.highRiskCount} icon={User} color="purple" description="تنبيه" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={logs} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد سجلات", description: "لم يتم العثور على أي سجلات أمنية." }} />
      </div>
    </div>
  );
}