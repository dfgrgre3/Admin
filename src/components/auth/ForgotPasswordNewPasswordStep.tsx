"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter, checkPasswordStrength } from "@/components/auth/password-strength-meter";
import { PasswordRequirements, areAllRequirementsMet } from "@/components/auth/password-requirements";

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordNewPasswordStepProps {
  register: UseFormRegister<PasswordFormValues>;
  errors: FieldErrors<PasswordFormValues>;
  newPassword: string;
  isSubmitting: boolean;
  isValid: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  showConfirmPassword: boolean;
  onToggleShowConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

/** Step 3 of `ForgotPasswordPage` — sets the new password. */
export default function ForgotPasswordNewPasswordStep({
  register,
  errors,
  newPassword,
  isSubmitting,
  isValid,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
  onSubmit,
  onBack,
}: ForgotPasswordNewPasswordStepProps) {
  const passwordStrength = checkPasswordStrength(newPassword || "");

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-300">
            كلمة المرور الجديدة <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="أدخل كلمة المرور الجديدة"
              {...register("newPassword")}
              className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              dir="rtl"
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-sm text-red-500 font-medium">{errors.newPassword.message}</p>}
        </div>

        <PasswordStrengthMeter strength={passwordStrength} />
        <PasswordRequirements password={newPassword || ""} />

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
            تأكيد كلمة المرور <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="أعد إدخال كلمة المرور"
              {...register("confirmPassword")}
              className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              dir="rtl"
            />
            <button
              type="button"
              onClick={onToggleShowConfirmPassword}
              className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          disabled={isSubmitting || !isValid || !areAllRequirementsMet(newPassword || "")}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جارٍ التغيير...
            </>
          ) : (
            <>
              تغيير كلمة المرور
              <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
            </>
          )}
        </Button>
      </form>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10">
          <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
          رجوع
        </Button>
      </div>
    </motion.div>
  );
}
