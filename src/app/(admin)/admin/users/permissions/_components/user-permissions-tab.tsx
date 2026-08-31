"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { UserPermissionsManager } from "@/components/admin/permissions/user-permissions-manager";
import { Badge } from "@/components/ui/badge";
import { adminAudit } from "@/lib/admin-audit";

interface UserPermissionsTabProps {
  canAssignPermissions: boolean;
}

export function UserPermissionsTab({ canAssignPermissions }: UserPermissionsTabProps) {
  return (
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
  );
}