'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StepsIndicator } from '@/components/auth/steps-indicator';
import { forgotPasswordSteps } from '@/lib/validations/forgot-password';
import { useForgotPasswordForms } from '@/hooks/auth/use-forgot-password-forms';
import { useForgotPasswordEmailFlow } from '@/hooks/auth/use-forgot-password-email-flow';
import { useForgotPasswordResetFlow } from '@/hooks/auth/use-forgot-password-reset-flow';
import ForgotPasswordPageHeader from '@/components/auth/ForgotPasswordPageHeader';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import ForgotPasswordEmailStep from '@/components/auth/ForgotPasswordEmailStep';
import ForgotPasswordCodeStep from '@/components/auth/ForgotPasswordCodeStep';
import ForgotPasswordNewPasswordStep from '@/components/auth/ForgotPasswordNewPasswordStep';
import ForgotPasswordSuccessStep from '@/components/auth/ForgotPasswordSuccessStep';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-400">جاري التحميل...</p>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}

/**
 * ForgotPasswordContent — orchestrates the 3-step reset wizard (email → OTP →
 * new password → success). Presentation lives in the `ForgotPassword*Step`
 * components; state lives in `useForgotPasswordEmailFlow` (steps 1–2) and
 * `useForgotPasswordResetFlow` (step 3 + success redirect).
 */
function ForgotPasswordContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetFlow = useForgotPasswordResetFlow({
    onSuccess: () => setCompletedSteps([1, 2, 3]),
  });
  const emailFlow = useForgotPasswordEmailFlow({
    currentStep,
    onSubmitted: () => {
      setCompletedSteps([1]);
      setCurrentStep(2);
    },
    onVerified: (resetToken) => {
      resetFlow.setResetToken(resetToken);
      setCompletedSteps([1, 2]);
      setCurrentStep(3);
    },
  });

  const { emailForm, passwordForm } = useForgotPasswordForms();
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isValid: isEmailValid },
  } = emailForm;
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    formState: { errors: passwordErrors, isValid: isPasswordValid },
  } = passwordForm;

  const newPassword = watch('newPassword');
  const back = () => {
    if (currentStep > 1 && !resetFlow.isSuccess) {
      setCurrentStep(currentStep - 1);
      emailFlow.clearError();
    }
  };
  const errorMessage = currentStep === 3 ? resetFlow.errorMessage : emailFlow.errorMessage;

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <ForgotPasswordPageHeader isSuccess={resetFlow.isSuccess} />

        <CardContent>
          {!resetFlow.isSuccess && (
            <div className="mb-8">
              <StepsIndicator steps={forgotPasswordSteps} currentStep={currentStep} completedSteps={completedSteps} />
            </div>
          )}

          <AuthErrorAlert message={errorMessage} />

          {resetFlow.isSuccess ? (
            <ForgotPasswordSuccessStep redirectCountdown={resetFlow.redirectCountdown} onBackToLogin={resetFlow.backToLogin} />
          ) : (
            <>
              {currentStep === 1 && (
                <ForgotPasswordEmailStep
                  register={registerEmail}
                  errors={emailErrors}
                  isSubmitting={emailFlow.isSubmitting}
                  isValid={isEmailValid}
                  onSubmit={handleSubmitEmail(emailFlow.submitEmail)}
                  onBackToLogin={resetFlow.backToLogin}
                />
              )}

              {currentStep === 2 && (
                <ForgotPasswordCodeStep
                  maskedEmail={emailFlow.maskedEmail}
                  otpCode={emailFlow.otpCode}
                  onOtpChange={emailFlow.setOtpCode}
                  isSubmitting={emailFlow.isSubmitting}
                  onVerify={emailFlow.verifyCode}
                  countdown={emailFlow.countdown}
                  canResend={emailFlow.canResend}
                  onResend={emailFlow.resendCode}
                  onBack={back}
                />
              )}

              {currentStep === 3 && (
                <ForgotPasswordNewPasswordStep
                  register={registerPassword}
                  errors={passwordErrors}
                  newPassword={newPassword || ''}
                  isSubmitting={resetFlow.isSubmitting}
                  isValid={isPasswordValid}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword((s) => !s)}
                  showConfirmPassword={showConfirmPassword}
                  onToggleShowConfirmPassword={() => setShowConfirmPassword((s) => !s)}
                  onSubmit={handleSubmitPassword(resetFlow.submitPassword)}
                  onBack={back}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
