'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { isStaffAdminPanelRole } from '@/lib/auth/admin-panel-roles';
import { sanitizeRedirectPath } from '@/services/auth/navigation';
import AdminLoginCredentialsStep, { AdminLoginFormValues } from '@/components/auth/AdminLoginCredentialsStep';
import AdminMfaStep from '@/components/auth/AdminMfaStep';
import AdminAuthChecking from '@/components/auth/AdminAuthChecking';

const loginSchema = z.object({
  email: z.string().trim().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] flex-col items-center justify-center">...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}

/**
 * AdminLoginContent — orchestrates the two-step staff sign-in flow
 * (credentials, then an optional MFA challenge). Presentation lives in
 * `AdminLoginCredentialsStep` / `AdminMfaStep`.
 */
function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: isAuthLoading, verify2FA } = useAuth();
  const [errorStatus, setErrorStatus] = useState<string | null>(() => {
    // Check for query param error from AdminGuard redirect
    if (searchParams.get('error') === 'unauthorized_role') {
      return 'ليس لديك صلاحيات الوصول إلى لوحة التحكم. هذا القسم مخصص للمشرفين فقط.';
    }
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Defaults to true (90-day session) to preserve prior behavior, but is now
  // user-controllable instead of silently hardcoded — see AdminLoginCredentialsStep.
  const [rememberMe, setRememberMe] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  // Seconds remaining in an active account lockout (see ACCOUNT_LOCKED:<minutes>
  // in auth_service_lockout.go). Ticks down client-side so the button
  // re-enables itself without the user needing to reload.
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number | null>(null);
  const [userId2FA, setUserId2FA] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const redirectUrl = useMemo(
    () => sanitizeRedirectPath(searchParams.get('redirect'), '/admin'),
    [searchParams]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const redirectAfterLogin = useCallback((target: string) => {
    router.replace(target);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isStaffAdminPanelRole(user?.role)) {
      redirectAfterLogin(redirectUrl);
    }
  }, [isAuthLoading, isAuthenticated, user, redirectAfterLogin, redirectUrl]);

  useEffect(() => {
    if (lockoutSecondsLeft === null || lockoutSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecondsLeft((s) => (s === null || s <= 1 ? null : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSecondsLeft]);

  const onSubmit = async (data: AdminLoginFormValues) => {
    if (isAuthLoading || (isAuthenticated && isStaffAdminPanelRole(user?.role))) return;
    setIsSubmitting(true);
    setErrorStatus(null);

    try {
      const result = await login(
        data.email.trim().toLowerCase(),
        data.password,
        rememberMe
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
      if (result.accountLocked && result.lockoutMinutes) {
        setLockoutSecondsLeft(result.lockoutMinutes * 60);
      }
      setErrorStatus(result.error || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
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
      const result = await verify2FA(userId2FA, twoFactorCode, rememberMe);
      if (result.success) {
        // Success handled by useEffect
        return;
      }
      setErrorStatus(result.error || 'رمز التحقق غير صحيح');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return <AdminAuthChecking />;
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {requires2FA ? (
        <AdminMfaStep
          code={twoFactorCode}
          onCodeChange={setTwoFactorCode}
          isSubmitting={isSubmitting}
          onSubmit={onVerify2FA}
          onCancel={() => setRequires2FA(false)}
        />
      ) : (
        <AdminLoginCredentialsStep
          register={register}
          errors={errors}
          errorStatus={errorStatus}
          isSubmitting={isSubmitting}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((s) => !s)}
          onSubmit={handleSubmit(onSubmit)}
          rememberMe={rememberMe}
          onToggleRememberMe={() => setRememberMe((r) => !r)}
          lockoutSecondsLeft={lockoutSecondsLeft}
        />
      )}
    </div>
  );
}
