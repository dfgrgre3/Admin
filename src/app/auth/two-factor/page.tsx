'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { twoFactorSchema, type TwoFactorFormValues } from '@/lib/validations/auth-two-factor';
import { useVerify2FA } from '@/hooks/auth/use-verify-2fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const userId = searchParams.get('userId') || '';
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const verify2FAMutation = useVerify2FA({
    onSuccess: () => {
      setVerified(true);
      setSuccessMessage('تم التحقق بنجاح');
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
    },
    onError: (error) => {
      setErrorMessage(error);
      setIsSubmitting(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: TwoFactorFormValues) => {
    if (!userId) {
      setErrorMessage('معرف المستخدم غير موجود');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await verify2FAMutation.mutateAsync({
        userId,
        code: data.code,
        rememberMe: true,
      });
    } catch (error) {
      // Error is handled by onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
    setCanResend(false);
    setCountdown(30);
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

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

  const getSuccessAlert = () => {
    if (!successMessage) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, height: 0 }}
        animate={{ opacity: 1, scale: 1, height: 'auto' }}
        className="mb-6"
      >
        <Alert className="mb-6 border-green-500/20 bg-green-500/10 text-green-400" role="alert">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {successMessage}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  };

  if (!userId) {
    return (
      <div className="w-full max-w-md mx-auto" dir="rtl">
        <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h3 className="text-2xl font-bold text-white">طلب غير صالح</h3>
              <p className="text-gray-400">
                عذراً، يبدو أن طلب التحقق الثنائي غير صالح
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
                العودة إلى تسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="w-full max-w-md mx-auto" dir="rtl">
        <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white">تم التحقق بنجاح!</h3>
              <p className="text-gray-400">
                جاري تحويلك إلى لوحة التحكم...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            التحقق الثنائي
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            أدخل رمز الأمان من تطبيق المصادقة
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {getErrorAlert()}
            {getSuccessAlert()}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 2FA Icon */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
                <ShieldAlert className="h-12 w-12 text-orange-500" />
              </div>
            </div>

            {/* Info Text */}
            <div className="text-center space-y-2 mb-6">
              <p className="text-sm text-gray-400">
                تم إرسال رمز التحقق إلى تطبيق المصادقة الخاص بك
              </p>
              <p className="text-xs text-gray-500">
                أدخل الرمز المكون من 6 أرقام للمتابعة
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-300 text-center block">
                رمز التحقق <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                {...register('code')}
                className={`text-center text-2xl tracking-widest font-bold text-white bg-white/5 border-white/10 ${errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                dir="ltr"
                autoComplete="one-time-code"
                aria-invalid={!!errors.code}
                aria-describedby={errors.code ? 'code-error' : undefined}
              />
              {errors.code && (
                <p id="code-error" className="text-sm text-red-500 font-medium text-center" role="alert">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جارٍ التحقق...
                </>
              ) : (
                <>
                  <ShieldAlert className="ml-2 h-5 w-5" />
                  تحقق
                </>
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 pt-6 border-t border-white/10">
            {canResend ? (
              <button
                onClick={handleResendCode}
                className="w-full text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                إعادة إرسال الرمز
              </button>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                يمكنك إعادة إرسال الرمز بعد {countdown} ثانية
              </p>
            )}
          </div>

          {/* Backup Codes Notice */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500 text-center">
              💡 إذا فقدت الوصول إلى تطبيق المصادقة، يمكنك استخدام أحد رموز الاسترداد
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              العودة إلى تسجيل الدخول
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}