"use client";

import { m } from "framer-motion";
import { ShieldAlert, Loader2, ShieldCheck } from "lucide-react";

interface AdminLoginDecorMfaStepProps {
  code: string;
  onCodeChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

/** Decorated 2FA step of the `/auth/admin-login` variant. */
export default function AdminLoginDecorMfaStep({
  code,
  onCodeChange,
  isSubmitting,
  onSubmit,
  onCancel,
}: AdminLoginDecorMfaStepProps) {
  return (
    <m.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={onSubmit} className="space-y-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-red-500/10 mb-6 border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">تأكيد أمني إضافي</h3>
        <p className="text-gray-400 font-medium">أدخل رمز الأمان من تطبيق المصادقة (2FA)</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full text-center tracking-[0.8em] text-4xl font-black rounded-2xl border border-white/[0.08] bg-white/[0.03] py-6 text-white outline-none transition-all focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10"
          placeholder="000000"
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || code.length < 6}
        className="group relative w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-red-600 to-orange-600 px-6 py-5 font-black text-white shadow-xl shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="mx-auto h-7 w-7 animate-spin" />
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg">تحقق وفتح الصلاحيات</span>
            <ShieldCheck className="h-6 w-6" />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-sm font-bold text-gray-500 hover:text-white transition-colors"
      >
        إلغاء والمحاولة مرة أخرى
      </button>
    </m.form>
  );
}
