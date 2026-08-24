"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isStaffAdminPanelRole } from "@/lib/auth/admin-panel-roles";
import { sanitizeRedirectPath } from "@/services/auth/navigation";
import type { AdminLoginFormValues } from "@/components/auth/AdminLoginDecorCredentialsStep";

const loginSchema = z.object({
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

/**
 * useAdminLoginDecorFlow — owns the `/auth/admin-login` page's two-step
 * sign-in state (credentials, then an optional MFA challenge). Extracted so
 * the page component stays focused on composing its decorated steps.
 */
export function useAdminLoginDecorFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: isAuthLoading, verify2FA } = useAuth();
  const [errorStatus, setErrorStatus] = useState<string | null>(() =>
    searchParams.get("error") === "unauthorized_role"
      ? "ليس لديك صلاحيات الوصول إلى لوحة التحكم. هذا القسم مخصص للمشرفين فقط."
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId2FA, setUserId2FA] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const redirectUrl = useMemo(
    () => sanitizeRedirectPath(searchParams.get("redirect"), "/admin"),
    [searchParams]
  );

  const form = useForm<AdminLoginFormValues>({ resolver: zodResolver(loginSchema) });

  const redirectAfterLogin = useCallback((target: string) => {
    router.replace(target);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isStaffAdminPanelRole(user?.role)) {
      redirectAfterLogin(redirectUrl);
    }
  }, [isAuthLoading, isAuthenticated, user, redirectAfterLogin, redirectUrl]);

  const onSubmit = async (data: AdminLoginFormValues) => {
    if (isAuthLoading || (isAuthenticated && isStaffAdminPanelRole(user?.role))) return;
    setIsSubmitting(true);
    setErrorStatus(null);

    try {
      const result = await login(
        data.email.trim().toLowerCase(),
        data.password,
        true // Admin sessions should probably be remembered or have specific policy
      );

      if (result.success) {
        if (result.requires2FA) {
          setRequires2FA(true);
          setUserId2FA(result.userId || null);
          return;
        }
        // Success handled by useEffect
        return;
      }
      setErrorStatus(result.error || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId2FA || twoFactorCode.length < 6) return;

    setIsSubmitting(true);
    setErrorStatus(null);
    try {
      const result = await verify2FA(userId2FA, twoFactorCode, true);
      if (result.success) {
        // Success handled by useEffect
        return;
      }
      setErrorStatus(result.error || "رمز التحقق غير صحيح");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isAuthLoading,
    errorStatus,
    isSubmitting,
    showPassword,
    setShowPassword,
    requires2FA,
    setRequires2FA,
    twoFactorCode,
    setTwoFactorCode,
    onSubmit,
    onVerify2FA,
  };
}
