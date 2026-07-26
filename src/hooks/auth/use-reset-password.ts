'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetPasswordApi } from '@/lib/api/admin-auth';
import { type ResetPasswordRequest, type ResetPasswordResponse } from '@/types/auth';

interface UseResetPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useResetPassword(options?: UseResetPasswordOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      return resetPasswordApi(data);
    },

    onSuccess: (result) => {
      if (result.success) {
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'password_reset_success', {
            event_category: 'authentication',
          });
        }
        options?.onSuccess?.();
      } else {
        options?.onError?.(result.error || 'فشل إعادة تعيين كلمة المرور');
      }
    },

    onError: (error) => {
      options?.onError?.(error instanceof Error ? error.message : 'فشل إعادة تعيين كلمة المرور');
    },
  });
}