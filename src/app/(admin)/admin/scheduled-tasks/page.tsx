"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Clock, Search, RefreshCw, Plus, Edit, Trash2, Play, Pause, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduledTask {
  id: string;
  name: string;
  description: string | null;
  type: "EMAIL" | "NOTIFICATION" | "REPORT" | "BACKUP" | "CUSTOM";
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED";
  schedule: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  runCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

interface ScheduledTasksResponse {
  data: { tasks: ScheduledTask[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalTasks: number; activeTasks: number; pausedTasks: number; failedTasks: number; totalRuns: number } };
}

const taskStatusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "نشط", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  PAUSED: { label: "متوقف", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  COMPLETED: { label: "مكتمل", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  FAILED: { label: "فاشل", color: "text-red-500 bg-red-500/10 border-red-500/20" },
};

export default function AdminScheduledTasksPage() {
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
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "scheduled-tasks", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/scheduled-tasks?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch scheduled tasks");
      return (await response.json()) as ScheduledTasksResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const tasks = data?.data?.tasks || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalTasks: 0, activeTasks: 0, pausedTasks: 0, failedTasks: 0, totalRuns: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/scheduled-tasks/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف المهمة"); queryClient.invalidateQueries({ queryKey: ["admin", "scheduled-tasks"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const response = await adminApi.fetch(`/api/admin/scheduled-tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: active ? "ACTIVE" : "PAUSED" }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) { toast.success(active ? "تم تفعيل المهمة" : "تم إيقاف المهمة"); queryClient.invalidateQueries({ queryKey: ["admin", "scheduled-tasks"] }); }
      else { toast.error("فشل في التحديث"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<ScheduledTask>[] = [
    { accessorKey: "name", header: "المهمة", cell: ({ row }) => ( <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"><Clock className="h-5 w-5 text-primary" /></div><div><p className="font-black text-xs">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.description || "بدون وصف"}</p></div></div> ) },
    { accessorKey: "type", header: "النوع", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.type}</Badge> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = taskStatusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "schedule", header: "الجدولة", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.schedule}</span> },
    { accessorKey: "runCount", header: "عدد التشغيلات", cell: ({ row }) => <span className="font-black text-xs">{row.original.runCount}</span> },
    { accessorKey: "failureCount", header: "الفشل", cell: ({ row }) => <span className="font-black text-xs text-red-500">{row.original.failureCount}</span> },
    { accessorKey: "nextRunAt", header: "التشغيل القادم", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{row.original.nextRunAt ? new Date(row.original.nextRunAt).toLocaleString("ar-EG") : "غير محدد"}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && ( <> <button onClick={() => handleToggle(row.original.id, row.original.status !== "ACTIVE")} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title={row.original.status === "ACTIVE" ? "إيقاف" : "تشغيل"}>{row.original.status === "ACTIVE" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="المهام المجدولة ⏰" description="إدارة المهام المجدولة والتشغيل التلقائي." eyebrow="النظام" badge={summary.totalTasks.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/scheduled-tasks/create")}>إضافة مهمة</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي المهام" value={summary.totalTasks} icon={Clock} color="blue" description="مهمة" />
        <AdminStatsCard title="نشطة" value={summary.activeTasks} icon={CheckCircle} color="green" description="مهمة" />
        <AdminStatsCard title="متوقفة" value={summary.pausedTasks} icon={Pause} color="amber" description="مهمة" />
        <AdminStatsCard title="فاشلة" value={summary.failedTasks} icon={XCircle} color="red" description="مهمة" />
        <AdminStatsCard title="إجمالي التشغيلات" value={summary.totalRuns} icon={Play} color="purple" description="تشغيل" />
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary">الكل</TabsTrigger>
          <TabsTrigger value="ACTIVE" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white">نشط</TabsTrigger>
          <TabsTrigger value="PAUSED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-amber-500 data-[state=active]:text-white">متوقف</TabsTrigger>
          <TabsTrigger value="FAILED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white">فاشل</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={tasks} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد مهام", description: "لم يتم إنشاء أي مهام مجدولة بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف المهمة" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}