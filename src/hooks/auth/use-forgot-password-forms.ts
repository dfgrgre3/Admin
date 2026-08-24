"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordEmailSchema,
  forgotPasswordNewPasswordSchema,
} from "@/lib/validations/forgot-password";

/** Bundles the two react-hook-form instances `ForgotPasswordPage` needs
 * (email step, new-password step) so the page doesn't set both up inline. */
export function useForgotPasswordForms() {
  const emailForm = useForm({
    resolver: zodResolver(forgotPasswordEmailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(forgotPasswordNewPasswordSchema),
    mode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  return { emailForm, passwordForm };
}
