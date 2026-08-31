"use client";

import { TableProperties, UserCog } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getAllPermissionMetas } from "@/lib/permission-matrix-config";
import { PermissionsInfoBanner } from "./_components/permissions-info-banner";
import { RoleMatrixTab } from "./_components/role-matrix-tab";
import { RoleOverviewGrid } from "./_components/role-overview-grid";
import { UserPermissionsTab } from "./_components/user-permissions-tab";

export default function PermissionsPage() {
  const { hasPermission } = usePermission();
  const canAssignPermissions = hasPermission(PERMISSIONS.USERS_ASSIGN_PERMISSIONS);
  const totalPermissions = getAllPermissionMetas().length;

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="مصفوفة الصلاحيات"
        description="إدارة شاملة لأدوار وصلاحيات فريق العمل — عرض وتخصيص صلاحيات كل دور وإدارة الاستثناءات الفردية"
      />

      <PermissionsInfoBanner />
      <RoleOverviewGrid />

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 rounded-2xl">
          <TabsTrigger value="matrix" className="rounded-xl gap-2 text-sm font-bold">
            <TableProperties className="h-4 w-4" />
            مصفوفة الأدوار
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl gap-2 text-sm font-bold">
            <UserCog className="h-4 w-4" />
            استثناءات المستخدمين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-6">
          <RoleMatrixTab totalPermissions={totalPermissions} />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserPermissionsTab canAssignPermissions={canAssignPermissions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}