"use client";

import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import type { SubscriptionPlan } from "../_lib/types";
import { useDeletePlan } from "../_hooks/use-plans";

interface PlanDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
}

export function PlanDeleteDialog({ open, onOpenChange, plan }: PlanDeleteDialogProps) {
  const deleteMutation = useDeletePlan();

  const handleConfirm = async () => {
    if (!plan) return;
    try {
      await deleteMutation.mutateAsync(plan.id);
      onOpenChange(false);
    } catch {
      // رسالة الخطأ معروضة داخل الـ hook
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف الخطة"
      description={
        plan
          ? `هل أنت متأكد من حذف خطة "${plan.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء. إذا كانت الخطة مستخدمة من قبل مشتركين سيتم تعطيلها بدلاً من حذفها.`
          : "هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء."
      }
      confirmText="حذف"
      cancelText="إلغاء"
      onConfirm={handleConfirm}
      variant="destructive"
      loading={deleteMutation.isPending}
    />
  );
}
