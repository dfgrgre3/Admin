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

interface LoginAttempt {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  ipAddress: string;
  userAgent: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  failureReason: string | null;
  location: string | null;
  riskScore: number;
  createdAt: string;
}

interface LoginAttemptsResponse {
  data: { attempts: LoginAttempt[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalAttempts: number; successCount: number; failedCount: number; blockedCount: number; suspiciousCount: number } };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: "نجاح", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  FAILED: { label: "فشل", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  BLOCKED: { label: "محظور", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

export default function AdminLoginAttemptsPage() {
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
    queryKey: ["admin", "login-attempts", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/login-attempts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch login attempts");
      return (await response.json()) as LoginAttemptsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const attempts = data?.data?.attempts || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalAttempts: 0, successCount: 0, failedCount: 0, blockedCount: 0, suspiciousCount: 0 };

  const handleExport = () => {
    if (!attempts.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<LoginAttempt>[] = [
      { header: "المستخدم", accessor: (a) => a.userName || a.userEmail || "زائر" },
      { header: "عنوان IP", accessor: (a) => a.ipAddress },
      { header: "الحالة", accessor: (a) => statusConfig[a.status]?.label || a.status },
      { header: "الموقع", accessor: (a) => a.location || "-" },
      { header: "التاريخ", accessor: (a) => new Date(a.createdAt).toLocaleString("ar-EG") },
    ];
    exportToCSV(attempts, cols, "login-attempts");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<LoginAttempt>[] = [
    { accessorKey: "userName", header: "المستخدم", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.userName || "زائر"}</p><p className="text-[10px] text-muted-foreground">{row.original.userEmail || row.original.ipAddress}</p></div> },
    { accessorKey: "ipAddress", header: "عنوان IP", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ipAddress}</span> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = statusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "failureReason", header: "سبب الفشل", cell: ({ row }) => <span className="text-xs text-red-500 max-w-[200px] truncate block">{row.original.failureReason || "-"}</span> },
    { accessorKey: "location", header: "الموقع", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{row.original.location || "-"}</span> },
    { accessorKey: "riskScore", header: "مخاطر", cell: ({ row }) => ( <div className="flex items-center gap-2"> <div className={`h-2 w-2 rounded-full ${row.original.riskScore > 70 ? "bg-red-500" : row.original.riskScore > 30 ? "bg-amber-500" : "bg-green-500"}`} /> <span className="font-black text-xs">{row.original.riskScore}</span> </div> ) },
    { accessorKey: "createdAt", header: "التاريخ", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleString("ar-EG")}</span> },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="محاولات تسجيل الدخول 🔐" description="مراقبة محاولات تسجيل الدخول الناجحة والفاشلة." eyebrow="الأمان" badge={summary.totalAttempts.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي المحاولات" value={summary.totalAttempts} icon={Shield} color="blue" description="محاولة" />
        <AdminStatsCard title="ناجحة" value={summary.successCount} icon={CheckCircle} color="green" description="محاولة" />
        <AdminStatsCard title="فاشلة" value={summary.failedCount} icon={XCircle} color="red" description="محاولة" />
        <AdminStatsCard title="محظورة" value={summary.blockedCount} icon={AlertTriangle} color="amber" description="محاولة" />
        <AdminStatsCard title="مشبوهة" value={summary.suspiciousCount} icon={User} color="purple" description="محاولة" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={attempts} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد محاولات", description: "لم يتم العثور على أي محاولات تسجيل دخول." }} />
      </div>
    </div>
  );
}