"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import Link from "next/link";
import { ShieldAlert, Lock, Loader2, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, ChevronRight } from "lucide-react";

export interface AdminLoginFormValues {
  email: string;
  password: string;
}

interface AdminLoginCredentialsStepProps {
  register: UseFormRegister<AdminLoginFormValues>;
  errors: FieldErrors<AdminLoginFormValues>;
  errorStatus: string | null;
  isSubmitting: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onSubmit: () => void;
  rememberMe: boolean;
  onToggleRememberMe: () => void;
  /** Seconds left in an active account lockout, or null when not locked. */
  lockoutSecondsLeft: number | null;
}

function formatLockoutTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** First step of the admin/staff login flow — email + password credentials. */
export default function AdminLoginCredentialsStep({
  register,
  errors,
  errorStatus,
  isSubmitting,
  showPassword,
  onToggleShowPassword,
  onSubmit,
  rememberMe,
  onToggleRememberMe,
  lockoutSecondsLeft,
}: AdminLoginCredentialsStepProps) {
  const isLocked = Boolean(lockoutSecondsLeft && lockoutSecondsLeft > 0);
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gray-950 p-10 shadow-lg">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <ShieldAlert size={120} className="text-red-500" />
      </div>

      <div className="mb-10 text-right relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 mb-4 border border-red-500/20">
          <ShieldCheck className="h-4 w-4 text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">منطقة إدارية مقيدة</span>
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white mb-3">دخول المدير</h2>
        <p className="text-gray-400 text-lg leading-relaxed">يرجى إدخال بيانات الاعتماد الخاصة بالنظام للوصول إلى لوحة التحكم</p>
      </div>

      {isLocked && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-400">
          <ShieldAlert className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">تم قفل الحساب مؤقتًا بسبب محاولات دخول فاشلة متكررة.</p>
            <p className="text-xs font-bold mt-1 tabular-nums">
              يمكنك المحاولة مرة أخرى بعد: {formatLockoutTime(lockoutSecondsLeft as number)}
            </p>
          </div>
        </div>
      )}

      {!isLocked && errorStatus && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <p className="text-sm font-semibold">{errorStatus}</p>
        </div>
      )}

      <div className="space-y-8 relative z-10">
        <div className="space-y-3">
          <label className="mr-2 text-sm font-bold text-gray-400 uppercase tracking-wider">بريد المسؤول</label>
          <div className="group relative">
            <input
              {...register("email")}
              type="email"
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pr-12 pl-5 text-white outline-none placeholder:text-gray-600 focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-red-500/10 disabled:opacity-50"
              placeholder="admin@thanawy.com"
              dir="rtl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-red-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          {errors.email && <p className="mr-2 mt-2 text-xs font-bold text-red-500/90 tracking-wide">{errors.email.message}</p>}
        </div>

        <div className="space-y-3">
          <div className="mr-2 flex items-center justify-between">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">كلمة المرور</label>
          </div>
          <div className="group relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pr-12 pl-14 text-white outline-none placeholder:text-gray-600 focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-red-500/10 disabled:opacity-50"
              placeholder="⬢⬢⬢⬢⬢⬢⬢⬢⬢⬢⬢⬢"
              dir="rtl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-red-500">
              <Lock className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mr-2 mt-2 text-xs font-bold text-red-500/90 tracking-wide">{errors.password.message}</p>}
        </div>

        <label className="mr-2 flex items-center gap-3 select-none cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={onToggleRememberMe}
            className="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-red-600 focus:ring-2 focus:ring-red-500/30"
          />
          <span className="text-sm font-semibold text-gray-400">
            تذكرني لمدة 90 يومًا على هذا الجهاز
          </span>
        </label>

        <div className="pt-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting || isLocked}
            className="w-full rounded-[1.25rem] bg-gradient-to-r from-red-600 to-orange-600 px-6 py-5 font-black text-white shadow-lg disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="mx-auto h-7 w-7 animate-spin" />
            ) : isLocked ? (
              <span className="text-lg">الحساب مقفل مؤقتًا</span>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg">تأكيد الهوية والدخول</span>
                <ChevronRight className="h-6 w-6 rotate-180" />
              </div>
            )}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
            <ArrowRight className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            العودة لصفحة الطلاب
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">Security Level: Enterprise</span>
        </div>
      </div>
    </div>
  );
}
