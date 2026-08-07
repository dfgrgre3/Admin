'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { authApiService } from '@/services/auth/auth-api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OTPInput } from '@/components/auth/otp-input';
import { StepsIndicator } from '@/components/auth/steps-indicator';
import { PasswordStrengthMeter, checkPasswordStrength } from '@/components/auth/password-strength-meter';
import { PasswordRequirements, areAllRequirementsMet } from '@/components/auth/password-requirements';

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

const steps = [
  { id: 1, label: 'البريد' },
  { id: 2, label: 'التحقق' },
  { id: 3, label: 'كلمة المرور' },
];

const emailSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

function ForgotPasswordContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isValid: isEmailValid },
  } = useForm({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    formState: { errors: passwordErrors, isValid: isPasswordValid },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  // Countdown timer for OTP resend
  useEffect(() => {
    if (currentStep === 2 && countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend, currentStep]);

  // Auto-redirect countdown
  useEffect(() => {
    if (isSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && redirectCountdown === 0) {
      router.push('/auth/login');
    }
  }, [isSuccess, redirectCountdown, router]);

  const maskEmail = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const local = parts[0];
    const domain = parts[1];
    if (!local || !domain || local.length <= 2) return email;
    return `${local[0]}${'*'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
  };

  const handleEmailSubmit = async (data: { email: string }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.forgotPassword(data.email.trim().toLowerCase());
      
      if (result.success) {
        setEmail(data.email.trim().toLowerCase());
        setMaskedEmail(maskEmail(data.email.trim().toLowerCase()));
        setCompletedSteps([1]);
        setCurrentStep(2);
        setCountdown(60);
        setCanResend(false);
      } else {
        // Use generic message for security
        setErrorMessage('إذا كان البريد مسجلاً، سنرسل لك كود التحقق');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء إرسال الكود');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      setErrorMessage('أدخل الرمز المكون من 6 أرقام');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.verifyForgotPasswordCode(email, otpCode);
      
      if (result.success && result.resetToken) {
        setResetToken(result.resetToken);
        setCompletedSteps([1, 2]);
        setCurrentStep(3);
      } else {
        setErrorMessage(result.error || 'الرمز غير صحيح أو منتهي الصلاحية');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.forgotPassword(email);
      
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setOtpCode('');
      } else {
        setErrorMessage('فشل إعادة إرسال الكود');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء إعادة إرسال الكود');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    if (!areAllRequirementsMet(data.newPassword)) {
      setErrorMessage('كلمة المرور لا تستوفي جميع الشروط');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApiService.resetPassword(resetToken, data.newPassword);
      
      if (result.success) {
        setCompletedSteps([1, 2, 3]);
        setIsSuccess(true);
        setSuccessMessage('تم تغيير كلمة المرور بنجاح');
      } else {
        setErrorMessage(result.error || 'فشل تغيير كلمة المرور');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !isSuccess) {
      setCurrentStep(currentStep - 1);
      setErrorMessage(null);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const getErrorAlert = () => {
    if (!errorMessage) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, height: 0 }}
        animate={{ opacity: 1, scale: 1, height: 'auto' }}
        exit={{ opacity: 0, scale: 0.95, height: 0 }}
      >
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  };

  const passwordStrength = checkPasswordStrength(newPassword || '');

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <CardHeader className="space-y-1 text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
              <img
                src="/logo-tolo.webp"
                alt="TOLO"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center text-white font-black text-2xl">
                T
              </div>
            </div>
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            استعادة كلمة المرور
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            {isSuccess ? 'تم بنجاح!' : 'اتبع الخطوات لاستعادة حسابك'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Steps Indicator */}
          {!isSuccess && (
            <div className="mb-8">
              <StepsIndicator
                steps={steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {getErrorAlert()}
          </AnimatePresence>

          {/* Success Screen */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <div className="inline-flex items-center justify-center p-6 rounded-full bg-green-500/10 border border-green-500/20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">تم التغيير بنجاح!</h3>
                <p className="text-gray-400">
                  جاري تحويلك إلى صفحة تسجيل الدخول خلال {redirectCountdown} ثوانٍ
                </p>
              </div>

              <Button
                onClick={handleBackToLogin}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
                العودة الآن
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Step 1: Email */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleSubmitEmail(handleEmailSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                        البريد الإلكتروني <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@example.com"
                          {...registerEmail('email')}
                          className={`pr-10 text-white bg-white/5 border-white/10 ${emailErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          dir="rtl"
                          autoComplete="email"
                        />
                      </div>
                      {emailErrors.email && (
                        <p className="text-sm text-red-500 font-medium">{emailErrors.email.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      disabled={isSubmitting || !isEmailValid}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                          جارٍ الإرسال...
                        </>
                      ) : (
                        <>
                          إرسال الكود
                          <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <button
                      onClick={handleBackToLogin}
                      className="w-full text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      العودة إلى تسجيل الدخول
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Verify Code */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2 mb-6">
                    <p className="text-sm text-gray-400">
                      أرسلنا كود التحقق إلى {maskedEmail}
                    </p>
                    <p className="text-xs text-gray-500">
                      أدخل الرمز المكون من 6 أرقام
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 text-center block">
                      رمز التحقق <span className="text-red-500">*</span>
                    </Label>
                    <OTPInput
                      value={otpCode}
                      onChange={setOtpCode}
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    onClick={handleVerifyCode}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    disabled={isSubmitting || otpCode.length !== 6}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جارٍ التحقق...
                      </>
                    ) : (
                      'تحقق'
                    )}
                  </Button>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    {canResend ? (
                      <button
                        onClick={handleResendCode}
                        className="w-full text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        إعادة إرسال الكود
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">
                        يمكنك إعادة إرسال الكود بعد {countdown} ثانية
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
                      رجوع
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: New Password */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-gray-300">
                        كلمة المرور الجديدة <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="أدخل كلمة المرور الجديدة"
                          {...registerPassword('newPassword')}
                          className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${passwordErrors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          dir="rtl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500 font-medium">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <PasswordStrengthMeter strength={passwordStrength} />
                    <PasswordRequirements password={newPassword || ''} />

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                        تأكيد كلمة المرور <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="أعد إدخال كلمة المرور"
                          {...registerPassword('confirmPassword')}
                          className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${passwordErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          dir="rtl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500 font-medium">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      disabled={isSubmitting || !isPasswordValid || !areAllRequirementsMet(newPassword || '')}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                          جارٍ التغيير...
                        </>
                      ) : (
                        <>
                          تغيير كلمة المرور
                          <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
                      رجوع
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}