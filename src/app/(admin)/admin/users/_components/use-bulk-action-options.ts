"use client";

import { useMemo } from "react";
import {
  Ban,
  Bell,
  CheckCircle,
  Download,
  RotateCcw,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import { useExport } from "@/lib/export-utils";

export function useBulkActionOptions(s: any) {
  const { exportToCSV } = useExport();

  return useMemo(() => {
    const actions: Array<{
      label: string;
      icon: typeof Bell;
      variant: "outline" | "destructive";
      onClick: (rows: AdminUserListItem[]) => void;
    }> = [];

    if (s.canSendNotifications) {
      actions.push({
        label: "إرسال إشعار جماعي",
        icon: Bell,
        variant: "outline",
        onClick: (rows) => s.setMessageDialog({ open: true, users: rows }),
      });
    }

    if (s.canSuspendUsers) {
      actions.push({
        label: "تعليق الحسابات",
        icon: Ban,
        variant: "outline",
        onClick: (rows) =>
          s.setSuspendDialog({ open: true, ids: rows.map((r) => r.id) }),
      });
      actions.push({
        label: "تفعيل الحسابات",
        icon: CheckCircle,
        variant: "outline",
        onClick: (rows) =>
          s.setActivateDialog({ open: true, ids: rows.map((r) => r.id) }),
      });
    }

    if (s.canAssignRoles) {
      actions.push({
        label: "تعيين دور",
        icon: UserCog,
        variant: "outline",
        onClick: (rows) =>
          s.setBulkRoleDialog({ open: true, ids: rows.map((r) => r.id) }),
      });
    }

    if (s.canExportUsers) {
      actions.push({
        label: "تصدير المحدد CSV",
        icon: Download,
        variant: "outline",
        onClick: (rows) => {
          exportToCSV(
            rows,
            [
              { header: "الاسم", accessor: (item: AdminUserListItem) => item.name || item.username || "بدون اسم" },
              { header: "البريد", accessor: "email" as const },
              { header: "الهاتف", accessor: (item: AdminUserListItem) => item.phone || "" },
              { header: "الدور", accessor: "role" as const },
              { header: "الحالة", accessor: "status" as const },
              { header: "الدولة", accessor: (item: AdminUserListItem) => item.country || "" },
              { header: "الرصيد", accessor: (item: AdminUserListItem) => item.walletBalance || 0 },
            ],
            "selected-users",
          );
          toast.success(`تم تصدير ${rows.length} مستخدم`);
        },
      });
    }

    if (s.canRestoreUsers) {
      actions.push({
        label: "استعادة",
        icon: RotateCcw,
        variant: "outline",
        onClick: (rows) =>
          s.setRestoreDialog({ open: true, ids: rows.map((r) => r.id) }),
      });
    }

    if (s.canDeleteUsers) {
      actions.push({
        label: "حذف",
        icon: Trash2,
        variant: "destructive",
        onClick: (rows) =>
          s.setDeleteDialog({ open: true, ids: rows.map((r) => r.id) }),
      });
    }

    return actions;
  }, [s, exportToCSV]);
}