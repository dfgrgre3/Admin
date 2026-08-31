"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { adminAudit } from "@/lib/admin-audit";
import { logger } from "@/lib/logger";

export function useBulkUserActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });

  const handleDelete = async (ids: string[]) => {
    try {
      const response = await adminFetch(apiRoutes.admin.users, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("delete_failed");
      toast.success(`تم حذف ${ids.length} مستخدم`);
      adminAudit.record("users.delete.bulk", { ids });
      invalidate();
    } catch (err) {
      logger.error("Delete failed", err);
      toast.error("فشل حذف المستخدمين");
    }
  };

  const handleRestore = async (ids: string[]) => {
    try {
      const response = await adminFetch(`${apiRoutes.admin.users}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("restore_failed");
      toast.success(`تم استعادة ${ids.length} مستخدم`);
      adminAudit.record("users.restore.bulk", { ids });
      invalidate();
    } catch (err) {
      logger.error("Restore failed", err);
      toast.error("فشل استعادة المستخدمين");
    }
  };

  const handleSuspend = async (ids: string[], reason: string) => {
    try {
      const response = await adminFetch(`${apiRoutes.admin.users}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, reason }),
      });
      if (!response.ok) throw new Error("suspend_failed");
      toast.success(`تم إيقاف ${ids.length} مستخدم`);
      adminAudit.record("users.suspend.bulk", { ids, reason });
      invalidate();
    } catch (err) {
      logger.error("Suspend failed", err);
      toast.error("فشل إيقاف المستخدمين");
    }
  };

  const handleActivate = async (ids: string[]) => {
    try {
      const response = await adminFetch(`${apiRoutes.admin.users}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("activate_failed");
      toast.success(`تم تفعيل ${ids.length} مستخدم`);
      adminAudit.record("users.activate.bulk", { ids });
      invalidate();
    } catch (err) {
      logger.error("Activate failed", err);
      toast.error("فشل تفعيل المستخدمين");
    }
  };

  return { handleDelete, handleRestore, handleSuspend, handleActivate };
}