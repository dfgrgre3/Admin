"use client";

import type { UserStatus } from "@/types/enums";

export const statusColors: Record<UserStatus, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  SUSPENDED: "bg-warning/10 text-warning border-warning/20",
  BANNED: "bg-danger/10 text-danger border-danger/20",
  INACTIVE: "bg-muted text-muted-foreground border-border/20",
  DELETED: "bg-muted text-muted-foreground border-border/20",
  PENDING_VERIFICATION: "bg-info/10 text-info border-info/20",
};

export const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "نشط",
  SUSPENDED: "موقوف",
  BANNED: "محظور",
  INACTIVE: "غير نشط",
  DELETED: "محذوف",
  PENDING_VERIFICATION: "قيد التحقق",
};