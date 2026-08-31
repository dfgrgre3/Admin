"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { permissionLabels } from "../_lib/permission-labels";

interface PermissionRowProps {
  permission: string;
  checked: boolean;
  onToggle: (permission: string, checked: boolean) => void;
}

export function PermissionRow({ permission, checked, onToggle }: PermissionRowProps) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-2xl border p-4 transition-colors hover:bg-muted/40">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{permissionLabels[permission] || permission}</span>
        </div>
        <p className="text-xs text-muted-foreground">{permission}</p>
      </div>
      <Checkbox
        checked={checked}
        onCheckedChange={value => onToggle(permission, value === true)}
      />
    </label>
  );
}