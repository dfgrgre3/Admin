'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminLoginSchema, type AdminLoginFormValues } from '@/lib/validations/admin-login';
import { useLogin } from '@/hooks/auth/use-login';
import { sanitizeRedirectPath } from '@/services/auth/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// SSO Configuration - can be moved to environment variables or settings
const SSO_ENABLED = process.env.NEXT_PUBLIC_SSO_ENABLED === 'true';
const CAPTCHA_ENABLED = process.env.NEXT_PUBLIC_CAPTCHA_ENABLED === 'true';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const redirectUrl = useMemo(
    () => sanitizeRedirectPath(searchParams.get('redirect'), '/admin/dashboard'),
    [searchParams]
  );

  const loginMutation = useLogin({
    redirectTo: redirectUrl,
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
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
      captchaToken: '',
    } as AdminLoginFormValues,
  });

  const identifierValue = watch('identifier');

  // Focus on identifier field on desktop only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      const identifierInput = document.getElementById('identifier');
      if (identifierInput) {
        identifierInput.focus();
      }
    }
  }, []);

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorStatus(null);

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'admin_login_attempt_submitted', {
        event_category: 'authentication',
      });
    }

    try {
      await loginMutation.mutateAsync({
        identifier: data.identifier.trim(),
        password: data.password,
        rememberMe: data.rememberMe,
        captchaToken: data.captchaToken,
      });
    } catch (error) {
      // Error is handled by onError callback
      // Clear password on failed login
      reset({
        ...data,
        password: '',
      });
      
      // Track failed login
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'admin_login_failed', {
          event_category: 'authentication',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/admin/forgot-password');
  };

  const handleSSOClick = (provider: string) => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'admin_login_sso_clicked', {
        event_category: 'authentication',
        event_label: provider,
      });
    }
    // Redirect to SSO provider
    window.location.href = `/api/auth/social/${provider}`;
  };

  // Analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'admin_login_page_viewed', {
        event_category: 'authentication',
      });
    }
  }, []);

  const getErrorAlert = () => {
    if (!errorMessage && !errorStatus) return null;

    return (
      <Alert variant="destructive" className="mb-6" role="alert">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="font-medium">
          {errorStatus || errorMessage}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
              <img
                src="/logo-tolo.jpg"
                alt="TOLO"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback to text if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center text-white font-black text-2xl">
                T
              </div>
            </div>
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight">
            تسجيل الدخول إلى لوحة التحكم
          </CardTitle>
          <CardDescription className="text-base">
            استخدم بيانات حسابك الإداري للمتابعة
          </CardDescription>
        </CardHeader>

        <CardContent>
          {getErrorAlert()}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Identifier Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                البريد الإلكتروني أو اسم المستخدم <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="admin@example.com أو username"
                  {...register('identifier')}
                  className={`pr-10 ${errors.identifier ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  dir="rtl"
                  autoComplete="username"
                  aria-invalid={!!errors.identifier}
                  aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                />
              </div>
              {errors.identifier && (
                <p id="identifier-error" className="text-sm text-red-500 font-medium" role="alert">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                كلمة المرور <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  {...register('password')}
                  className={`pr-10 pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  dir="rtl"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  onKeyUp={(e) => {
                    if (e.getModifierState && e.getModifierState('CapsLock')) {
                      setCapsLockOn(true);
                    } else {
                      setCapsLockOn(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.getModifierState && e.getModifierState('CapsLock')) {
                      setCapsLockOn(true);
                    }
                  }}
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
              
              {/* Caps Lock Warning */}
              {capsLockOn && (
                <p className="text-sm text-amber-600 font-medium" role="alert">
                  تنبيه: مفتاح Caps Lock مفعل
                </p>
              )}

              {errors.password && (
                <p id="password-error" className="text-sm text-red-500 font-medium" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="rememberMe"
                  {...register('rememberMe')}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium cursor-pointer"
                >
                  تذكرني على هذا الجهاز
                </Label>
              </div>
              <Link
                href="/admin/forgot-password"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                <>
                  <ShieldCheck className="ml-2 h-5 w-5" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          {/* SSO Divider */}
          {SSO_ENABLED && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">أو</span>
                </div>
              </div>

              {/* SSO Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSSOClick('google')}
                  className="h-11"
                >
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSSOClick('microsoft')}
                  className="h-11"
                >
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#f3f3f3" d="M0 0h24v24H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M13 1h10v10H13z" />
                    <path fill="#05a6f0" d="M1 13h10v10H1z" />
                    <path fill="#ffba08" d="M13 13h10v10H13z" />
                  </svg>
                  Microsoft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSSOClick('saml')}
                  className="h-11"
                >
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 8.5v7l-8 4-8-4v-7l8-5.82z"/>
                    <path d="M12 6L5.5 9.5v5L12 18l6.5-3.5v-5L12 6z"/>
                  </svg>
                  SAML
                </Button>
              </div>
            </>
          )}

          {/* Captcha */}
          {CAPTCHA_ENABLED && (
            <div className="mt-6">
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600">Captcha placeholder</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
              <p className="text-center sm:text-right">
                © {new Date().getFullYear()} Tolo Platform. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-4">
                <Link href="/help" className="hover:text-gray-900 transition-colors">
                  مساعدة
                </Link>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  الخصوصية
                </Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  الشروط
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}