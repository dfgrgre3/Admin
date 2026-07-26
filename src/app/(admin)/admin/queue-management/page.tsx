"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  List, Search, RefreshCw, Play, Pause, Trash2, CheckCircle, XCircle, Clock, AlertTriangle,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QueueJob {
  id: string;
  name: string;
  type: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "RETRYING";
  priority: number;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  processedAt: string | null;
  createdAt: string;
}

interface QueueResponse {
  data: { jobs: QueueJob[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalJobs: number; pendingJobs: number; processingJobs: number; failedJobs: number; avgProcessingTime: number } };
}

const jobStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  PROCESSING: { label: "قيد المعالجة", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  COMPLETED: { label: "مكتمل", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  FAILED: { label: "فاشل", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  RETRYING: { label: "إعادة محاولة", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
};

export default function AdminQueueManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get("status") || "all");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "queue", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/queue?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch queue jobs");
      return (await response.json()) as QueueResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const jobs = data?.data?.jobs || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalJobs: 0, pendingJobs: 0, processingJobs: 0, failedJobs: 0, avgProcessingTime: 0 };

  const handleRetry = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/queue/${id}/retry`, { method: "POST" });
      if (response.ok) { toast.success("تمت إعادة المحاولة"); queryClient.invalidateQueries({ queryKey: ["admin", "queue"] }); }
      else { toast.error("فشل في إعادة المحاولة"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/queue/${id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف المهمة"); queryClient.invalidateQueries({ queryKey: ["admin", "queue"] }); }
      else { toast.error("فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<QueueJob>[] = [
    { accessorKey: "name", header: "المهمة", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.type}</p></div> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = jobStatusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "priority", header: "الأولوية", cell: ({ row }) => <span className="font-black text-xs">{row.original.priority}</span> },
    { accessorKey: "attempts", header: "المحاولات", cell: ({ row }) => <span className="font-black text-xs">{row.original.attempts}/{row.original.maxAttempts}</span> },
    { accessorKey: "error", header: "الخطأ", cell: ({ row }) => row.original.error ? <span className="text-xs text-red-500 max-w-[200px] truncate block">{row.original.error}</span> : <span className="text-xs text-muted-foreground">-</span> },
    { accessorKey: "createdAt", header: "تاريخ الإنشاء", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleString("ar-EG")}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {row.original.status === "FAILED" && canManage && ( <button onClick={() => handleRetry(row.original.id)} className="p-1.5 text-xs text-green-500 hover:bg-green-500/10 rounded-lg" title="إعادة محاولة"><Play className="h-3.5 w-3.5" /></button> )} {canManage && ( <button onClick={() => handleDelete(row.original.id)} className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة قوائم الانتظار 📋" description="مراقبة وإدارة مهام قوائم الانتظار في النظام." eyebrow="النظام" badge={summary.totalJobs.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي المهام" value={summary.totalJobs} icon={List} color="blue" description="مهمة" />
        <AdminStatsCard title="قيد الانتظار" value={summary.pendingJobs} icon={Clock} color="amber" description="مهمة" />
        <AdminStatsCard title="قيد المعالجة" value={summary.processingJobs} icon={AlertTriangle} color="purple" description="مهمة" />
        <AdminStatsCard title="فاشلة" value={summary.failedJobs} icon={XCircle} color="red" description="مهمة" />
        <AdminStatsCard title="متوسط المعالجة" value={`${summary.avgProcessingTime}ms`} icon={CheckCircle} color="green" description="متوسط" />
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary">الكل</TabsTrigger>
          <TabsTrigger value="PENDING" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-amber-500 data-[state=active]:text-white">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="PROCESSING" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">قيد المعالجة</TabsTrigger>
          <TabsTrigger value="FAILED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white">فاشل</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={jobs} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد مهام", description: "لم يتم العثور على أي مهام في قائمة الانتظار." }} />
      </div>
    </div>
  );
}