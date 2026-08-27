'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminLoginApi } from '@/lib/api/admin-auth';
import { type AdminLoginRequest, type AdminLoginResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface UseLoginOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  skipMfaRedirect?: boolean;
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
      return adminLoginApi(data);
    },

    onSuccess: async (result) => {
      if (result.success) {
        if (result.status === 'mfa_required') {
          // Track analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'admin_login_mfa_required', {
              event_category: 'authentication',
            });
          }
          
          // If skipMfaRedirect is true, let the caller handle MFA
          if (options?.skipMfaRedirect) {
            return;
          }
          
          // Redirect to MFA page. The ticket must travel with the redirect —
          // `/auth/two-factor` renders its invalid-request state without it, and
          // the Go `VerifyMFA` handler requires it in the request body.
          const redirectUrl = result.data?.redirectUrl || '/auth/two-factor';
          const params = new URLSearchParams();
          if (result.data?.mfaToken) {
            params.set('ticket', result.data.mfaToken);
          }
          if (options?.redirectTo) {
            params.set('redirect', options.redirectTo);
          }
          const query = params.toString();
          router.push(query ? `${redirectUrl}?${query}` : redirectUrl);
          return;
        }

        // Track success analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'admin_login_success', {
            event_category: 'authentication',
          });
        }

        // Persist tokens for WebSocket authentication when cookies are unavailable.
        if (typeof window !== 'undefined' && result.data) {
          if (result.data.accessToken) {
            window.localStorage.setItem('accessToken', result.data.accessToken);
          }
          if (result.data.refreshToken) {
            window.localStorage.setItem('refreshToken', result.data.refreshToken);
          }
        }

        // Success - refresh user data
        await refreshUser();
        
        // Invalidate all queries to refresh data
        await queryClient.invalidateQueries();

        // Redirect to the admin home or the specified path. `/admin/dashboard`
        // does not exist in the App Router tree — the admin landing page is
        // `src/app/(admin)/admin/page.tsx`, i.e. `/admin`.
        const redirectPath = options?.redirectTo || '/admin';
        router.push(redirectPath);
        
        options?.onSuccess?.();
      } else {
        options?.onError?.(result.error || 'فشل تسجيل الدخول');
      }
    },

    onError: (error) => {
      options?.onError?.(error instanceof Error ? error.message : 'فشل تسجيل الدخول');
    },
  });
}