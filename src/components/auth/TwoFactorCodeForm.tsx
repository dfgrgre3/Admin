"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TwoFactorFormValues } from "@/lib/validations/auth-two-factor";

interface TwoFactorCodeFormProps {
  register: UseFormRegister<TwoFactorFormValues>;
  errors: FieldErrors<TwoFactorFormValues>;
  isSubmitting: boolean;
  isValid: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/** The OTP entry form on `TwoFactorPage`. */
export default function TwoFactorCodeForm({ register, errors, isSubmitting, isValid, onSubmit }: TwoFactorCodeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
          <ShieldAlert className="h-12 w-12 text-orange-500" />
        </div>
      </div>

      <div className="text-center space-y-2 mb-6">
        <p className="text-sm text-gray-400">تم إرسال رمز التحقق إلى تطبيق المصادقة الخاص بك</p>
        <p className="text-xs text-gray-500">أدخل الرمز المكون من 6 أرقام للمتابعة</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-sm font-medium text-gray-300 text-center block">
          رمز التحقق <span className="text-red-500">*</span>
        </Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          {...register("code")}
          className={`text-center text-2xl tracking-widest font-bold text-white bg-white/5 border-white/10 ${errors.code ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          dir="ltr"
          autoComplete="one-time-code"
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? "code-error" : undefined}
        />
        {errors.code && (
          <p id="code-error" className="text-sm text-red-500 font-medium text-center" role="alert">
            {errors.code.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            جارٍ التحقق...
          </>
        ) : (
          <>
            <ShieldAlert className="ml-2 h-5 w-5" />
            تحقق
          </>
        )}
      </Button>
    </form>
  );
}
