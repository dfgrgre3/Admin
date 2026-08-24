'use client';

import { Suspense } from 'react';
import { m } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useAdminLoginDecorFlow } from '@/hooks/auth/use-admin-login-decor-flow';
import AdminLoginDecorCredentialsStep from '@/components/auth/AdminLoginDecorCredentialsStep';
import AdminLoginDecorMfaStep from '@/components/auth/AdminLoginDecorMfaStep';
import AdminLoginDecorChecking from '@/components/auth/AdminLoginDecorChecking';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] flex-col items-center justify-center">...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}

/**
 * AdminLoginContent — the decorated `/auth/admin-login` variant of the
 * staff sign-in flow. Not currently linked from anywhere in the app (the
 * live `/admin-login` route serves `(auth)/admin-login/page.tsx` instead);
 * kept in sync with the same two-step credentials/MFA flow regardless.
 * Presentation lives in `AdminLoginDecorCredentialsStep` / `AdminLoginDecorMfaStep`;
 * state lives in `useAdminLoginDecorFlow`.
 */
function AdminLoginContent() {
  const {
    form: { register, handleSubmit, formState: { errors } },
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
  } = useAdminLoginDecorFlow();

  if (isAuthLoading) {
    return <AdminLoginDecorChecking />;
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative background elements */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gray-950/60 p-10 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert size={120} className="text-red-500" />
        </div>

        {requires2FA ? (
          <AdminLoginDecorMfaStep
            code={twoFactorCode}
            onCodeChange={setTwoFactorCode}
            isSubmitting={isSubmitting}
            onSubmit={onVerify2FA}
            onCancel={() => setRequires2FA(false)}
          />
        ) : (
          <AdminLoginDecorCredentialsStep
            register={register}
            errors={errors}
            errorStatus={errorStatus}
            isSubmitting={isSubmitting}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword((s) => !s)}
            onSubmit={handleSubmit(onSubmit)}
          />
        )}
      </m.div>

      {/* Footer info */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="h-8 w-24 bg-white/20 rounded-md animate-pulse" />
        <div className="h-8 w-24 bg-white/20 rounded-md animate-pulse delay-75" />
        <div className="h-8 w-24 bg-white/20 rounded-md animate-pulse delay-150" />
      </div>
    </div>
  );
}
