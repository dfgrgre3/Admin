"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Search, Download, RefreshCw, Plus, Edit, Trash2, Users, Key, CheckCircle, Filter,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  usersCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RolesResponse {
  data: { roles: Role[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalRoles: number; systemRoles: number; customRoles: number; rolesWithUsers: number; rolesWithoutUsers: number } };
}

export default function AdminRolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canView = hasPermission(PERMISSIONS.ROLES_VIEW);
  const canCreate = hasPermission(PERMISSIONS.ROLES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.ROLES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLES_DELETE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [filterType, setFilterType] = React.useState(() => searchParams.get("filter") || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sort") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("order") || "desc");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, filterType]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "roles", page, limit, deferredSearch, filterType, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (filterType !== "all") params.set("filter", filterType);
      params.set("sort", sortBy);
      params.set("order", sortOrder);
      const response = await adminApi.fetch(`/api/admin/roles?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch roles");
      return (await response.json()) as RolesResponse;
    },
    placeholderData: (previousData) => previousData,
    enabled: canView,
  });

  const roles = data?.data?.roles || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalRoles: 0, systemRoles: 0, customRoles: 0, rolesWithUsers: 0, rolesWithoutUsers: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/roles/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف الدور"); queryClient.invalidateQueries({ queryKey: ["admin", "roles"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const columns: ColumnDef<Role>[] = [
    { 
      accessorKey: "name", 
      header: "الدور", 
      cell: ({ row }) => ( 
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-black text-xs">{row.original.name}</p>
            <p className="text-[10px] text-muted-foreground">{row.original.description || "بدون وصف"}</p>
          </div>
        </div> 
      ),
    },
    { 
      accessorKey: "permissions", 
      header: "الصلاحيات", 
      cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.permissions.length} صلاحية</Badge>,
    },
    { 
      accessorKey: "usersCount", 
      header: "المستخدمون", 
      cell: ({ row }) => <span className="font-black text-xs">{row.original.usersCount}</span>,
    },
    { 
      accessorKey: "isSystem", 
      header: "النوع", 
      cell: ({ row }) => row.original.isSystem ? <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black text-xs">نظام</Badge> : <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">مخصص</Badge>,
    },
    { 
      accessorKey: "createdAt", 
      header: "تاريخ الإنشاء", 
      cell: ({ row }) => <span className="font-black text-xs">{new Date(row.original.createdAt).toLocaleDateString('ar-EG')}</span>,
    },
    { 
      id: "actions", 
      header: "الإجراءات", 
      cell: ({ row }) => ( 
        <div className="flex items-center gap-1"> 
          {canUpdate && !row.original.isSystem && (
            <button onClick={() => router.push(`/admin/roles/${row.original.id}`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="عرض التفاصيل">
              <Shield className="h-3.5 w-3.5" />
            </button>
          )}
          {canUpdate && !row.original.isSystem && (
            <button onClick={() => router.push(`/admin/roles/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل">
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {canDelete && !row.original.isSystem && (
            <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div> 
      ),
    },
  ];

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 border border-red-500/10 rounded-3xl backdrop-blur-xl">
        <Shield className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h3 className="text-2xl font-black text-white mb-2">منطقة محظورة ⚔️</h3>
        <p className="text-gray-500 mb-8 max-w-sm">
          ليس لديك الصلاحيات الكافية لدخول هذه الصفحة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة الأدوار 🛡️" description="إدارة أدوار المستخدمين والصلاحيات المرتبطة بها." eyebrow="الأمان والصلاحيات" badge={summary.totalRoles.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canCreate && <AdminButton icon={Plus} onClick={() => router.push("/admin/roles/create")}>إضافة دور</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي الأدوار" value={summary.totalRoles} icon={Shield} color="blue" description="دور" />
        <AdminStatsCard title="أدوار نظام" value={summary.systemRoles} icon={Key} color="purple" description="دور أساسي" />
        <AdminStatsCard title="أدوار مخصصة" value={summary.customRoles} icon={CheckCircle} color="green" description="دور مخصص" />
        <AdminStatsCard title="أدوار مستخدمة" value={summary.rolesWithUsers || 0} icon={Users} color="amber" description="لديها مستخدمين" />
        <AdminStatsCard title="أدوار فارغة" value={summary.rolesWithoutUsers || 0} icon={Shield} color="violet" description="بدون مستخدمين" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable 
          columns={columns} 
          data={roles} 
          loading={isLoading} 
          serverSide
          totalRows={pagination?.total || 0} 
          pageCount={pagination?.totalPages || 1}
          currentPage={page} 
          onPageChange={setPage} 
          onPageSizeChange={setLimit} 
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex items-center gap-3 w-full">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} 
                  placeholder="ابحث..." 
                  className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" 
                  dir="rtl" 
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-accent/10 px-3 text-sm outline-none ring-primary transition focus:ring-1 font-bold"
                >
                  <option value="all">الكل</option>
                  <option value="system">أدوار النظام</option>
                  <option value="custom">أدوار مخصصة</option>
                  <option value="with_users">لديها مستخدمين</option>
                  <option value="without_users">بدون مستخدمين</option>
                </select>
              </div>
            </div>
          }
          emptyMessage={{ title: "لا توجد أدوار", description: "لم يتم إنشاء أي أدوار بعد." }} 
        />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الدور" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}