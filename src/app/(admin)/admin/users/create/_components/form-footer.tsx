"use client";

import { Shield, UserPlus } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface FormFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function FormFooter({ isSubmitting, onCancel }: FormFooterProps) {
  return (
    <>
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
          <Shield className="h-4 w-4" />
          ملاحظة
        </div>
        سيتم إرسال طلب الإنشاء إلى الـ Backend وسيتحقق من عدم تكرار البريد
        واسم المستخدم ورقم الهاتف.
      </div>

      <div className="flex justify-end gap-3">
        <AdminButton type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </AdminButton>
        <AdminButton type="submit" icon={UserPlus} loading={isSubmitting}>
          {isSubmitting ? "جاري الإنشاء..." : "إنشاء المستخدم"}
        </AdminButton>
      </div>
    </>
  );
}