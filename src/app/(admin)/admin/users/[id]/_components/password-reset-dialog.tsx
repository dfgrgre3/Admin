"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Lock } from "lucide-react";
import { usePasswordForm } from "../_hooks/use-password-form";
import type { PasswordResetFormData } from "@/lib/validations/user-schemas";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onSubmit: (data: PasswordResetFormData) => Promise<boolean>;
}

export function PasswordResetDialog({
  open,
  onOpenChange,
  userName,
  onSubmit,
}: PasswordResetDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    errors,
    newPasswordValue,
    isValid,
    strength,
  } = usePasswordForm(async (data) => {
    const success = await onSubmit(data);
    if (success) {
      onOpenChange(false);
      reset();
    }
    return success;
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-2xl font-black tracking-tight">
            تغيير كلمة المرور
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium px-4">
            أدخل كلمة المرور الجديدة للمسؤول {userName}. سيتم فرض تسجيل الخروج من كافة الأجهزة تلقائياً.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">كلمة المرور الجديدة</label>
              <Input
                type="password"
                className={`h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none ${errors.newPassword ? "border-destructive" : ""}`}
                placeholder="أدخل 8 أحرف على الأقل..."
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">تأكيد كلمة المرور</label>
              <Input
                type="password"
                className={`h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none ${errors.confirmPassword ? "border-destructive" : ""}`}
                placeholder="أعد كتابة كلمة المرور..."
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            {newPasswordValue && (
              <PasswordStrengthIndicator strength={strength} />
            )}
          </div>
          <DialogFooter className="mt-6 flex-col-reverse sm:flex-row gap-3 sm:gap-0">
            <AdminButton variant="outline" className="rounded-2xl h-12 flex-1" onClick={() => onOpenChange(false)} type="button">
              إلغاء
            </AdminButton>
            <AdminButton variant="default" disabled={!isValid} type="submit" className="rounded-2xl h-12 flex-1">
              حفظ كلمة المرور
            </AdminButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: Record<string, boolean> }) {
  const items = [
    { key: "length", label: "8 أحرف على الأقل" },
    { key: "upper", label: "حرف كبير (A-Z)" },
    { key: "lower", label: "حرف صغير (a-z)" },
    { key: "number", label: "رقم (0-9)" },
    { key: "symbol", label: "رمز خاص" },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {items.map((item) => (
          <div key={item.key} className={`h-1 flex-1 rounded-full transition-colors ${strength[item.key] ? "bg-success" : "bg-muted"}`} />
        ))}
      </div>
      <ul className="text-[10px] space-y-0.5 text-muted-foreground">
        {items.map((item) => (
          <li key={item.key} className={strength[item.key] ? "text-success" : ""}>✓ {item.label}</li>
        ))}
      </ul>
    </div>
  );
}