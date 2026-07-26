'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forgotPasswordApi } from '@/lib/api/admin-auth';
import { type ForgotPasswordRequest, type ForgotPasswordResponse } from '@/types/auth';

interface UseForgotPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useForgotPassword(options?: UseForgotPasswordOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      return forgotPasswordApi(data);
    },

    onSuccess: (result) => {
      if (result.success) {
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'forgot_password_requested', {
            event_category: 'authentication',
          });
        }
        options?.onSuccess?.();
      } else {
        options?.onError?.(result.error || 'فشل إرسال رابط إعادة التعيين');
      }
    },

    onError: (error) => {
      options?.onError?.(error instanceof Error ? error.message : 'فشل إرسال رابط إعادة التعيين');
    },
  });
}