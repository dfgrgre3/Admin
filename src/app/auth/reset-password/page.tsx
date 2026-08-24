'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations/auth-reset-password';
import { useResetPasswordFlow } from '@/hooks/auth/use-reset-password-flow';
import { Card, CardContent } from '@/components/ui/card';
import ResetPasswordPageHeader from '@/components/auth/ResetPasswordPageHeader';
import ResetPasswordInvalidState from '@/components/auth/ResetPasswordInvalidState';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ResetPasswordSuccessStep from '@/components/auth/ResetPasswordSuccessStep';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import AuthSuccessAlert from '@/components/auth/AuthSuccessAlert';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-400">جاري التحميل...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

/**
 * ResetPasswordContent — orchestrates the standalone password-reset page
 * (invalid-token / form / success states). Presentation lives in
 * `ResetPasswordInvalidState` / `ResetPasswordForm` / `ResetPasswordSuccessStep`;
 * state lives in `useResetPasswordFlow`.
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const flow = useResetPasswordFlow();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { token, password: '', passwordConfirmation: '' },
  });

  const passwordValue = watch('password');

  if (!token) {
    return <ResetPasswordInvalidState onBackToLogin={flow.backToLogin} />;
  }

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <ResetPasswordPageHeader />

        <CardContent>
          <AnimatePresence mode="wait">
            <AuthErrorAlert message={flow.errorMessage} />
            <AuthSuccessAlert message={flow.successMessage} />
          </AnimatePresence>

          {!flow.passwordReset ? (
            <ResetPasswordForm
              register={register}
              errors={errors}
              passwordValue={passwordValue}
              isSubmitting={flow.isSubmitting}
              isValid={isValid}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((s) => !s)}
              showConfirmPassword={showConfirmPassword}
              onToggleShowConfirmPassword={() => setShowConfirmPassword((s) => !s)}
              onSubmit={handleSubmit(flow.onSubmit)}
            />
          ) : (
            <ResetPasswordSuccessStep onBackToLogin={flow.backToLogin} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
