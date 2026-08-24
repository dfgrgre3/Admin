"use client";

import { ArrowRight, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/auth/otp-input";

interface LoginTwoFactorStepProps {
  otpCode: string;
  onOtpChange: (value: string) => void;
  errorMessage: string | null;
  isSubmitting: boolean;
  isOTPValid: boolean;
  countdown: number;
  canResend: boolean;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
}

/** 2FA challenge step of `LoginPage` — OTP entry, resend, and back-to-login. */
export default function LoginTwoFactorStep({
  otpCode,
  onOtpChange,
  errorMessage,
  isSubmitting,
  isOTPValid,
  countdown,
  canResend,
  onSubmit,
  onResend,
  onBack,
}: LoginTwoFactorStepProps) {
  return (
    <div className="space-y-6">
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
        <Label className="text-sm font-medium text-gray-300 text-center block">
          رمز التحقق <span className="text-red-500">*</span>
        </Label>
        <OTPInput
          value={otpCode}
          onChange={onOtpChange}
          error={errorMessage && otpCode.length === 6 ? errorMessage : undefined}
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        disabled={isSubmitting || !isOTPValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            جارٍ التحقق...
          </>
        ) : (
          <>
            <ShieldCheck className="ml-2 h-5 w-5" />
            تحقق
          </>
        )}
      </Button>

      <div className="mt-6 pt-6 border-t border-white/10">
        {canResend ? (
          <button
            onClick={onResend}
            className="w-full text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            إعادة إرسال الرمز
          </button>
        ) : (
          <p className="text-sm text-gray-500 text-center">يمكنك إعادة إرسال الرمز بعد {countdown} ثانية</p>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBack}
          className="w-full text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          العودة إلى تسجيل الدخول
        </button>
      </div>
    </div>
  );
}
