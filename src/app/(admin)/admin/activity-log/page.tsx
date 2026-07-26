"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Search, Download, RefreshCw, Eye, User, Globe, Clock,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ActivityLogsResponse {
  data: { logs: ActivityLog[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalLogs: number; todayCount: number; weekCount: number } };
}

export default function AdminActivityLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "activity-log", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/activity-log?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch activity log");
      return (await response.json()) as ActivityLogsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalLogs: 0, todayCount: 0, weekCount: 0 };

  const handleExport = () => {
    if (!logs.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<ActivityLog>[] = [
      { header: "المستخدم", accessor: (l) => l.userName || l.userEmail },
      { header: "الإجراء", accessor: (l) => l.action },
      { header: "المورد", accessor: (l) => l.resource },
      { header: "عنوان IP", accessor: (l) => l.ipAddress },
      { header: "التاريخ", accessor: (l) => new Date(l.createdAt).toLocaleString("ar-EG") },
    ];
    exportToCSV(logs, cols, "activity-log");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<ActivityLog>[] = [
    { accessorKey: "userName", header: "المستخدم", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.userName || "مستخدم"}</p><p className="text-[10px] text-muted-foreground">{row.original.userEmail}</p></div> },
    { accessorKey: "action", header: "الإجراء", cell: ({ row }) => <span className="font-black text-xs">{row.original.action}</span> },
    { accessorKey: "resource", header: "المورد", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.resource}</Badge> },
    { accessorKey: "ipAddress", header: "عنوان IP", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ipAddress}</span> },
    { accessorKey: "createdAt", header: "التاريخ", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleString("ar-EG")}</span> },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="سجل النشاطات 📊" description="عرض جميع النشاطات والعمليات التي تمت في النظام." eyebrow="المراقبة" badge={summary.totalLogs.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="إجمالي النشاطات" value={summary.totalLogs} icon={Activity} color="blue" description="نشاط" />
        <AdminStatsCard title="اليوم" value={summary.todayCount} icon={Clock} color="green" description="نشاط" />
        <AdminStatsCard title="هذا الأسبوع" value={summary.weekCount} icon={Activity} color="purple" description="نشاط" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={logs} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد نشاطات", description: "لم يتم العثور على أي نشاطات." }} />
      </div>
    </div>
  );
}