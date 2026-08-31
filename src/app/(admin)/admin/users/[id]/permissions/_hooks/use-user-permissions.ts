"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { PERMISSIONS, stripPermissionsSentinel } from "@/lib/permissions";
import { logger } from "@/lib/logger";

export interface UserPermissionsResponse {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "MODERATOR" | "USER";
  permissions?: string[];
}

export function useUserPermissions() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = React.useState<UserPermissionsResponse | null>(null);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const response = await adminFetch(`${apiRoutes.admin.users}/${userId}`);
        if (cancelled) return;
        if (!response.ok) {
          toast.error("تعذر تحميل بيانات المستخدم");
          router.push("/admin/users");
          return;
        }
        const data = (await response.json()) as UserPermissionsResponse;
        if (cancelled) return;
        setUser(data);
        setSelected(stripPermissionsSentinel(data.permissions ?? []));
      } catch (error) {
        if (cancelled) return;
        logger.error("Error fetching user permissions:", error);
        toast.error("حدث خطأ أثناء تحميل الصلاحيات");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, [router, userId]);

  const togglePermission = React.useCallback((permission: string, checked: boolean) => {
    setSelected(current =>
      checked
        ? Array.from(new Set([...current, permission]))
        : current.filter(item => item !== permission),
    );
  }, []);

  const handleSave = async () => {
    if (!user) return;
    const permsToSave = stripPermissionsSentinel(selected);
    const grantsBypass =
      permsToSave.includes(PERMISSIONS.ADMIN_BYPASS) &&
      !(user.permissions ?? []).includes(PERMISSIONS.ADMIN_BYPASS);
    if (grantsBypass) {
      const confirmed = confirm(
        "أنت على وشك منح هذا المستخدم تجاوزاً كاملاً للصلاحيات (admin:bypass).\n\n" +
          "سيحصل على وصول غير مقيد إلى كل صفحة وكل عملية وكل واجهة برمجية.\n\nهل تريد المتابعة؟",
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      const response = await adminFetch(apiRoutes.admin.users, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissions: permsToSave }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "تعذر حفظ الصلاحيات");
        return;
      }
      toast.success("تم تحديث الصلاحيات");
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      logger.error("Error saving permissions:", error);
      toast.error("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    userId,
    user,
    selected,
    isLoading,
    isSaving,
    togglePermission,
    handleSave,
    router,
  };
}