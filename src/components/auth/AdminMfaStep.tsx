"use client";

import { ShieldAlert, Loader2, ShieldCheck } from "lucide-react";

interface AdminMfaStepProps {
  code: string;
  onCodeChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

/** Second step of the admin/staff login flow — 2FA challenge. */
export default function AdminMfaStep({
  code,
  onCodeChange,
  isSubmitting,
  onSubmit,
  onCancel,
}: AdminMfaStepProps) {
  return (
    <form onSubmit={onSubmit} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gray-950 p-10 shadow-lg space-y-8">
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
          className="w-full text-center tracking-[0.8em] text-4xl font-black rounded-2xl border border-white/[0.08] bg-white/[0.03] py-6 text-white outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-red-500/10"
          placeholder="000000"
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || code.length < 6}
        className="w-full rounded-[1.25rem] bg-gradient-to-r from-red-600 to-orange-600 px-6 py-5 font-black text-white shadow-lg disabled:opacity-70"
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
    </form>
  );
}
