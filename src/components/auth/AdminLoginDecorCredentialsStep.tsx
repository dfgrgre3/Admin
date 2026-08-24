"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Lock, Loader2, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, ChevronRight } from "lucide-react";

export interface AdminLoginFormValues {
  email: string;
  password: string;
}

interface AdminLoginDecorCredentialsStepProps {
  register: UseFormRegister<AdminLoginFormValues>;
  errors: FieldErrors<AdminLoginFormValues>;
  errorStatus: string | null;
  isSubmitting: boolean;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onSubmit: () => void;
}

/** Decorated credentials step of the `/auth/admin-login` variant — same flow
 * as `AdminLoginCredentialsStep`, with the extra motion/glow styling this
 * page's design uses. */
export default function AdminLoginDecorCredentialsStep({
  register,
  errors,
  errorStatus,
  isSubmitting,
  showPassword,
  onToggleShowPassword,
  onSubmit,
}: AdminLoginDecorCredentialsStepProps) {
  return (
    <>
      <div className="mb-10 text-right relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 mb-4 border border-red-500/20">
          <ShieldCheck className="h-4 w-4 text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">منطقة إدارية مقيدة</span>
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white mb-3">دخول المدير</h2>
        <p className="text-gray-400 text-lg leading-relaxed">يرجى إدخال بيانات الاعتماد الخاصة بالنظام للوصول إلى لوحة التحكم</p>
      </div>

      <AnimatePresence mode="wait">
        {errorStatus && (
          <m.div
            initial={{ opacity: 0, scale: 0.95, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: "auto", x: [0, -10, 10, -10, 10, 0] }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-400 shadow-lg shadow-red-500/5"
          >
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-semibold">{errorStatus}</p>
          </m.div>
        )}
      </AnimatePresence>

      <div className="space-y-8 relative z-10">
        <div className="space-y-3">
          <label className="mr-2 text-sm font-bold text-gray-400 uppercase tracking-wider">بريد المسؤول</label>
          <div className="group relative">
            <input
              {...register("email")}
              type="email"
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pr-12 pl-5 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 disabled:opacity-50"
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
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pr-12 pl-14 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 disabled:opacity-50"
              placeholder="⬢⬢⬢⬢⬢⬢⬢⬢⬢⬢⬢⬢"
              dir="rtl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-red-500">
              <Lock className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all transform hover:scale-110"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mr-2 mt-2 text-xs font-bold text-red-500/90 tracking-wide">{errors.password.message}</p>}
        </div>

        <div className="pt-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="group relative w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-red-600 to-orange-600 px-6 py-5 font-black text-white shadow-xl shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            {isSubmitting ? (
              <Loader2 className="mx-auto h-7 w-7 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg">تأكيد الهوية والدخول</span>
                <ChevronRight className="h-6 w-6 rotate-180 transition-transform group-hover:-translate-x-1" />
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
    </>
  );
}
