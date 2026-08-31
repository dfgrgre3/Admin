"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { UserAchievement, GrantAchievementPayload } from "../_lib/types";

const USER_ACHIEVEMENTS_ENDPOINT = "/api/admin/user-achievements";

export function useUserAchievements(filters?: {
  userId?: string;
  achievementId?: string;
}) {
  return useQuery<UserAchievement[]>({
    queryKey: ["admin", "user-achievements", filters],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.achievementId) params.append("achievementId", filters.achievementId);

      const url = params.toString()
        ? `${USER_ACHIEVEMENTS_ENDPOINT}?${params.toString()}`
        : USER_ACHIEVEMENTS_ENDPOINT;

      const response = await adminFetch(url, { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGrantAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GrantAchievementPayload) => {
      const response = await adminFetch(USER_ACHIEVEMENTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "فشل منح الوسام");
      }
      return data;
    },
    onSuccess: (_, variables) => {
      const count = variables.userIds.length;
      toast.success(`تم منح الوسام لـ ${count} مستخدم بنجاح`);
      queryClient.invalidateQueries({ queryKey: ["admin", "user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Grant achievement error:", error);
    },
  });
}

export function useRevokeAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userAchievementId: string) => {
      const response = await adminFetch(`${USER_ACHIEVEMENTS_ENDPOINT}/${userAchievementId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("فشل إلغاء الوسام");
      }
      return userAchievementId;
    },
    onSuccess: () => {
      toast.success("تم إلغاء الوسام بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Revoke achievement error:", error);
    },
  });
}