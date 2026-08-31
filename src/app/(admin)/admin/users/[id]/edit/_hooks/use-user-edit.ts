"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { logger } from "@/lib/logger";
import { userEditSchema, defaultEditValues, type UserEditFormValues } from "../_schemas/user-edit-schema";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  role: string;
  emailVerified: boolean | null;
  phone: string | null;
  phoneVerified: boolean | null;
  twoFactorEnabled: boolean;
  bio: string | null;
  gradeLevel: string | null;
  educationType: string | null;
  section: string | null;
  school: string | null;
  country: string | null;
  gender: string | null;
  studyGoal: string | null;
  createdAt: string | null;
  lastLogin: string | null;
}

export function useUserEdit(userId: string) {
  const router = useRouter();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: defaultEditValues,
  });

  const formReset = form.reset;

  React.useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const data = await adminUsersApi.get(userId);
        if (cancelled) return;
        setUser(data);
        formReset({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role as UserEditFormValues["role"],
          bio: data.bio || "",
          gradeLevel: data.gradeLevel || "",
          educationType: data.educationType || "",
          section: data.section || "",
          school: data.school || "",
          country: data.country || "",
          gender: (data.gender || "") as UserEditFormValues["gender"],
          studyGoal: data.studyGoal || "",
          emailVerified: data.emailVerified || false,
          phoneVerified: data.phoneVerified || false,
          twoFactorEnabled: data.twoFactorEnabled || false,
        });
      } catch (error) {
        if (cancelled) return;
        logger.error("Error fetching user:", error);
        toast.error("المستخدم غير موجود");
        router.push("/admin/users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, [userId, router, formReset]);

  const handleSubmit = async (values: UserEditFormValues): Promise<void> => {
    setSaving(true);
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        toast.success("تم تحديث بيانات المستخدم بنجاح");
        router.push(`/admin/users/${userId}`);
        return;
      }
      let errorMessage = "حدث خطأ أثناء تحديث بيانات المستخدم";
      try {
        const errorBody = await response.json();
        if (errorBody?.error) errorMessage = errorBody.error;
      } catch {
        // ignore — keep default message
      }
      toast.error(errorMessage);
    } catch (error) {
      logger.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setSaving(false);
    }
  };

  return { user, loading, saving, form, handleSubmit: form.handleSubmit(handleSubmit) };
}