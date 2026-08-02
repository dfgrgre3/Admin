"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { RoleMatrix } from "@/components/admin/permissions/role-matrix";
import { UserPermissionsManager } from "@/components/admin/permissions/user-permissions-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { adminAudit } from "@/lib/admin-audit";
import {
  ShieldCheck,
  TableProperties,
  UserCog,
  Info,
  Lock,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getStaffRoles, getRolePermissionCount, getAllPermissionMetas } from "@/lib/permission-matrix-config";

export default function PermissionsPage() {
  const { hasPermission } = usePermission();
  const canAssignPermissions = hasPermission(PERMISSIONS.USERS_ASSIGN_PERMISSIONS);

  const staffRoles = getStaffRoles();
  const totalPermissions = getAllPermissionMetas().length;

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="مصفوفة الصلاحيات"
        description="إدارة شاملة لأدوار وصلاحيات فريق العمل — عرض وتخصيص صلاحيات كل دور وإدارة الاستثناءات الفردية"
      />

      {/* Info banner */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-sm mb-1">كيف تعمل مصفوفة الصلاحيات؟</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              الصلاحيات تُدار بشكل فردي لكل مستخدم، وقائمة الصلاحيات المخزنة في قاعدة البيانات هي المصدر
              الوحيد والكامل لما يستطيع المستخدم فعله. الدور الوظيفي لا يمنح أي صلاحية إضافية بذاته،
              وصلاحية التجاوز الكامل (admin:bypass) يجب منحها بوعي لمنح الوصول إلى كل شيء.
            </p>
          </div>
        </div>
      </Card>

      {/* Role overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {staffRoles.map((role) => {
          const { total } = getRolePermissionCount(role.role);
          const percentage = totalPermissions > 0 ? Math.round((total / totalPermissions) * 100) : 0;
          return (
            <Card
              key={role.role}
              className={`p-4 space-y-2 border ${role.badgeClass} hover:shadow-lg transition-all cursor-default`}
            >
              <div className="flex items-center justify-between">
                <p className="font-black text-sm">{role.label}</p>
                {role.isSystem && (
                  <Lock className="h-3 w-3 opacity-50" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">{total}</span>
                <span className="text-xs text-muted-foreground">/ {totalPermissions} صلاحية</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-current opacity-60 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[10px] font-bold opacity-70 line-clamp-2">{role.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Main tabs */}
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

        {/* Role Matrix Tab */}
        <TabsContent value="matrix" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-black">مصفوفة صلاحيات الأدوار</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  عرض جميع الصلاحيات الممنوحة لكل دور وظيفي في النظام ({totalPermissions} صلاحية إجمالية)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold">
                  <Eye className="h-3 w-3 ml-1" />
                  عرض فقط
                </Badge>
              </div>
            </div>
            <RoleMatrix editable={false} />
          </div>
        </TabsContent>

        {/* User Permissions Tab */}
        <TabsContent value="users" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-black">إدارة استثناءات المستخدمين</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  منح أو سحب صلاحيات فردية لأعضاء فريق العمل فوق صلاحيات أدوارهم الافتراضية
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canAssignPermissions ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-none">
                    <ShieldCheck className="h-3 w-3 ml-1" />
                    صلاحية التعديل
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    <Lock className="h-3 w-3 ml-1" />
                    صلاحية مطلوبة
                  </Badge>
                )}
              </div>
            </div>
            <UserPermissionsManager
              onSaved={() => adminAudit.record("permissions.user_updated")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}