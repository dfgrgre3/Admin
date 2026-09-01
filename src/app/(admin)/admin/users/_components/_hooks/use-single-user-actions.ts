"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { adminAudit } from "@/lib/admin-audit";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/types/enums";
import { canAssignRole } from "@/lib/user-action-guards";

type CurrentUser = { id: string; role: UserRole } | null | undefined;

export function useSingleUserActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["admin-users-list"] }),
    [queryClient],
  );

  const handleResetPassword = useCallback(
    async (userId: string, newPassword: string) => {
      try {
        const response = await adminFetch(
          `${apiRoutes.admin.users}/${userId}/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword }),
          },
        );
        if (!response.ok) throw new Error("reset_failed");
        toast.success("تم إعادة تعيين كلمة المرور");
        adminAudit.record("users.reset_password", { userId });
      } catch (err) {
        logger.error("Reset password failed", err);
        toast.error("فشل إعادة تعيين كلمة المرور");
      }
    },
    [],
  );

  const handleVerify = useCallback(
    async (userId: string, type: "email" | "phone") => {
      try {
        const response = await adminFetch(
          `${apiRoutes.admin.users}/${userId}/verify-${type}`,
          { method: "POST" },
        );
        if (!response.ok) throw new Error("verify_failed");
        toast.success(`تم توثيق ${type === "email" ? "البريد" : "الهاتف"}`);
        adminAudit.record("users.verify", { userId, type });
        invalidate();
      } catch (err) {
        logger.error("Verify failed", err);
        toast.error("فشل التوثيق");
      }
    },
    [invalidate],
  );

  const handleAssignRole = useCallback(
    async (userId: string, role: UserRole, currentUser: CurrentUser) => {
      if (currentUser?.id === userId) {
        toast.error("لا يمكنك تغيير دور حسابك الحالي");
        return;
      }
      if (!canAssignRole(currentUser?.role as UserRole, role)) {
        toast.error("لا يمكنك منح دور أعلى من دورك");
        return;
      }
      try {
        const response = await adminFetch(`${apiRoutes.admin.users}/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        if (!response.ok) throw new Error("assign_role_failed");
        toast.success("تم تحديث الدور");
        adminAudit.record("users.assign_role", { userId, role });
        invalidate();
      } catch (err) {
        logger.error("Assign role failed", err);
        toast.error("فشل تحديث الدور");
      }
    },
    [invalidate],
  );

  return { handleResetPassword, handleVerify, handleAssignRole };
}

export function useUserSessionActions() {
  const router = useRouter();

  const handleImpersonate = useCallback(
    async (userId: string) => {
      try {
        const response = await adminFetch(
          `${apiRoutes.admin.users}/${userId}/impersonate`,
          { method: "POST" },
        );
        if (!response.ok) throw new Error("impersonate_failed");
        const data = await response.json();
        toast.success("تم بدء تسجيل الدخول كـ");
        adminAudit.record("users.impersonate", { userId });
        router.push(data.redirect || "/dashboard");
      } catch (err) {
        logger.error("Impersonate failed", err);
        toast.error("فشل تسجيل الدخول كـ");
      }
    },
    [router],
  );

  const handleTerminateAllSessions = useCallback(async (userId: string) => {
    try {
      const response = await adminFetch(
        `${apiRoutes.admin.users}/${userId}/sessions/terminate-all`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("terminate_failed");
      toast.success("تم إنهاء كل الجلسات");
      adminAudit.record("users.terminate_sessions", { userId });
    } catch (err) {
      logger.error("Terminate sessions failed", err);
      toast.error("فشل إنهاء الجلسات");
    }
  }, []);

  const handleSendActivationLink = useCallback(async (userId: string) => {
    try {
      const response = await adminFetch(
        `${apiRoutes.admin.users}/${userId}/send-activation`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("send_link_failed");
      toast.success("تم إرسال رابط التفعيل");
      adminAudit.record("users.send_activation", { userId });
    } catch (err) {
      logger.error("Send activation failed", err);
      toast.error("فشل إرسال رابط التفعيل");
    }
  }, []);

  return {
    handleImpersonate,
    handleTerminateAllSessions,
    handleSendActivationLink,
  };
}