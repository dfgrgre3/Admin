"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Shield, Key, Loader2, Search,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
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

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  permissions: Permission[];
  count: number;
}

interface RoleResponse {
  data: Role;
}

interface PermissionsResponse {
  data: { permissions: Permission[]; groups: Record<string, Permission[]> };
}

interface RolePermissionsResponse {
  data: { permissions: Permission[] };
}

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canUpdate = hasPermission(PERMISSIONS.ROLES_UPDATE);

  const roleId = params.id as string;
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
  });
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["admin", "role", roleId],
    queryFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}`);
      if (!response.ok) throw new Error("Failed to fetch role");
      return (await response.json()) as RoleResponse;
    },
    enabled: !!roleId && canUpdate,
  });

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return (await response.json()) as PermissionsResponse;
    },
    enabled: canUpdate,
  });

  const { data: rolePermissionsData } = useQuery({
    queryKey: ["admin", "role", roleId, "permissions"],
    queryFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}/permissions`);
      if (!response.ok) throw new Error("Failed to fetch role permissions");
      return (await response.json()) as RolePermissionsResponse;
    },
    enabled: !!roleId && canUpdate,
  });

  React.useEffect(() => {
    if (rolePermissionsData) {
      setSelectedPermissions(new Set(rolePermissionsData.data.permissions.map((p: Permission) => p.id)));
    }
  }, [rolePermissionsData]);

  const role = roleData?.data;
  const permissions = permissionsData?.data?.permissions || [];
  const groups = permissionsData?.data?.groups || {};

  React.useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
      });
    }
  }, [role]);

  const groupedPermissions = React.useMemo(() => {
    const grouped: PermissionGroup[] = [];
    Object.entries(groups).forEach(([module, perms]) => {
      grouped.push({
        module,
        permissions: perms,
        count: perms.length,
      });
    });
    return grouped.sort((a, b) => a.module.localeCompare(b.module));
  }, [groups]);

  const filteredPermissions = React.useMemo(() => {
    if (!searchQuery) return groupedPermissions;
    const query = searchQuery.toLowerCase();
    return groupedPermissions
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.module.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.permissions.length > 0);
  }, [groupedPermissions, searchQuery]);

  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSelectAllInGroup = (groupPermissions: Permission[]) => {
    const newSelected = new Set(selectedPermissions);
    const allSelected = groupPermissions.every(p => newSelected.has(p.id));
    
    if (allSelected) {
      groupPermissions.forEach(p => newSelected.delete(p.id));
    } else {
      groupPermissions.forEach(p => newSelected.add(p.id));
    }
    setSelectedPermissions(newSelected);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "فشل في تحديث الدور");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث الدور بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "role", roleId] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "فشل في تحديث الدور");
    },
  });

  const permissionsMutation = useMutation({
    mutationFn: async () => {
      const response = await adminApi.fetch(`/api/admin/roles/${roleId}/permissions/replace`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissionIds: Array.from(selectedPermissions),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "فشل في تحديث الصلاحيات");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث الصلاحيات بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "role", roleId, "permissions"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "فشل في تحديث الصلاحيات");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role?.isSystem) {
      toast.error("لا يمكن تعديل أدوار النظام");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all([
        updateMutation.mutateAsync(),
        permissionsMutation.mutateAsync(),
      ]);
      router.push(`/admin/roles/${roleId}`);
    } catch (error) {
      // Error handling is done in mutations
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canUpdate) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 border border-red-500/10 rounded-3xl backdrop-blur-xl">
        <Shield className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h3 className="text-2xl font-black text-white mb-2">منطقة محظورة ⚔️</h3>
        <p className="text-gray-500 mb-8 max-w-sm">
          ليس لديك الصلاحيات الكافية لتعديل الأدوار.
        </p>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  if (role.isSystem) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Shield className="w-16 h-16 text-amber-500 mb-6" />
        <h3 className="text-2xl font-black mb-2">دور نظام محمي</h3>
        <p className="text-gray-500 mb-8">لا يمكن تعديل أدوار النظام الأساسية.</p>
        <AdminButton icon={ArrowRight} onClick={() => router.push(`/admin/roles/${roleId}`)}>عرض التفاصيل</AdminButton>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title={`تعديل الدور: ${role.name}`}
        description="قم بتعديل معلومات الدور والصلاحيات المرتبطة به."
        eyebrow="إدارة الأدوار"
      >
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={ArrowRight} onClick={() => router.push(`/admin/roles/${roleId}`)}>
            العودة للتفاصيل
          </AdminButton>
        </div>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="admin-glass p-6 rounded-[2rem] border border-white/10">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            معلومات الدور
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">اسم الدور</Label>
              <Input
                id="name"
                value={formData.name}
                disabled
                className="mt-2 bg-muted/50"
              />
              <p className="text-xs text-muted-foreground mt-1">لا يمكن تعديل اسم الدور بعد الإنشاء</p>
            </div>
            
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الدور والغرض منه..."
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <Card className="admin-glass p-6 rounded-[2rem] border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Key className="h-5 w-5" />
              الصلاحيات
              <Badge variant="outline" className="font-black text-xs">
                {selectedPermissions.size} محددة
              </Badge>
            </h3>
            
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الصلاحيات..."
                className="pr-10"
              />
            </div>
          </div>

          {permissionsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد صلاحيات متاحة"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPermissions.map((group) => (
                <div key={group.module} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`group-${group.module}`}
                        checked={group.permissions.every(p => selectedPermissions.has(p.id))}
                        onCheckedChange={() => handleSelectAllInGroup(group.permissions)}
                      />
                      <Label
                        htmlFor={`group-${group.module}`}
                        className="font-black cursor-pointer"
                      >
                        {group.module}
                      </Label>
                      <Badge variant="outline" className="font-black text-xs">
                        {group.count}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-6">
                    {group.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-border hover:bg-accent/10 transition"
                      >
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.has(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={permission.id}
                            className="font-black text-sm cursor-pointer block"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description || permission.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex items-center justify-end gap-3">
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/roles/${roleId}`)}
          >
            إلغاء
          </AdminButton>
          <AdminButton
            type="submit"
            loading={isSubmitting}
          >
            حفظ التغييرات
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
