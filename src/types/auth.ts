/**
 * Admin Login Types
 */

export interface AdminLoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface AdminLoginSuccessResponse {
  success: true;
  status: 'authenticated';
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: AdminUser;
  };
}

export interface AdminLoginMFAResponse {
  success: true;
  status: 'mfa_required';
  data: {
    mfaToken: string;
    expiresIn: number;
    redirectUrl: string;
  };
}

export interface AdminLoginErrorResponse {
  success: false;
  status: 'validation_error' | 'invalid_credentials' | 'account_disabled' | 'account_locked' | 'captcha_required' | 'too_many_requests' | 'server_error';
  error?: string;
  message?: string;
}

export type AdminLoginResponse = AdminLoginSuccessResponse | AdminLoginMFAResponse | AdminLoginErrorResponse;

export interface LoginFormValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
  captchaToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface Verify2FARequest {
  /**
   * The opaque MFA ticket issued by the login response (`data.ticket`). The Go
   * handler binds `{ticket, code}` with both fields required, so this is not
   * optional — it was previously typed as optional alongside a `userId`
   * alternative, which let callers send a body the backend always rejected.
   */
  ticket: string;
  code: string;
  rememberMe?: boolean;
}

export interface Verify2FAResponse {
  success: boolean;
  status?: 'authenticated' | 'mfa_required' | 'invalid_code';
  error?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: AdminUser;
  };
}
