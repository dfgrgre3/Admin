"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordResetSchema,
  type PasswordResetFormData,
} from "@/lib/validations/user-schemas";

export function usePasswordForm(onSubmit: (data: PasswordResetFormData) => Promise<boolean>) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = watch("newPassword");
  const confirmPasswordValue = watch("confirmPassword");

  const isValid =
    dirtyFields.newPassword &&
    dirtyFields.confirmPassword &&
    !errors.newPassword &&
    !errors.confirmPassword &&
    newPasswordValue === confirmPasswordValue &&
    newPasswordValue.length >= 8;

  const strength = {
    length: newPasswordValue.length >= 8,
    upper: /[A-Z]/.test(newPasswordValue),
    lower: /[a-z]/.test(newPasswordValue),
    number: /[0-9]/.test(newPasswordValue),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue),
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    reset,
    errors,
    newPasswordValue,
    isValid,
    strength,
  };
}