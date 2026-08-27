import { apiRoutes } from '@/lib/api/routes';
import { apiClient } from '@/lib/api/api-client';
import { mapApiUserToAuthUser, type AuthUser } from '@/lib/auth/auth-store';

interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface LoginResult extends AuthResult {
  requires2FA?: boolean;
  userId?: string;
}

interface RegisterResult extends AuthResult {
  autoLoggedIn?: boolean;
}

interface MeResponse {
  user?: Record<string, unknown>;
}

/**
 * Keeps the localStorage token mirror in sync after a successful login/MFA
 * verification. The `access_token` cookie is HttpOnly, so `build-ws-url.ts`
 * (WebSocket auth) and `auth-context.tsx` (session hint) have no other way to
 * see the token. `apiClient.refreshToken()` already does this on every refresh;
 * the login paths must too, otherwise the mirror only ever appears after the
 * first token rotation.
 */
function storeTokenMirror(accessToken?: unknown, refreshToken?: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    if (typeof accessToken === 'string' && accessToken) {
      window.localStorage.setItem('accessToken', accessToken);
    }
    if (typeof refreshToken === 'string' && refreshToken) {
      window.localStorage.setItem('refreshToken', refreshToken);
    }
  } catch {
    // Ignore storage errors (private browsing, quota, etc.)
  }
}

export const authApiService = {
  /** Fetch current authenticated user */
  async fetchMe(): Promise<AuthUser | null> {
    try {
      const data = await apiClient.get<MeResponse>(apiRoutes.auth.me, { cache: 'no-store' });
      if (!data || !data.user) return null;
      return mapApiUserToAuthUser(data.user);
    } catch {
      return null;
    }
  },

  /** Login with email/password */
  async login(email: string, password: string, rememberMe?: boolean): Promise<LoginResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        const payload = data.data || {};
        if (payload.mfaRequired || payload.requires2FA || data.requires2FA) {
          return {
            success: true,
            requires2FA: true,
            userId: payload.ticket || payload.userId || data.userId,
          };
        }
        storeTokenMirror(payload.accessToken ?? data.accessToken, payload.refreshToken ?? data.refreshToken);
        return { success: true };
      }

      return { success: false, error: data.error || 'فشل تسجيل الدخول' };
    } catch {
      return { success: false, error: 'فشل تسجيل الدخول' };
    }
  },

  /** Register a new user. Role is never client-supplied: the backend forces STUDENT. */
  async register(data: { email: string; password: string; username?: string }): Promise<RegisterResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        return { success: true, autoLoggedIn: true };
      }

      return { success: false, error: result.error || 'فشل إنشاء الحساب' };
    } catch {
      return { success: false, error: 'فشل إنشاء الحساب' };
    }
  },

  /** Logout the current user */
  async logout(allDevices?: boolean): Promise<void> {
    try {
      await apiClient.fetch(apiRoutes.auth.logout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: allDevices ? JSON.stringify({ allDevices: true }) : undefined,
      });
    } catch {
      // Ignore errors — always clear client state
    } finally {
      // The auth store reset only clears in-memory Zustand state — it never
      // touches localStorage. Clear the token mirror here too, or a revoked
      // session's tokens survive logout and keep authenticating WebSocket
      // connections (access_token cookie is HttpOnly, so build-ws-url.ts's
      // only real fallback is this localStorage copy).
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem('accessToken');
          window.localStorage.removeItem('refreshToken');
        } catch {
          // Ignore storage errors (private browsing, quota, etc.)
        }
      }
    }
  },

  /**
   * Verify an MFA code.
   *
   * `ticket` is the opaque `mfa_ticket:<id>` handle returned by `login()` (it is
   * carried through the UI under the historical name `userId`). The Go handler
   * (`mfa_handler.go` VerifyMFA) binds `{ticket, code}` with both fields
   * `binding:"required"`, so any other field names produce a 400.
   */
  async verify2FA(ticket: string, code: string, rememberMe?: boolean): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.verify2FA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, code, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        const payload = data.data || {};
        storeTokenMirror(payload.accessToken ?? data.accessToken, payload.refreshToken ?? data.refreshToken);
        return { success: true };
      }

      return { success: false, error: data.error || 'رمز التحقق غير صحيح' };
    } catch {
      return { success: false, error: 'رمز التحقق غير صحيح' };
    }
  },

  /** Forgot password */
  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.forgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /** Verify forgot password code */
  async verifyForgotPasswordCode(email: string, code: string): Promise<AuthResult & { resetToken?: string }> {
    try {
      const res = await apiClient.fetch('/api/auth/password-reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /** Reset password with token */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /** Verify email with token */
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(`${apiRoutes.auth.verifyEmail}?token=${token}`);
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /** Resend verification email */
  async resendVerification(email: string): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.resendVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /** Request a magic link */
  async requestMagicLink(email: string): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.magicLink.request, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true };
      }

      return { success: false, error: data.error || 'فشل إرسال كود الدخول السريع' };
    } catch {
      return { success: false, error: 'فشل إرسال كود الدخول السريع' };
    }
  },
};
