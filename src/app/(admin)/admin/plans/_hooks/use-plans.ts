"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { PlanFormValues, SubscriptionPlan } from "../_lib/types";
import { parsePlanList, toPlanPayload } from "../_lib/utils";

const plansKey = ["admin", "plans"] as const;

const JSON_HEADERS = { "Content-Type": "application/json" };

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}

// ---------- القراءة ----------

export function usePlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: plansKey,
    queryFn: async ({ signal }) => {
      const res = await adminFetch(apiRoutes.admin.plans, { signal });
      if (!res.ok) throw new Error(await readError(res, "فشل تحميل الخطط"));
      const json = await res.json();
      return parsePlanList(json);
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    meta: { errorMessage: "فشل تحميل الخطط" },
  });
}

// ---------- الإنشاء ----------

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PlanFormValues) => {
      const res = await adminFetch(apiRoutes.admin.plans, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(toPlanPayload(values)),
      });
      if (!res.ok) throw new Error(await readError(res, "فشل في إنشاء الخطة"));
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم إنشاء الخطة بنجاح");
      queryClient.invalidateQueries({ queryKey: plansKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Create plan error:", error);
    },
  });
}

// ---------- التحديث ----------

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PlanFormValues }) => {
      const res = await adminFetch(apiRoutes.admin.planById(id), {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify(toPlanPayload(values)),
      });
      if (!res.ok) throw new Error(await readError(res, "فشل في تحديث الخطة"));
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث الخطة بنجاح");
      queryClient.invalidateQueries({ queryKey: plansKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Update plan error:", error);
    },
  });
}

// ---------- الحذف ----------

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(apiRoutes.admin.planById(id), { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "فشل حذف الخطة");
      return data;
    },
    onSuccess: (data) => {
      // الـ Backend قد يعطّل الخطة بدل حذفها إذا كانت مستخدمة
      toast.success(data?.data?.message || "تم حذف الخطة");
      queryClient.invalidateQueries({ queryKey: plansKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Delete plan error:", error);
    },
  });
}

// ---------- تفعيل / تعطيل ----------

export function useTogglePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await adminFetch(apiRoutes.admin.planById(id), {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error(await readError(res, "فشل تحديث الحالة"));
      return { id, isActive };
    },
    onSuccess: ({ isActive }) => {
      toast.success(isActive ? "تم تفعيل الخطة" : "تم تعطيل الخطة");
      queryClient.invalidateQueries({ queryKey: plansKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Toggle plan error:", error);
    },
  });
}

// ---------- عمليات جماعية ----------

export function useBulkTogglePlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, isActive }: { ids: string[]; isActive: boolean }) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          adminFetch(apiRoutes.admin.planById(id), {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify({ isActive }),
          })
        )
      );
      const success = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
      return { success, failed: ids.length - success, isActive };
    },
    onSuccess: ({ success, failed, isActive }) => {
      if (success > 0) {
        toast.success(isActive ? `تم تفعيل ${success} خطة` : `تم تعطيل ${success} خطة`);
      }
      if (failed > 0) toast.error(`فشل تحديث ${failed} خطة`);
      queryClient.invalidateQueries({ queryKey: plansKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Bulk toggle plans error:", error);
    },
  });
}

export function useBulkDeletePlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => adminFetch(apiRoutes.admin.planById(id), { method: "DELETE" }))
      );
      const success = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
      return { success, failed: ids.length - success };
    },
    onSuccess: ({ success, failed }) => {
      if (success > 0) toast.success(`تم حذف ${success} خطة بنجاح`);
      if (failed > 0) toast.error(`فشل حذف ${failed} خطة`);
      queryClient.invalidateQueries({ queryKey: plansKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      logger.error("Bulk delete plans error:", error);
    },
  });
}
