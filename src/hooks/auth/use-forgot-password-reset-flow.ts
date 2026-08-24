"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApiService } from "@/services/auth/auth-api-service";
import { areAllRequirementsMet } from "@/components/auth/password-requirements";

interface UseForgotPasswordResetFlowOptions {
  onSuccess: () => void;
}

/**
 * useForgotPasswordResetFlow — owns step 3 of the forgot-password wizard (new
 * password submission) plus the post-success redirect countdown. Extracted
 * from `ForgotPasswordPage` so the page stays focused on composing its steps.
 */
export function useForgotPasswordResetFlow({ onSuccess }: UseForgotPasswordResetFlowOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Auto-redirect countdown
  useEffect(() => {
    if (isSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && redirectCountdown === 0) {
      router.push("/auth/login");
    }
  }, [isSuccess, redirectCountdown, router]);

  const submitPassword = async (data: { newPassword: string; confirmPassword: string }) => {
    if (!areAllRequirementsMet(data.newPassword)) {
      setErrorMessage("كلمة المرور لا تستوفي جميع الشروط");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.resetPassword(resetToken, data.newPassword);

      if (result.success) {
        setIsSuccess(true);
        onSuccess();
      } else {
        setErrorMessage(result.error || "فشل تغيير كلمة المرور");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToLogin = () => {
    router.push("/auth/login");
  };

  return {
    isSubmitting,
    errorMessage,
    isSuccess,
    redirectCountdown,
    setResetToken,
    submitPassword,
    backToLogin,
  };
}
