"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/auth/otp-input";

interface ForgotPasswordCodeStepProps {
  maskedEmail: string;
  otpCode: string;
  onOtpChange: (value: string) => void;
  isSubmitting: boolean;
  onVerify: () => void;
  countdown: number;
  canResend: boolean;
  onResend: () => void;
  onBack: () => void;
}

/** Step 2 of `ForgotPasswordPage` — verifies the emailed OTP code. */
export default function ForgotPasswordCodeStep({
  maskedEmail,
  otpCode,
  onOtpChange,
  isSubmitting,
  onVerify,
  countdown,
  canResend,
  onResend,
  onBack,
}: ForgotPasswordCodeStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <p className="text-sm text-gray-400">أرسلنا كود التحقق إلى {maskedEmail}</p>
        <p className="text-xs text-gray-500">أدخل الرمز المكون من 6 أرقام</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-300 text-center block">
          رمز التحقق <span className="text-red-500">*</span>
        </Label>
        <OTPInput value={otpCode} onChange={onOtpChange} disabled={isSubmitting} />
      </div>

      <Button
        onClick={onVerify}
        className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        disabled={isSubmitting || otpCode.length !== 6}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            جارٍ التحقق...
          </>
        ) : (
          "تحقق"
        )}
      </Button>

      <div className="mt-6 pt-6 border-t border-white/10">
        {canResend ? (
          <button
            onClick={onResend}
            className="w-full text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            إعادة إرسال الكود
          </button>
        ) : (
          <p className="text-sm text-gray-500 text-center">يمكنك إعادة إرسال الكود بعد {countdown} ثانية</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10">
          رجوع
        </Button>
      </div>
    </motion.div>
  );
}
