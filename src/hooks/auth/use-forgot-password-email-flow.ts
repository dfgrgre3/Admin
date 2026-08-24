"use client";

import { useEffect, useState } from "react";
import { authApiService } from "@/services/auth/auth-api-service";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (!local || !domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

interface UseForgotPasswordEmailFlowOptions {
  currentStep: number;
  onVerified: (resetToken: string) => void;
  onSubmitted: () => void;
}

/**
 * useForgotPasswordEmailFlow — owns steps 1–2 of the forgot-password wizard
 * (email submission, OTP verification + resend countdown). Extracted from
 * `ForgotPasswordPage` so the page stays focused on composing its steps.
 */
export function useForgotPasswordEmailFlow({ currentStep, onVerified, onSubmitted }: UseForgotPasswordEmailFlowOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (currentStep === 2 && countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend, currentStep]);

  const submitEmail = async (data: { email: string }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.forgotPassword(data.email.trim().toLowerCase());

      if (result.success) {
        setEmail(data.email.trim().toLowerCase());
        setMaskedEmail(maskEmail(data.email.trim().toLowerCase()));
        setCountdown(60);
        setCanResend(false);
        onSubmitted();
      } else {
        // Use generic message for security
        setErrorMessage("إذا كان البريد مسجلاً، سنرسل لك كود التحقق");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء إرسال الكود");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (otpCode.length !== 6) {
      setErrorMessage("أدخل الرمز المكون من 6 أرقام");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.verifyForgotPasswordCode(email, otpCode);

      if (result.success && result.resetToken) {
        onVerified(result.resetToken);
      } else {
        setErrorMessage(result.error || "الرمز غير صحيح أو منتهي الصلاحية");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء التحقق من الرمز");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.forgotPassword(email);

      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setOtpCode("");
      } else {
        setErrorMessage("فشل إعادة إرسال الكود");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء إعادة إرسال الكود");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setErrorMessage(null);

  return {
    isSubmitting,
    errorMessage,
    maskedEmail,
    otpCode,
    setOtpCode,
    countdown,
    canResend,
    submitEmail,
    verifyCode,
    resendCode,
    clearError,
  };
}
