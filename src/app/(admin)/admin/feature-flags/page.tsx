"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Flag, Search, RefreshCw, Plus, Edit, Trash2, ToggleLeft, ToggleRight, CheckCircle,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isEnabled: boolean;
  environment: string;
  rolloutPercentage: number;
  allowedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlagsResponse {
  data: { flags: FeatureFlag[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalFlags: number; enabledFlags: number; disabledFlags: number } };
}

export default function AdminFeatureFlagsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "feature-flags", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/feature-flags?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch feature flags");
      return (await response.json()) as FeatureFlagsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const flags = data?.data?.flags || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalFlags: 0, enabledFlags: 0, disabledFlags: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/feature-flags/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف الميزة"); queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await adminApi.fetch(`/api/admin/feature-flags/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isEnabled: enabled }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) { toast.success(enabled ? "تم تفعيل الميزة" : "تم تعطيل الميزة"); queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }); }
      else { toast.error("فشل في التحديث"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<FeatureFlag>[] = [
    { accessorKey: "name", header: "الميزة", cell: ({ row }) => ( <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"><Flag className="h-5 w-5 text-primary" /></div><div><p className="font-black text-xs">{row.original.name}</p><p className="text-[10px] text-muted-foreground font-mono">{row.original.key}</p></div></div> ) },
    { accessorKey: "environment", header: "البيئة", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.environment}</Badge> },
    { accessorKey: "rolloutPercentage", header: "نسبة الت rollout", cell: ({ row }) => <span className="font-black text-xs">{row.original.rolloutPercentage}%</span> },
    { accessorKey: "isEnabled", header: "الحالة", cell: ({ row }) => row.original.isEnabled ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">مفعل</Badge> : <Badge variant="secondary" className="font-black text-xs">معطل</Badge> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && ( <> <button onClick={() => handleToggle(row.original.id, !row.original.isEnabled)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title={row.original.isEnabled ? "تعطيل" : "تفعيل"}>{row.original.isEnabled ? <ToggleRight className="h-3.5 w-3.5 text-green-500" /> : <ToggleLeft className="h-3.5 w-3.5 text-gray-500" />}</button> <button onClick={() => router.push(`/admin/feature-flags/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل"><Edit className="h-3.5 w-3.5" /></button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="مفاتيح الميزات 🚩" description="إدارة مفاتيح تشغيل/إيقاف الميزات في المنصة." eyebrow="النظام" badge={summary.totalFlags.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/feature-flags/create")}>إضافة ميزة</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="إجمالي الميزات" value={summary.totalFlags} icon={Flag} color="blue" description="ميزة" />
        <AdminStatsCard title="مفعلة" value={summary.enabledFlags} icon={CheckCircle} color="green" description="ميزة" />
        <AdminStatsCard title="معطلة" value={summary.disabledFlags} icon={Flag} color="red" description="ميزة" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={flags} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد ميزات", description: "لم يتم إنشاء أي مفاتيح ميزات بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الميزة" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}