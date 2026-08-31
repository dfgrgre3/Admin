"use client";

import { Eye, TableProperties } from "lucide-react";
import { RoleMatrix } from "@/components/admin/permissions/role-matrix";
import { Badge } from "@/components/ui/badge";

interface RoleMatrixTabProps {
  totalPermissions: number;
}

export function RoleMatrixTab({ totalPermissions }: RoleMatrixTabProps) {
  return (
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
  );
}