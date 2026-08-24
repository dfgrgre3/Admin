"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/auth/password-strength";
import type { ResetPasswordFormValues } from "@/lib/validations/auth-reset-password";

interface ResetPasswordFormProps {
  register: UseFormRegister<ResetPasswordFormValues>;
  errors: FieldErrors<ResetPasswordFormValues>;
  passwordValue: string;
  isSubmitting: boolean;
  isValid: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  showConfirmPassword: boolean;
  onToggleShowConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** The new-password form on `ResetPasswordPage`. */
export default function ResetPasswordForm({
  register,
  errors,
  passwordValue,
  isSubmitting,
  isValid,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-300">
          كلمة المرور الجديدة <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="أدخل كلمة المرور الجديدة"
            {...register("password")}
            className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            dir="rtl"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-red-500 font-medium" role="alert">
            {errors.password.message}
          </p>
        )}
        <PasswordStrength password={passwordValue} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirmation" className="text-sm font-medium text-gray-300">
          تأكيد كلمة المرور <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="passwordConfirmation"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="أعد إدخال كلمة المرور"
            {...register("passwordConfirmation")}
            className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.passwordConfirmation ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            dir="rtl"
            autoComplete="new-password"
            aria-invalid={!!errors.passwordConfirmation}
            aria-describedby={errors.passwordConfirmation ? "password-confirmation-error" : undefined}
          />
          <button
            type="button"
            onClick={onToggleShowConfirmPassword}
            className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.passwordConfirmation && (
          <p id="password-confirmation-error" className="text-sm text-red-500 font-medium" role="alert">
            {errors.passwordConfirmation.message}
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
            جارٍ إعادة التعيين...
          </>
        ) : (
          <>
            <Lock className="ml-2 h-5 w-5" />
            إعادة تعيين كلمة المرور
          </>
        )}
      </Button>
    </form>
  );
}
