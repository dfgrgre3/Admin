"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVerify2FA } from "@/hooks/auth/use-verify-2fa";
import type { TwoFactorFormValues } from "@/lib/validations/auth-two-factor";

interface UseTwoFactorVerifyOptions {
  /**
   * The opaque MFA ticket issued by the login response. The Go handler
   * (`mfa_handler.go` VerifyMFA) binds `{ticket, code}` with both fields
   * required, so this value — not a user id — is what must be submitted.
   */
  ticket: string;
  redirectTo: string;
}

/**
 * useTwoFactorVerify — owns `TwoFactorPage`'s state: submit/verify handling,
 * the resend countdown, and the verified→redirect transition. Extracted so
 * the page component stays focused on composing its states.
 */
export function useTwoFactorVerify({ ticket, redirectTo }: UseTwoFactorVerifyOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const verify2FAMutation = useVerify2FA({
    onSuccess: () => {
      setVerified(true);
      setSuccessMessage("تم التحقق بنجاح");
      setTimeout(() => router.push(redirectTo), 2000);
    },
    onError: (error) => {
      setErrorMessage(error);
      setIsSubmitting(false);
    },
  });

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const onSubmit = async (data: TwoFactorFormValues) => {
    if (!ticket) {
      setErrorMessage("طلب التحقق غير صالح");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await verify2FAMutation.mutateAsync({ ticket, code: data.code, rememberMe: true });
    } catch {
      // Error is handled by onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = () => {
    // TODO: Implement resend code logic
    setCanResend(false);
    setCountdown(30);
  };

  return {
    isSubmitting,
    errorMessage,
    successMessage,
    verified,
    countdown,
    canResend,
    onSubmit,
    resendCode,
  };
}
