'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verify2FAApi } from '@/lib/api/admin-auth';
import { type Verify2FARequest, type Verify2FAResponse } from '@/types/auth';

interface UseVerify2FAOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useVerify2FA(options?: UseVerify2FAOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Verify2FARequest): Promise<Verify2FAResponse> => {
      return verify2FAApi(data);
    },

    onSuccess: (result) => {
      if (result.success && result.data) {
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', '2fa_verification_success', {
            event_category: 'authentication',
          });
        }
        
        // Store tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', result.data.accessToken);
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
        
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries();
        
        options?.onSuccess?.();
      } else {
        options?.onError?.(result.error || 'فشل التحقق من الرمز');
      }
    },

    onError: (error) => {
      options?.onError?.(error instanceof Error ? error.message : 'فشل التحقق من الرمز');
    },
  });
}