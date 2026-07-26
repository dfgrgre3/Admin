"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, ArrowRight, RefreshCw, Edit, Trash2, Users, Key, Clock, Calendar,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { type ColumnDef } from "@tanstack/react-table";

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

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}

interface RoleUser {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  assignedAt: string;
  assignedBy: string | null;
}

interface RoleResponse {
  data: Role;
}

interface PermissionsResponse {
  data: { permissions: Permission[] };
}

interface UsersResponse {
  data: { users: RoleUser[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
}

export default function RoleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canUpdate = hasPermission(PERMISSIONS.ROLES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLES_DELETE);
  const canAssignPermissions = hasPermission(PERMISSIONS.ROLES_ASSIGN_PERMISSIONS);
  const canRemovePermissions = hasPermission(PERMISSIONS.ROLES_REMOVE_PERMISSIONS);
  const canAssignUsers = hasPermission(PERMISSIONS.ROLES_ASSIGN_USERS);
  const canRemoveUsers = hasPermission(PERMISSIONS.ROLES_REMOVE_USERS);

  const roleId = params.id as string;
  const [deleteDialog, setDeleteDialog] = React.useState({ open: false });
  const [usersPage, setUsersPage] = React.useState(1);
  const [usersLimit, setUsersLimit] = React.useState(10);

  const { data: roleData, isLoading: roleLoading, refetch: refetchRole } = useQuery({
    queryKey: ["admin", "role", roleId],
    queryFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}`);
      if (!response.ok) throw new Error("Failed to fetch role");
      return (await response.json()) as RoleResponse;
    },
    enabled: !!roleId,
  });

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["admin", "role", roleId, "permissions"],
    queryFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}/permissions`);
      if (!response.ok) throw new Error("Failed to fetch role permissions");
      return (await response.json()) as PermissionsResponse;
    },
    enabled: !!roleId,
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["admin", "role", roleId, "users", usersPage, usersLimit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: usersPage.toString(), limit: usersLimit.toString() });
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}/users?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch role users");
      return (await response.json()) as UsersResponse;
    },
    enabled: !!roleId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete role");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم حذف الدور");
      router.push("/admin/roles");
    },
    onError: (error) => {
      toast.error(error.message || "فشل في الحذف");
    },
  });

  const role = roleData?.data;
  const permissions = permissionsData?.data?.permissions || [];
  const users = usersData?.data?.users || [];
  const usersPagination = usersData?.data?.pagination;

  const userColumns: ColumnDef<RoleUser>[] = [
    {
      accessorKey: "name",
      header: "الاسم",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-xs">{row.original.name || "بدون اسم"}</p>
          <p className="text-[10px] text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.role}</Badge>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge className={`${row.original.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"} font-black text-xs`}>
          {row.original.status === "ACTIVE" ? "نشط" : "غير نشط"}
        </Badge>
      ),
    },
    {
      accessorKey: "assignedAt",
      header: "تاريخ التعيين",
      cell: ({ row }) => <span className="font-black text-xs">{new Date(row.original.assignedAt).toLocaleDateString('ar-EG')}</span>,
    },
  ];

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-6" />
        <h3 className="text-2xl font-black mb-2">الدور غير موجود</h3>
        <p className="text-gray-500 mb-8">لم يتم العثور على الدور المطلوب.</p>
        <AdminButton icon={ArrowRight} onClick={() => router.push("/admin/roles")}>العودة للأدوار</AdminButton>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title={`تفاصيل الدور: ${role.name}`}
        description={role.description || "بدون وصف"}
        eyebrow="إدارة الأدوار"
        badge={role.isSystem ? "نظام" : "مخصص"}
      >
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => { refetchRole(); refetchUsers(); }}>
            تحديث
          </AdminButton>
          {canUpdate && !role.isSystem && (
            <AdminButton icon={Edit} onClick={() => router.push(`/admin/roles/${roleId}/edit`)}>
              تعديل
            </AdminButton>
          )}
          {canDelete && !role.isSystem && (
            <AdminButton variant="destructive" icon={Trash2} onClick={() => setDeleteDialog({ open: true })}>
              حذف
            </AdminButton>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="المستخدمون" value={role.usersCount} icon={Users} color="blue" description="مستخدم" />
        <AdminStatsCard title="الصلاحيات" value={permissions.length} icon={Key} color="purple" description="صلاحية" />
        <AdminStatsCard title="تاريخ الإنشاء" value={new Date(role.createdAt).toLocaleDateString('ar-EG')} icon={Calendar} color="green" description="تاريخ" />
        <AdminStatsCard title="آخر تحديث" value={new Date(role.updatedAt).toLocaleDateString('ar-EG')} icon={Clock} color="amber" description="تاريخ" />
      </div>

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions" className="space-y-6">
          <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
            <h3 className="text-lg font-black mb-4">الصلاحيات المخصصة ({permissions.length})</h3>
            {permissionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد صلاحيات مخصصة لهذا الدور</p>
              </div>
            ) : (
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-border">
                    <div>
                      <p className="font-black text-sm">{permission.name}</p>
                      <p className="text-xs text-muted-foreground">{permission.description || permission.module}</p>
                    </div>
                    <Badge variant="outline" className="font-black text-xs">{permission.module}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden">
            <AdminDataTable
              columns={userColumns}
              data={users}
              loading={usersLoading}
              serverSide
              totalRows={usersPagination?.total || 0}
              pageCount={usersPagination?.totalPages || 1}
              currentPage={usersPage}
              onPageChange={setUsersPage}
              onPageSizeChange={setUsersLimit}
              pageSize={usersLimit}
              actions={{ onRefresh: () => refetchUsers() }}
              emptyMessage={{ title: "لا يوجد مستخدمين", description: "لم يتم تعيين هذا الدور لأي مستخدم بعد." }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="حذف الدور"
        description="هل أنت متأكد من حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
