"use client";

import React from "react";
import { useUserPermissions, PermissionUserContext } from "@/hooks/use-user-permissions";

interface PermissionGuardProps {
  user?: PermissionUserContext | null;
  permission?: string;
  fieldCategory?: "financial" | "contact" | "audit" | "notes";
  fallback?: React.ReactNode;
  masked?: boolean;
  maskText?: string;
  children: React.ReactNode;
}

export function PermissionGuard({
  user,
  permission,
  fieldCategory,
  fallback = null,
  masked = false,
  maskText = "••••••••",
  children,
}: PermissionGuardProps) {
  const { hasPermission, canViewField } = useUserPermissions(user);

  let isAllowed = true;

  if (permission) {
    isAllowed = isAllowed && hasPermission(permission);
  }

  if (fieldCategory) {
    isAllowed = isAllowed && canViewField(fieldCategory);
  }

  if (!isAllowed) {
    if (masked) {
      return <span className="font-mono text-muted-foreground select-none">{maskText}</span>;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
