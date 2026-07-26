"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

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

interface PermissionsResponse {
  data: { permissions: Permission[]; groups: Record<string, Permission[]> };
}

export default function CreateRolePage() {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission(PERMISSIONS.ROLES_CREATE);

  const [formData, setFormData] = React.useState({
    name: "",
    displayName: "",
    description: "",
  });
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return (await response.json()) as PermissionsResponse;
    },
    enabled: canCreate,
  });

  const permissions = permissionsData?.data?.permissions || [];
  const groups = permissionsData?.data?.groups || {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم الدور");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          permissions: Array.from(selectedPermissions),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "فشل في إنشاء الدور");
      }

      toast.success("تم إنشاء الدور بنجاح");
      router.push("/admin/roles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل في إنشاء الدور");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 border border-red-500/10 rounded-3xl backdrop-blur-xl">
        <Shield className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h3 className="text-2xl font-black text-white mb-2">منطقة محظورة ⚔️</h3>
        <p className="text-gray-500 mb-8 max-w-sm">
          ليس لديك الصلاحيات الكافية لإنشاء أدوار جديدة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إنشاء دور جديد"
        description="قم بإنشاء دور جديد وتحديد الصلاحيات المناسبة له."
        eyebrow="إدارة الأدوار"
      >
        <AdminButton variant="outline" icon={ArrowRight} onClick={() => router.push("/admin/roles")}>
          العودة للأدوار
        </AdminButton>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="admin-glass p-6 rounded-[2rem] border border-white/10">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            معلومات الدور
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">اسم الدور *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: MANAGER"
                className="mt-2"
                required
              />
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
            onClick={() => router.push("/admin/roles")}
          >
            إلغاء
          </AdminButton>
          <AdminButton
            type="submit"
            loading={isSubmitting}
            disabled={!formData.name.trim()}
          >
            إنشاء الدور
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
