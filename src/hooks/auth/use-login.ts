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
          
          // Redirect to MFA page
          const redirectUrl = result.data?.redirectUrl || '/admin/auth/two-factor';
          const targetUrl = options?.redirectTo 
            ? `${redirectUrl}?redirect=${encodeURIComponent(options.redirectTo)}`
            : redirectUrl;
          router.push(targetUrl);
          return;
        }

        // Track success analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'admin_login_success', {
            event_category: 'authentication',
          });
        }

        // Success - refresh user data
        await refreshUser();
        
        // Invalidate all queries to refresh data
        await queryClient.invalidateQueries();

        // Redirect to dashboard or specified path
        const redirectPath = options?.redirectTo || '/admin/dashboard';
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