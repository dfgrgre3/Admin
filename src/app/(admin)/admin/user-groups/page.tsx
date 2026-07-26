"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Search, RefreshCw, Plus, Edit, Trash2, UserCheck, UserX, Shield,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  type: "GRADE" | "CLASS" | "SPECIAL" | "CUSTOM";
  membersCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface UserGroupsResponse {
  data: { groups: UserGroup[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalGroups: number; activeGroups: number; totalMembers: number } };
}

export default function AdminUserGroupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "user-groups", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/user-groups?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch user groups");
      return (await response.json()) as UserGroupsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const groups = data?.data?.groups || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalGroups: 0, activeGroups: 0, totalMembers: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/user-groups/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف المجموعة"); queryClient.invalidateQueries({ queryKey: ["admin", "user-groups"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const columns: ColumnDef<UserGroup>[] = [
    { accessorKey: "name", header: "المجموعة", cell: ({ row }) => ( <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"><Users className="h-5 w-5 text-primary" /></div><div><p className="font-black text-xs">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.description || "بدون وصف"}</p></div></div> ) },
    { accessorKey: "type", header: "النوع", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.type}</Badge> },
    { accessorKey: "membersCount", header: "الأعضاء", cell: ({ row }) => <span className="font-black text-xs">{row.original.membersCount}</span> },
    { accessorKey: "isActive", header: "الحالة", cell: ({ row }) => row.original.isActive ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge> : <Badge variant="secondary" className="font-black text-xs">غير نشط</Badge> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && ( <> <button onClick={() => router.push(`/admin/user-groups/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل"><Edit className="h-3.5 w-3.5" /></button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="مجموعات المستخدمين 👥" description="إدارة مجموعات المستخدمين والصفوف الدراسية." eyebrow="المستخدمين" badge={summary.totalGroups.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/user-groups/create")}>إضافة مجموعة</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="إجمالي المجموعات" value={summary.totalGroups} icon={Users} color="blue" description="مجموعة" />
        <AdminStatsCard title="مجموعات نشطة" value={summary.activeGroups} icon={UserCheck} color="green" description="مجموعة نشطة" />
        <AdminStatsCard title="إجمالي الأعضاء" value={summary.totalMembers} icon={Shield} color="purple" description="عضو" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={groups} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد مجموعات", description: "لم يتم إنشاء أي مجموعات بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف المجموعة" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}