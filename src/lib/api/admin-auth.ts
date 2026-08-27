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

  // The Go backend wraps every success payload in `{success, data}`
  // (`response.Success`), and the Next proxy (`api/auth/_utils.ts`
  // `backendJsonResponse`) forwards it verbatim. `apiClient.fetch` returns the
  // raw Response, so — unlike `apiClient.request` — it does not unwrap the
  // envelope. Read through `data` here, keeping the flat shape as a fallback.
  const payload = (result.data ?? result) as Record<string, unknown>;

  // Check if MFA is required
  if (payload.mfaRequired) {
    return {
      success: true,
      status: 'mfa_required',
      data: {
        mfaToken: payload.ticket as string,
        expiresIn: 300, // 5 minutes
        redirectUrl: '/auth/two-factor',
      },
    };
  }

  const user = (payload.user ?? {}) as Record<string, unknown>;

  return {
    success: true,
    status: 'authenticated',
    data: {
      accessToken: payload.accessToken as string,
      refreshToken: payload.refreshToken as string,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
      user: {
        id: user.id as string,
        name: user.name as string,
        email: user.email as string,
        username: (user.username as string) || (user.email as string),
        avatarUrl: (user.avatar as string) || null,
        isActive: user.status === 'active',
        roles: [user.role as string],
        permissions: (user.permissions as string[]) || [],
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

  // Same `{success, data}` envelope as the login response — see the note in
  // `adminLoginApi`. Note the Go MFA payload's `user` carries only
  // {id, email, name, role}; callers that need permissions/status must follow
  // up with `/api/auth/me`.
  const payload = (result.data ?? result) as Record<string, unknown>;
  const user = (payload.user ?? {}) as Record<string, unknown>;

  return {
    success: true,
    status: 'authenticated',
    data: {
      accessToken: payload.accessToken as string,
      refreshToken: (payload.refreshToken as string) || '',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id as string,
        name: user.name as string,
        email: user.email as string,
        username: (user.username as string) || (user.email as string),
        avatarUrl: (user.avatar as string) || null,
        isActive: true,
        roles: [user.role as string],
        permissions: (user.permissions as string[]) || [],
      },
    },
  };
}
