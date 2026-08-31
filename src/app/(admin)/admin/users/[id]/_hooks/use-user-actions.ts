"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { apiRoutes } from "@/lib/api/routes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import {
  pickEditableUserFields,
  type UserDetails,
} from "../_components/types";
import type { PasswordResetFormData } from "@/lib/validations/user-schemas";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import type { DangerousUserAction } from "@/lib/user-action-guards";
import type { usePermission } from "@/components/auth/PermissionGuard";

const RESERVED_ROUTE_SEGMENTS = new Set(["edit", "new", "create", "permissions"]);

export function useUserDetails(userId: string) {
  const router = useRouter();
  return useQuery<UserDetails>({
    queryKey: ["admin", "user", userId],
    queryFn: async ({ signal }) => {
      if (!userId || RESERVED_ROUTE_SEGMENTS.has(userId)) {
        router.replace("/admin/users");
        throw new Error("Invalid user ID");
      }
      return adminUsersApi.get(userId, { signal });
    },
    retry: 1,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    meta: { errorMessage: "المستخدم غير موجود" },
  });
}

export function useUserMutations(
  userId: string,
  currentUser: ReturnType<typeof usePermission>["user"],
  canManageUsers: boolean,
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (userData: Partial<UserDetails>) => {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pickEditableUserFields(userData)),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "فشل تحديث البيانات");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث بيانات المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "حدث خطأ أثناء تحديث البيانات");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "فشل حذف المستخدم");
      }
    },
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      router.push("/admin/users");
    },
    onError: (err: Error) => toast.error(err.message || "حدث خطأ أثناء حذف المستخدم"),
  });

  const validateAction = (
    target: UserDetails | undefined,
    action: DangerousUserAction,
  ): UserDetails | null => {
    if (!target || !canManageUsers) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return null;
    }
    const block = getUserActionBlockReason(currentUser, target, action);
    if (block) {
      toast.error(block);
      return null;
    }
    return target;
  };

  return {
    updateMutation,
    deleteMutation,
    validateAction,
    queryClient,
    router,
  };
}

export function usePasswordReset(
  userId: string,
  user: UserDetails | undefined,
  currentUser: ReturnType<typeof usePermission>["user"],
  canManageUsers: boolean,
  onSuccess?: () => void,
) {
  return React.useCallback(
    async (formData: PasswordResetFormData): Promise<boolean> => {
      if (!user || !canManageUsers) {
        toast.error("غير مصرح بتنفيذ الإجراء");
        return false;
      }
      const block = getUserActionBlockReason(currentUser, user, "reset-password");
      if (block) {
        toast.error(block);
        return false;
      }
      try {
        const response = await adminFetch(`/admin/users/${userId}/password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: formData.newPassword }),
        });
        if (response.ok) {
          toast.success("تم تغيير كلمة مرور المستخدم بنجاح وجلساته النشطة ألغيت");
          onSuccess?.();
          return true;
        }
        const data = await response.json();
        toast.error(data.error || data.message || "حدث خطأ أثناء تغيير كلمة المرور");
        return false;
      } catch (error) {
        logger.error("Error resetting password:", error);
        toast.error("خطأ في الاتصال بالخادم");
        return false;
      }
    },
    [userId, user, currentUser, canManageUsers, onSuccess],
  );
}

export function useImpersonate(
  currentUser: ReturnType<typeof usePermission>["user"],
  canManageUsers: boolean,
) {
  const [impersonating, setImpersonating] = React.useState(false);

  const impersonate = React.useCallback(
    async (targetUserId: string, targetName: string, target?: UserDetails) => {
      if (!target) return;
      const block = getUserActionBlockReason(currentUser, target, "impersonate");
      if (!canManageUsers || block) {
        toast.error(block || "غير مصرح بتنفيذ الإجراء");
        return;
      }
      setImpersonating(true);
      try {
        const res = await adminFetch(apiRoutes.admin.impersonateById(targetUserId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          credentials: "include",
        });
        if (res.ok) {
          toast.success(`تم تبديل الهوية إلى ${targetName}، جاري التوجيه...`);
          window.location.href = "/";
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error || "فشل في تبديل الهوية");
        }
      } catch (error) {
        logger.error("فشل تبديل الهوية", error);
        toast.error("خطأ في الاتصال بالخادم");
      } finally {
        setImpersonating(false);
      }
    },
    [currentUser, canManageUsers],
  );

  return { impersonate, impersonating, setImpersonating };
}