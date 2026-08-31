"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionRow } from "./permission-row";

interface PermissionGroupCardProps {
  title: string;
  permissions: readonly string[];
  selected: string[];
  onToggle: (permission: string, checked: boolean) => void;
}

export function PermissionGroupCard({ title, permissions, selected, onToggle }: PermissionGroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>تفعيل صلاحيات إضافية حسب احتياج هذا المستخدم.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissions.map(permission => (
          <PermissionRow
            key={permission}
            permission={permission}
            checked={selected.includes(permission)}
            onToggle={onToggle}
          />
        ))}
      </CardContent>
    </Card>
  );
}