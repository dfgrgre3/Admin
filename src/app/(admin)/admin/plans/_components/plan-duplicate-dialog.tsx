"use client";

import * as React from "react";
import { Copy, Info, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminButton } from "@/components/admin/ui/admin-button";
import type { PlanFormValues, SubscriptionPlan } from "../_lib/types";
import { INTERVAL_COLORS, INTERVAL_LABELS } from "../_lib/constants";
import { useCreatePlan } from "../_hooks/use-plans";

interface PlanDuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
}

// توليد اسم فريد للنسخة لتجنب تعارض الاسم الفريد في الـ Backend
function buildCopyValues(
  plan: SubscriptionPlan,
  plans: SubscriptionPlan[]
): PlanFormValues {
  const prefixName = `${plan.name} (نسخة`;
  const prefixNameAr = `${plan.nameAr} (نسخة`;
  const similar = plans.filter(
    (p) => p.name.startsWith(prefixName) || p.nameAr.startsWith(prefixNameAr)
  ).length;
  const suffix = similar + 1;

  return {
    name: `${plan.name} (نسخة-${suffix})`,
    nameAr: `${plan.nameAr} (نسخة-${suffix})`,
    description: plan.description || "",
    price: plan.price,
    currency: plan.currency,
    interval: plan.interval,
    isActive: plan.isActive,
    features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    groupKey: plan.groupKey && plan.groupKey !== plan.id ? plan.groupKey : "",
  };
}

export function PlanDuplicateDialog({
  open,
  onOpenChange,
  plan,
  plans,
}: PlanDuplicateDialogProps) {
  const createMutation = useCreatePlan();

  const handleConfirm = async () => {
    if (!plan) return;
    try {
      await createMutation.mutateAsync(buildCopyValues(plan, plans));
      onOpenChange(false);
    } catch {
      // رسالة الخطأ معروضة داخل الـ hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-[2.5rem] border-white/10 bg-card/80 p-0 shadow-2xl backdrop-blur-xl">
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500" />
        <div className="p-7">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-500">
                <Copy className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-black">نسخ الخطة</DialogTitle>
            </div>
            <DialogDescription className="pt-2 font-bold text-muted-foreground">
              سيتم إنشاء نسخة جديدة من خطة{" "}
              <span className="font-black text-foreground">{plan?.nameAr}</span> بنفس
              البيانات مع اسم معدّل لتجنب التكرار.
            </DialogDescription>
          </DialogHeader>

          {plan && (
            <div className="space-y-3 rounded-2xl border bg-accent/5 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">السعر</span>
                <span className="font-black">
                  {plan.price.toLocaleString("ar-EG")} {plan.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">المدة</span>
                <Badge
                  variant="outline"
                  className={`rounded-lg px-3 py-1 text-xs font-black ${
                    INTERVAL_COLORS[plan.interval] || ""
                  }`}
                >
                  {INTERVAL_LABELS[plan.interval] || plan.interval}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">الحالة</span>
                <span
                  className={`text-xs font-black ${
                    plan.isActive ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  {plan.isActive ? "مفعّلة" : "معطّلة"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-bold text-muted-foreground">المميزات</span>
                <span className="text-left font-medium">
                  {plan.features?.length || 0} ميزة
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            بعد النسخ يمكنك تعديل النسخة الجديدة من قائمة الخطط لتخصيصها.
          </div>

          <DialogFooter className="mt-6">
            <AdminButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </AdminButton>
            <AdminButton
              icon={Copy}
              loading={createMutation.isPending}
              onClick={handleConfirm}
            >
              إنشاء النسخة
            </AdminButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
