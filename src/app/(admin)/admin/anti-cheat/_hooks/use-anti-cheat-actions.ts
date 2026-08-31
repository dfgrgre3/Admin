"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { logAdminAction } from "@/lib/admin-audit";
import { ANTI_CHEAT_QUERY_KEY } from "../_lib/constants";
import { STATUS_CONFIG, type AntiCheatFlag, type AntiCheatStatus } from "../_components/types";

interface UseAntiCheatActionsOptions {
  onSuccess?: () => void;
}

export function useAntiCheatActions(options: UseAntiCheatActionsOptions = {}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = React.useState<string | null>(null);

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [ANTI_CHEAT_QUERY_KEY] });
    options.onSuccess?.();
  }, [queryClient, options]);

  const updateStatus = React.useCallback(
    async (flagId: string, status: AntiCheatStatus, reviewNote?: string | null) => {
      setSubmitting(flagId);
      const toastId = toast.loading("جاري تحديث الحالة...");
      try {
        const response = await adminFetch(apiRoutes.admin.antiCheatFlag(flagId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, reviewNote: reviewNote ?? null }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error || "فشل تحديث الحالة");
        }
        toast.success(`تم تحديث الحالة إلى «${STATUS_CONFIG[status].label}»`, { id: toastId });
        logAdminAction("UPDATE", "anti_cheat_flag", {
          entityId: flagId,
          details: { status, reviewNote },
        });
        refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "خطأ في الاتصال بالخادم", { id: toastId });
      } finally {
        setSubmitting(null);
      }
    },
    [refresh]
  );

  const bulkUpdateStatus = React.useCallback(
    async (flags: AntiCheatFlag[], status: AntiCheatStatus) => {
      if (flags.length === 0) return;
      const toastId = toast.loading(
        `تطبيق «${STATUS_CONFIG[status].label}» على ${flags.length} حالة...`
      );
      let success = 0;
      let failed = 0;
      for (const flag of flags) {
        try {
          const response = await adminFetch(apiRoutes.admin.antiCheatFlag(flag.id), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (response.ok) success++;
          else failed++;
        } catch {
          failed++;
        }
      }
      toast.success(`تم تحديث ${success} حالة${failed ? `، فشل ${failed}` : ""}`, {
        id: toastId,
      });
      logAdminAction("UPDATE", "anti_cheat_flag_bulk", {
        details: { status, success, failed, count: flags.length },
      });
      refresh();
    },
    [refresh]
  );

  const recordEvent = React.useCallback(
    async (payload: {
      userId: string;
      examId?: string | null;
      attemptId?: string | null;
      eventType: string;
      severity?: string;
      detail?: string | null;
      ipAddress?: string;
    }) => {
      const toastId = toast.loading("جاري تسجيل الحدث...");
      try {
        const response = await adminFetch(apiRoutes.admin.antiCheatEvents, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            examId: payload.examId || null,
            attemptId: payload.attemptId || null,
            detail: payload.detail || null,
          }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error || "فشل في تسجيل الحدث");
        }
        toast.success("تم تسجيل الحدث بنجاح", { id: toastId });
        logAdminAction("CREATE", "anti_cheat_event", {
          details: { eventType: payload.eventType, userId: payload.userId },
        });
        refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "خطأ في الاتصال بالخادم", {
          id: toastId,
        });
      }
    },
    [refresh]
  );

  return {
    submitting,
    updateStatus,
    bulkUpdateStatus,
    recordEvent,
    refresh,
  };
}