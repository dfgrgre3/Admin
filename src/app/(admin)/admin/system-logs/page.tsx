"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText, Search, Download, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface SystemLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  service: string;
  message: string;
  userId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface SystemLogsResponse {
  data: { logs: SystemLog[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalLogs: number; infoCount: number; warnCount: number; errorCount: number; debugCount: number } };
}

const logLevelConfig: Record<string, { label: string; color: string }> = {
  INFO: { label: "معلومات", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  WARN: { label: "تحذير", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  ERROR: { label: "خطأ", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  DEBUG: { label: "تصحيح", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

export default function AdminSystemLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [levelFilter, setLevelFilter] = React.useState(() => searchParams.get("level") || "all");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, levelFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "system-logs", page, limit, deferredSearch, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (levelFilter !== "all") params.set("level", levelFilter);
      const response = await adminApi.fetch(`/api/admin/system-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch system logs");
      return (await response.json()) as SystemLogsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalLogs: 0, infoCount: 0, warnCount: 0, errorCount: 0, debugCount: 0 };

  const handleExport = () => {
    if (!logs.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<SystemLog>[] = [
      { header: "المستوى", accessor: (l) => logLevelConfig[l.level]?.label || l.level },
      { header: "الخدمة", accessor: (l) => l.service },
      { header: "الرسالة", accessor: (l) => l.message },
      { header: "التاريخ", accessor: (l) => new Date(l.createdAt).toLocaleString("ar-EG") },
    ];
    exportToCSV(logs, cols, "system-logs");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<SystemLog>[] = [
    { accessorKey: "level", header: "المستوى", cell: ({ row }) => { const c = logLevelConfig[row.original.level]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.level}</Badge>; } },
    { accessorKey: "service", header: "الخدمة", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.service}</Badge> },
    { accessorKey: "message", header: "الرسالة", cell: ({ row }) => <span className="text-xs font-bold max-w-[300px] truncate block">{row.original.message}</span> },
    { accessorKey: "ipAddress", header: "عنوان IP", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ipAddress || "-"}</span> },
    { accessorKey: "createdAt", header: "التاريخ", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleString("ar-EG")}</span> },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="سجلات النظام 📋" description="عرض سجلات النظام والأخطاء." eyebrow="النظام" badge={summary.totalLogs.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي السجلات" value={summary.totalLogs} icon={ScrollText} color="blue" description="سجل" />
        <AdminStatsCard title="معلومات" value={summary.infoCount} icon={CheckCircle} color="green" description="سجل" />
        <AdminStatsCard title="تحذيرات" value={summary.warnCount} icon={AlertTriangle} color="amber" description="سجل" />
        <AdminStatsCard title="أخطاء" value={summary.errorCount} icon={XCircle} color="red" description="سجل" />
        <AdminStatsCard title="تصحيح" value={summary.debugCount} icon={Clock} color="purple" description="سجل" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={logs} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد سجلات", description: "لم يتم العثور على أي سجلات نظام." }} />
      </div>
    </div>
  );
}