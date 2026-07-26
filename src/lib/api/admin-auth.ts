import { apiClient } from './api-client';
import { type AdminLoginRequest, type AdminLoginResponse, type ForgotPasswordRequest, type ForgotPasswordResponse, type ResetPasswordRequest, type ResetPasswordResponse, type Verify2FARequest, type Verify2FAResponse } from '@/types/auth';

/**
 * Admin login API function
 * POST /api/v1/auth/login
 */
export async function adminLoginApi(
  data: AdminLoginRequest
): Promise<AdminLoginResponse> {
  const response = await apiClient.fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.identifier,
      password: data.password,
      rememberMe: data.rememberMe,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      status: result.status || 'server_error',
      error: result.error || result.message || 'فشل تسجيل الدخول',
    };
  }

  // Check if MFA is required
  if (result.mfaRequired) {
    return {
      success: true,
      status: 'mfa_required',
      data: {
        mfaToken: result.ticket,
        expiresIn: 300, // 5 minutes
        redirectUrl: '/auth/two-factor',
      },
    };
  }

  return {
    success: true,
    status: 'authenticated',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        username: result.user.username || result.user.email,
        avatarUrl: result.user.avatar || null,
        isActive: result.user.status === 'active',
        roles: [result.user.role],
        permissions: result.user.permissions || [],
      },
    },
  };
}

/**
 * Forgot password API function
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPasswordApi(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: result.error || result.message || 'فشل إرسال رابط إعادة التعيين',
    };
  }

  return {
    success: true,
    message: result.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
  };
}

/**
 * Reset password API function
 * POST /api/v1/auth/reset-password
 */
export async function resetPasswordApi(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await apiClient.fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: data.token,
      newPassword: data.password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: result.error || result.message || 'فشل إعادة تعيين كلمة المرور',
    };
  }

  return {
    success: true,
    message: result.message || 'تم إعادة تعيين كلمة المرور بنجاح',
  };
}

/**
 * Verify 2FA API function
 * POST /api/v1/mfa/verify
 */
export async function verify2FAApi(
  data: Verify2FARequest
): Promise<Verify2FAResponse> {
  const response = await apiClient.fetch('/api/auth/mfa/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ticket: data.ticket, // The ticket from login response
      code: data.code,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      status: 'invalid_code',
      error: result.error || result.message || 'فشل التحقق من الرمز',
    };
  }

  return {
    success: true,
    status: 'authenticated',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken || '',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        username: result.user.username || result.user.email,
        avatarUrl: result.user.avatar || null,
        isActive: true,
        roles: [result.user.role],
        permissions: result.user.permissions || [],
      },
    },
  };
}
