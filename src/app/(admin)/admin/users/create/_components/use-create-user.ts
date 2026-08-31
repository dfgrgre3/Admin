"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { logger } from "@/lib/logger";
import {
  createUserSchema,
  createUserDefaultValues,
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_SIZE_MB,
} from "./create-user-schema";
import type { CreateUserValues } from "./create-user-schema";

export function useCreateUserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: createUserDefaultValues,
  });

  const handleAvatarUpload = React.useCallback((file: File) => {
    if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة يجب ألا يتجاوز ${AVATAR_MAX_SIZE_MB}MB`);
      return;
    }
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("نوع الصورة غير مدعوم. الأنواع المسموحة: JPEG, PNG, WebP, GIF");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const resetAvatar = React.useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(null);
  }, []);

  const handleSubmit = React.useCallback(
    async (values: CreateUserValues) => {
      setIsSubmitting(true);
      try {
        const payload: Record<string, unknown> = {
          name: `${values.firstName} ${values.lastName}`.trim(),
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username || undefined,
          email: values.email,
          phone: values.phone || undefined,
          password: values.password,
          role: values.role,
          status: values.status,
          country: values.country || undefined,
          city: values.city || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          gender: values.gender || undefined,
          language: values.language || undefined,
          timezone: values.timezone || undefined,
          bio: values.bio || undefined,
        };

        const response = await adminFetch(apiRoutes.admin.users, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responsePayload = await response.json();
        if (!response.ok) {
          toast.error(responsePayload.error || "تعذر إنشاء المستخدم");
          return;
        }

        const userId = responsePayload.data?.id ?? responsePayload.id;

        if (avatarFile && userId) {
          try {
            await adminUsersApi.uploadAvatar(userId, avatarFile);
            toast.success("تم رفع الصورة الشخصية بنجاح");
          } catch (avatarErr) {
            toast.warning("تم إنشاء المستخدم لكن فشل رفع الصورة");
            logger.error("Avatar upload failed", avatarErr);
          }
        }

        toast.success("تم إنشاء المستخدم بنجاح");
        router.push(`/admin/users/${userId}`);
      } catch (error) {
        logger.error("Error creating user:", error);
        toast.error("حدث خطأ أثناء إنشاء المستخدم");
      } finally {
        setIsSubmitting(false);
      }
    },
    [avatarFile, router],
  );

  return {
    form,
    isSubmitting,
    avatarFile,
    avatarPreview,
    handleAvatarUpload,
    resetAvatar,
    handleSubmit,
  };
}