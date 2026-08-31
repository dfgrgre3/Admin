"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin-users-api";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function useAvatarUpload(userId: string) {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => adminUsersApi.uploadAvatar(userId, file),
    onSuccess: (updatedUser: { avatar?: string | null }) => {
      toast.success("تم تحديث الصورة الشخصية بنجاح");
      queryClient.setQueryData(["admin", "user", userId], (old: unknown) => ({
        ...(typeof old === "object" && old !== null ? old : {}),
        ...updatedUser,
        avatar: updatedUser.avatar ?? undefined,
      }));
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "فشل رفع الصورة الشخصية");
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("يجب اختيار ملف صورة صالح");
      return;
    }
    mutation.mutate(file);
    event.target.value = "";
  };

  return {
    fileInputRef,
    isUploading: mutation.isPending,
    openPicker: () => fileInputRef.current?.click(),
    handleFileChange,
  };
}