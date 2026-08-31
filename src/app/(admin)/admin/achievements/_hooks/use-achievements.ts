"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { Achievement } from "../_lib/types";

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["admin", "achievements"],
    queryFn: async ({ signal }) => {
      const response = await adminFetch(apiRoutes.admin.achievements, { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    meta: { errorMessage: "فشل تحميل الأوسمة" },
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Omit<Achievement, "id" | "unlockedCount" | "createdAt" | "updatedAt">) => {
      const response = await adminFetch(apiRoutes.admin.achievements, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "فشل إنشاء الوسام");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الوسام بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Create achievement error:", error);
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Achievement> }) => {
      const response = await adminFetch(apiRoutes.admin.achievementById(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "فشل تحديث الوسام");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث الوسام بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Update achievement error:", error);
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(apiRoutes.admin.achievementById(id), {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "فشل حذف الوسام");
      }
      return id;
    },
    onSuccess: () => {
      toast.success("تم حذف الوسام بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Delete achievement error:", error);
    },
  });
}

export function useToggleAchievementSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isSecret }: { id: string; isSecret: boolean }) => {
      const response = await adminFetch(apiRoutes.admin.achievementById(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSecret }),
      });
      if (!response.ok) {
        throw new Error("فشل تغيير حالة الوسام");
      }
      return { id, isSecret };
    },
    onSuccess: ({ isSecret }) => {
      toast.success(isSecret ? "تم إخفاء الوسام" : "تم إظهار الوسام للطلاب");
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Toggle achievement secret error:", error);
    },
  });
}

export function useDuplicateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (achievement: Achievement) => {
      const baseKey = achievement.key.replace(/_COPY(?:_\d+)?$/, "");
      const response = await adminFetch(apiRoutes.admin.achievements, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `${baseKey}_COPY`,
          title: `${achievement.title} (نسخة)`,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          xpReward: achievement.xpReward,
          isSecret: achievement.isSecret,
          category: achievement.category,
          difficulty: achievement.difficulty,
          criteria: achievement.criteria,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "فشل تكرار الوسام (تأكد من تفرد المفتاح)");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("تم تكرار الوسام بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Duplicate achievement error:", error);
    },
  });
}

export function useBulkDeleteAchievements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          adminFetch(apiRoutes.admin.achievementById(id), { method: "DELETE" })
        )
      );
      const success = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
      const failed = results.length - success;
      return { success, failed };
    },
    onSuccess: ({ success, failed }) => {
      if (success > 0) toast.success(`تم حذف ${success} وسام بنجاح`);
      if (failed > 0) toast.error(`فشل حذف ${failed} وسام`);
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}