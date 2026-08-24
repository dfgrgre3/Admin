"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResetPassword } from "@/hooks/auth/use-reset-password";
import type { ResetPasswordFormValues } from "@/lib/validations/auth-reset-password";

/**
 * useResetPasswordFlow — owns `ResetPasswordPage`'s state: the submit
 * handler and success transition. Extracted so the page component stays
 * focused on composing its states.
 */
export function useResetPasswordFlow() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setPasswordReset(true);
      setSuccessMessage("تم إعادة تعيين كلمة المرور بنجاح");
    },
    onError: (error) => {
      setErrorMessage(error);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await resetPasswordMutation.mutateAsync({
        token: data.token,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });
    } catch {
      // Error is handled by onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToLogin = () => {
    router.push("/auth/login");
  };

  return { isSubmitting, errorMessage, successMessage, passwordReset, onSubmit, backToLogin };
}
