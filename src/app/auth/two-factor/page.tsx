'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { twoFactorSchema, type TwoFactorFormValues } from '@/lib/validations/auth-two-factor';
import { useTwoFactorVerify } from '@/hooks/auth/use-two-factor-verify';
import { Card, CardContent } from '@/components/ui/card';
import TwoFactorPageHeader from '@/components/auth/TwoFactorPageHeader';
import TwoFactorInvalidState from '@/components/auth/TwoFactorInvalidState';
import TwoFactorVerifiedState from '@/components/auth/TwoFactorVerifiedState';
import TwoFactorCodeForm from '@/components/auth/TwoFactorCodeForm';
import TwoFactorPageFooter from '@/components/auth/TwoFactorPageFooter';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import AuthSuccessAlert from '@/components/auth/AuthSuccessAlert';

export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-400">جاري التحميل...</p>
      </div>
    }>
      <TwoFactorContent />
    </Suspense>
  );
}

/**
 * TwoFactorContent — orchestrates the standalone 2FA-verification page
 * (invalid-request / form / verified states). Presentation lives in
 * `TwoFactorInvalidState` / `TwoFactorCodeForm` / `TwoFactorVerifiedState` /
 * `TwoFactorPageFooter`; state lives in `useTwoFactorVerify`.
 */
function TwoFactorContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const flow = useTwoFactorVerify({ userId, redirectTo });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    mode: 'onChange',
    defaultValues: { code: '' },
  });

  if (!userId) {
    return <TwoFactorInvalidState />;
  }

  if (flow.verified) {
    return <TwoFactorVerifiedState />;
  }

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <TwoFactorPageHeader />

        <CardContent>
          <AnimatePresence mode="wait">
            <AuthErrorAlert message={flow.errorMessage} />
            <AuthSuccessAlert message={flow.successMessage} />
          </AnimatePresence>

          <TwoFactorCodeForm
            register={register}
            errors={errors}
            isSubmitting={flow.isSubmitting}
            isValid={isValid}
            onSubmit={handleSubmit(flow.onSubmit)}
          />

          <TwoFactorPageFooter countdown={flow.countdown} canResend={flow.canResend} onResend={flow.resendCode} />
        </CardContent>
      </Card>
    </div>
  );
}
