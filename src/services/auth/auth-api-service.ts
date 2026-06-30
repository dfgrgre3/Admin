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
        return { success: true };
      }

      return { success: false, error: data.error || 'فشل تسجيل الدخول' };
    } catch {
      return { success: false, error: 'فشل تسجيل الدخول' };
    }
  },

  /** Register a new user */
  async register(data: { email: string; password: string; username?: string; role?: string }): Promise<RegisterResult> {
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
  async logout(): Promise<void> {
    try {
      await apiClient.fetch(apiRoutes.auth.logout, { method: 'POST' });
    } catch {
      // Ignore errors — always clear client state
    }
  },

  /** Verify 2FA token */
  async verify2FA(userId: string, token: string, rememberMe?: boolean): Promise<AuthResult> {
    try {
      const res = await apiClient.fetch(apiRoutes.auth.verify2FA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
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
