'use client';

import React, { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type AuthUser } from '@/lib/auth/auth-store';
import { logger } from '@/lib/logger';
import { authApiService } from '@/services/auth/auth-api-service';
import { isStaffAdminPanelRole } from '@/lib/auth/admin-panel-roles';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{success: boolean; requires2FA?: boolean; userId?: string; error?: string;}>;
  register: (
    data: {
      email: string;
      password: string;
      username?: string;
    }
  ) => Promise<{success: boolean; error?: string; message?: string; autoLoggedIn?: boolean;}>;
  logout: (allDevices?: boolean) => Promise<void>;
  verify2FA: (userId: string, token: string, rememberMe?: boolean) => Promise<{success: boolean; error?: string;}>;
  refreshUser: (options?: {clearOnFailure?: boolean;}) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{success: boolean; error?: string; message?: string;}>;
  resetPassword: (token: string, newPassword: string) => Promise<{success: boolean; error?: string;}>;
  verifyEmail: (token: string) => Promise<{success: boolean; error?: string;}>;
  resendVerification: (email: string) => Promise<{success: boolean; error?: string;}>;
  requestMagicLink: (email: string) => Promise<{success: boolean; error?: string;}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialAuthHint,
}: {children: React.ReactNode; initialAuthHint?: boolean;}) {
  const { setUser, reset: resetStore, setIsLoading } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastSyncedId = useRef<string | null>(null);
  const router = useRouter();

  // Fetch user profile on mount
  useEffect(() => {
    let cancelled = false;
    const finishLoading = () => {
      if (cancelled) return;
      setIsInitialLoad(false);
      setIsLoading(false);
    };

    const fetchUser = async () => {
      try {
        const mappedUser = await authApiService.fetchMe();

        if (mappedUser) {
          // Role validation for Admin route
          if (!isStaffAdminPanelRole(mappedUser.role)) {
            logger.warn('Unauthorized admin panel access attempt by role:', mappedUser.role);
            resetStore();
            finishLoading();
            return;
          }

          setUser(mappedUser);
        } else {
          resetStore();
        }
      } catch (e) {
        logger.error('Failed to load user profile:', e);
        resetStore();
      } finally {
        finishLoading();
      }
    };

    if (initialAuthHint) {
      fetchUser();
    } else {
      finishLoading();
    }

    return () => {
      cancelled = true;
    };
  }, [setUser, resetStore, setIsLoading, initialAuthHint]);

  const user = useAuthStore((state) => state.user);
  const isStoreLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isLoading = isStoreLoading || isInitialLoad;

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const result = await authApiService.login(email, password, rememberMe);

      if (!result.success) {
        return result;
      }

      if (result.requires2FA) {
        return { success: true, requires2FA: true, userId: result.userId };
      }

      // Fetch full user after successful login & validate admin role
      const mappedUser = await authApiService.fetchMe();

      if (mappedUser) {
        if (!isStaffAdminPanelRole(mappedUser.role)) {
          await authApiService.logout();
          return { success: false, error: 'ليس لديك صلاحيات الوصول إلى لوحة التحكم' };
        }
        setUser(mappedUser);
      }

      return { success: true };
    } catch (err) {
      logger.error('Admin Login error:', err);
      return { success: false, error: 'فشل تسجيل الدخول' };
    }
  }, [setUser]);

  const register = useCallback(async (data: { email: string; password: string; username?: string; }) => {
    try {
      return await authApiService.register(data);
    } catch (err) {
      logger.error('Registration error:', err);
      return { success: false, error: 'فشل إنشاء الحساب' };
    }
  }, []);

  const logout = useCallback(async (allDevices?: boolean) => {
    await authApiService.logout(allDevices);
    resetStore();
    router.replace('/admin-login');
  }, [resetStore, router]);

  const verify2FA = useCallback(async (userId: string, token: string, rememberMe?: boolean) => {
    try {
      return await authApiService.verify2FA(userId, token, rememberMe);
    } catch (err) {
      logger.error('2FA verification error:', err);
      return { success: false, error: 'رمز التحقق غير صحيح' };
    }
  }, []);

  const refreshUser = useCallback(async (options?: {clearOnFailure?: boolean;}) => {
    try {
      const mappedUser = await authApiService.fetchMe();

      if (mappedUser) {
        setUser(mappedUser);
        return true;
      }

      if (options?.clearOnFailure) {
        resetStore();
      }
      return false;
    } catch (e) {
      logger.error('Failed to refresh user profile:', e);
      if (options?.clearOnFailure) {
        resetStore();
      }
      return false;
    }
  }, [setUser, resetStore]);

  const forgotPassword = useCallback(async (email: string) => authApiService.forgotPassword(email), []);
  const resetPassword = useCallback(async (token: string, newPassword: string) => authApiService.resetPassword(token, newPassword), []);
  const verifyEmail = useCallback(async (token: string) => authApiService.verifyEmail(token), []);
  const resendVerification = useCallback(async (email: string) => authApiService.resendVerification(email), []);
  const requestMagicLink = useCallback(async (email: string) => authApiService.requestMagicLink(email), []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    verify2FA,
    refreshUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    requestMagicLink,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
