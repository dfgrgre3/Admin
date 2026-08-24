'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sanitizeRedirectPath } from '@/services/auth/navigation';
import { useLoginTwoFactor } from '@/hooks/auth/use-login-two-factor';
import { useLoginCredentialsForm } from '@/hooks/auth/use-login-credentials-form';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import LoginPageHeader from '@/components/auth/LoginPageHeader';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import LoginCredentialsStep from '@/components/auth/LoginCredentialsStep';
import LoginTwoFactorStep from '@/components/auth/LoginTwoFactorStep';
import LoginSsoButtons from '@/components/auth/LoginSsoButtons';
import LoginPageFooter from '@/components/auth/LoginPageFooter';

// SSO Configuration - can be moved to environment variables or settings
const SSO_ENABLED = process.env.NEXT_PUBLIC_SSO_ENABLED === 'true';
const CAPTCHA_ENABLED = process.env.NEXT_PUBLIC_CAPTCHA_ENABLED === 'true';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-400">جاري التحميل...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

/**
 * LoginContent — orchestrates the two-step sign-in flow (credentials, then an
 * optional MFA challenge). Presentation lives in `LoginCredentialsStep` /
 * `LoginTwoFactorStep` / `LoginSsoButtons` / `LoginPageFooter`; state lives in
 * `useLoginCredentialsForm` (step 1) and `useLoginTwoFactor` (step 2).
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const redirectUrl = useMemo(
    () => sanitizeRedirectPath(searchParams.get('redirect'), '/dashboard'),
    [searchParams]
  );

  const twoFactor = useLoginTwoFactor({ redirectUrl });
  const { form, errorMessage, isSubmitting, onSubmit } = useLoginCredentialsForm({
    redirectUrl,
    onMfaRequired: twoFactor.start,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  // Focus on identifier field on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && !twoFactor.show2FA) {
      document.getElementById('identifier')?.focus();
    }
  }, [twoFactor.show2FA]);

  const handleSSOClick = (provider: string) => {
    window.location.href = `/api/auth/social/${provider}`;
  };

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <LoginPageHeader />

        <CardContent>
          <AuthErrorAlert message={twoFactor.show2FA ? null : errorMessage} />

          {!twoFactor.show2FA ? (
            <LoginCredentialsStep
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              isValid={isValid}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((s) => !s)}
              capsLockOn={capsLockOn}
              onCapsLockChange={setCapsLockOn}
              onSubmit={handleSubmit(onSubmit)}
            />
          ) : (
            <LoginTwoFactorStep
              otpCode={twoFactor.otpCode}
              onOtpChange={twoFactor.setOtpCode}
              errorMessage={twoFactor.errorMessage}
              isSubmitting={twoFactor.isSubmitting}
              isOTPValid={twoFactor.isOTPValid}
              countdown={twoFactor.countdown}
              canResend={twoFactor.canResend}
              onSubmit={twoFactor.submit}
              onResend={twoFactor.resend}
              onBack={twoFactor.back}
            />
          )}

          {SSO_ENABLED && !twoFactor.show2FA && <LoginSsoButtons onSelect={handleSSOClick} />}

          {CAPTCHA_ENABLED && (
            <div className="mt-6">
              <div className="flex items-center justify-center p-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-white/10">
                <p className="text-sm text-gray-400">Captcha placeholder</p>
              </div>
            </div>
          )}

          <LoginPageFooter />
        </CardContent>
      </Card>
    </div>
  );
}
