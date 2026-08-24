"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { adminLoginSchema } from "@/lib/validations/admin-login";
import { useLogin } from "@/hooks/auth/use-login";

// zodResolver/useForm need the schema's *input* shape (before `.default()` is
// applied), not `z.infer`'s output shape — using the output type here made
// `rememberMe` required and broke inference for every consumer of this hook.
type LoginFormInput = z.input<typeof adminLoginSchema>;

interface UseLoginCredentialsFormOptions {
  redirectUrl: string;
  onMfaRequired: (mfaToken: string | null) => void;
}

/**
 * useLoginCredentialsForm — owns the credentials step's form state and the
 * call into `useLogin`. Extracted from `LoginPage` so the page component
 * stays focused on composing its steps.
 */
export function useLoginCredentialsForm({ redirectUrl, onMfaRequired }: UseLoginCredentialsFormOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = useLogin({
    redirectTo: redirectUrl,
    skipMfaRedirect: true,
    onError: (error) => {
      setErrorMessage(error);
      setIsSubmitting(false);
    },
  });

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
      captchaToken: "",
    },
  });

  const onSubmit = async (data: LoginFormInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await loginMutation.mutateAsync({
        identifier: data.identifier.trim(),
        password: data.password,
        rememberMe: data.rememberMe || false,
        captchaToken: data.captchaToken || "",
      });

      if (result.success && result.status === "mfa_required") {
        onMfaRequired(result.data?.mfaToken || null);
      }
    } catch {
      // Error is handled by onError callback; clear password on failed login.
      form.reset({ ...data, password: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, errorMessage, isSubmitting, onSubmit };
}
