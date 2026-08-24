"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface UseLoginTwoFactorOptions {
  redirectUrl: string;
}

/**
 * useLoginTwoFactor — owns the 2FA-challenge sub-flow of the login page
 * (OTP state, resend countdown, verify/back handlers). Extracted from
 * `LoginPage` so the page component stays focused on composing its steps.
 */
export function useLoginTwoFactor({ redirectUrl }: UseLoginTwoFactorOptions) {
  const router = useRouter();
  const { verify2FA } = useAuth();

  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Countdown timer for 2FA resend
  useEffect(() => {
    if (show2FA && countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend, show2FA]);

  const start = (userId: string | null) => {
    setShow2FA(true);
    setTwoFactorUserId(userId);
    setCountdown(60);
    setCanResend(false);
    setOtpCode("");
  };

  const submit = async () => {
    if (!twoFactorUserId) {
      setErrorMessage("معرف المستخدم غير موجود");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await verify2FA(twoFactorUserId, otpCode);
      if (result.success) {
        router.push(redirectUrl);
      } else {
        setErrorMessage(result.error || "رمز التحقق غير صحيح");
        setOtpCode("");
      }
    } catch {
      setErrorMessage("فشل التحقق من الرمز");
      setOtpCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const back = () => {
    setShow2FA(false);
    setTwoFactorUserId(null);
    setOtpCode("");
    setErrorMessage(null);
    setCountdown(60);
    setCanResend(false);
  };

  const resend = () => {
    setCanResend(false);
    setCountdown(60);
    // TODO: Implement actual resend logic via API
  };

  const isOTPValid = otpCode.length === 6 && /^\d{6}$/.test(otpCode);

  return {
    show2FA,
    otpCode,
    setOtpCode,
    countdown,
    canResend,
    isSubmitting,
    errorMessage,
    isOTPValid,
    start,
    submit,
    back,
    resend,
  };
}
