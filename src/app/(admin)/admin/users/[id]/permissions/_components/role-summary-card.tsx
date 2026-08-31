"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { permissionLabels } from "../_lib/permission-labels";

interface RoleSummaryCardProps {
  role: string;
  selectedPermissions: string[];
}

export function RoleSummaryCard({ role, selectedPermissions }: RoleSummaryCardProps) {
  return (
    <Card className="border-primary/15 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5" />
          ملخص الدور
        </CardTitle>
        <CardDescription>
          الدور الحالي: <span className="font-medium text-foreground">{role}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {selectedPermissions.map(permission => (
          <AdminBadge key={permission} variant="outline" status="info">
            {permissionLabels[permission] || permission}
          </AdminBadge>
        ))}
      </CardContent>
    </Card>
  );
}