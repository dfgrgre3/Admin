'use client';

import { Suspense, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations/auth-reset-password';
import { useResetPassword } from '@/hooks/auth/use-reset-password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PasswordStrength } from '@/components/auth/password-strength';

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

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  const token = searchParams.get('token') || '';

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setPasswordReset(true);
      setSuccessMessage('تم إعادة تعيين كلمة المرور بنجاح');
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
    watch,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: token,
      password: '',
      passwordConfirmation: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await resetPasswordMutation.mutateAsync({
        token: data.token,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });
    } catch (error) {
      // Error is handled by onError callback
    } finally {
      setIsSubmitting(false);
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

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto" dir="rtl">
        <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h3 className="text-2xl font-bold text-white">رابط غير صالح</h3>
              <p className="text-gray-400">
                عذراً، يبدو أن رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية
              </p>
              <Button
                onClick={handleBackToLogin}
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

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10">
        <CardHeader className="space-y-1 text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
              <img
                src="/logo-tolo.jpg"
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
            إعادة تعيين كلمة المرور
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            أدخل كلمة المرور الجديدة لحسابك
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {getErrorAlert()}
            {getSuccessAlert()}
          </AnimatePresence>

          {!passwordReset ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  كلمة المرور الجديدة <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور الجديدة"
                    {...register('password')}
                    className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    dir="rtl"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-500 font-medium" role="alert">
                    {errors.password.message}
                  </p>
                )}
                <PasswordStrength password={passwordValue} />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation" className="text-sm font-medium text-gray-300">
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="passwordConfirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="أعد إدخال كلمة المرور"
                    {...register('passwordConfirmation')}
                    className={`pr-10 pl-10 text-white bg-white/5 border-white/10 ${errors.passwordConfirmation ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    dir="rtl"
                    autoComplete="new-password"
                    aria-invalid={!!errors.passwordConfirmation}
                    aria-describedby={errors.passwordConfirmation ? 'password-confirmation-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.passwordConfirmation && (
                  <p id="password-confirmation-error" className="text-sm text-red-500 font-medium" role="alert">
                    {errors.passwordConfirmation.message}
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
                    جارٍ إعادة التعيين...
                  </>
                ) : (
                  <>
                    <Lock className="ml-2 h-5 w-5" />
                    إعادة تعيين كلمة المرور
                  </>
                )}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-sm text-gray-400">
                  تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <ArrowRight className="ml-2 h-5 w-5 rotate-180" />
                  العودة إلى تسجيل الدخول
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}