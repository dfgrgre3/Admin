"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import type { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { adminLoginSchema } from "@/lib/validations/admin-login";

// Matches useLoginCredentialsForm's form type — the schema's *input* shape
// (before zod's `.default()` on rememberMe is applied).
type LoginFormInput = z.input<typeof adminLoginSchema>;

interface LoginCredentialsStepProps {
  register: UseFormRegister<LoginFormInput>;
  errors: FieldErrors<LoginFormInput>;
  isSubmitting: boolean;
  isValid: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  capsLockOn: boolean;
  onCapsLockChange: (on: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Credentials step of `LoginPage` — identifier/password + remember-me. */
export default function LoginCredentialsStep({
  register,
  errors,
  isSubmitting,
  isValid,
  showPassword,
  onToggleShowPassword,
  capsLockOn,
  onCapsLockChange,
  onSubmit,
}: LoginCredentialsStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Identifier Field */}
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-sm font-medium text-gray-300">
          البريد الإلكتروني أو اسم المستخدم <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="identifier"
            type="text"
            placeholder="admin@example.com أو username"
            {...register("identifier")}
            className={`pr-10 text-white bg-white/5 border-white/10 ${errors.identifier ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            dir="rtl"
            autoComplete="username"
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? "identifier-error" : undefined}
          />
        </div>
        {errors.identifier && (
          <p id="identifier-error" className="text-sm text-red-500 font-medium" role="alert">
            {errors.identifier.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-300">
          كلمة المرور <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="أدخل كلمة المرور"
            {...register("password")}
            className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            dir="rtl"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            onKeyUp={(e) => onCapsLockChange(!!e.getModifierState?.("CapsLock"))}
            onKeyDown={(e) => {
              if (e.getModifierState?.("CapsLock")) onCapsLockChange(true);
            }}
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

        {capsLockOn && (
          <p className="text-sm text-amber-600 font-medium" role="alert">
            تنبيه: مفتاح Caps Lock مفعل
          </p>
        )}

        {errors.password && (
          <p id="password-error" className="text-sm text-red-500 font-medium" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox id="rememberMe" {...register("rememberMe")} />
          <Label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer text-gray-300">
            تذكرني على هذا الجهاز
          </Label>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            جارٍ تسجيل الدخول...
          </>
        ) : (
          <>
            <ShieldCheck className="ml-2 h-5 w-5" />
            تسجيل الدخول
          </>
        )}
      </Button>
    </form>
  );
}
