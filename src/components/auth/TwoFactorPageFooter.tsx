"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TwoFactorPageFooterProps {
  countdown: number;
  canResend: boolean;
  onResend: () => void;
}

/** Resend-code, backup-codes notice, and back-to-login links on `TwoFactorPage`. */
export default function TwoFactorPageFooter({ countdown, canResend, onResend }: TwoFactorPageFooterProps) {
  const router = useRouter();

  return (
    <>
      <div className="mt-6 pt-6 border-t border-white/10">
        {canResend ? (
          <button onClick={onResend} className="w-full text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
            إعادة إرسال الرمز
          </button>
        ) : (
          <p className="text-sm text-gray-500 text-center">يمكنك إعادة إرسال الرمز بعد {countdown} ثانية</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-white/10">
        <p className="text-xs text-gray-500 text-center">
          💡 إذا فقدت الوصول إلى تطبيق المصادقة، يمكنك استخدام أحد رموز الاسترداد
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push("/auth/login")}
          className="w-full text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          العودة إلى تسجيل الدخول
        </button>
      </div>
    </>
  );
}
