'use client';

import React, { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/nextjs';
import { useAuthStore, type AuthUser } from '@/lib/auth/auth-store';
import { logger } from '@/lib/logger';
import { authApiService } from '@/services/auth/auth-api-service';
import { isStaffAdminPanelRole } from '@/lib/auth/admin-panel-roles';

// Helper to extract Clerk error messages safely
function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const clerkErr = err as { errors?: { message?: string }[]; message?: string };
    if (Array.isArray(clerkErr.errors) && clerkErr.errors.length > 0) {
      return clerkErr.errors[0]?.message || fallback;
    }
    if (typeof clerkErr.message === 'string') {
      return clerkErr.message;
    }
  }
  return fallback;
}

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
      role?: string;
    }
  ) => Promise<{success: boolean; error?: string; message?: string; autoLoggedIn?: boolean;}>;
  logout: (allDevices?: boolean) => Promise<void>;
  verify2FA: (userId: string, token: string, rememberMe?: boolean) => Promise<{success: boolean; error?: string;}>;
  refreshUser: (options?: {clearOnFailure?: boolean;}) => Promise<boolean>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
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
  const { isLoaded: isClerkLoaded, userId, getToken } = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkUser();
  const { setUser, reset: resetStore } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const lastSyncedId = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Sync ref with current userId to prevent race conditions during async calls
  useEffect(() => {
    currentUserIdRef.current = userId || null;
  }, [userId]);

  // Safety timeout: if Clerk fails to load, force loading to false to fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isClerkLoaded) {
        logger.warn('Clerk failed to load within 5 seconds in Admin Panel.');
        resetStore();
        setIsInitialLoad(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isClerkLoaded, resetStore]);

  // Map Clerk user to local AuthUser model and sync with Zustand store
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!userId || (isUserLoaded && !clerkUser)) {
      lastSyncedId.current = null;
      resetStore();
      setIsInitialLoad(false);
      return;
    }

    let isCancelled = false;

    if (isUserLoaded && clerkUser) {
      const currentStoreUser = useAuthStore.getState().user;

      const mappedUser: AuthUser = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        username: clerkUser.username || null,
        name: clerkUser.fullName || clerkUser.username || null,
        avatar: clerkUser.imageUrl || null,
        role: (clerkUser.publicMetadata?.role as string) || 'STUDENT',
        emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        permissions: Array.isArray(clerkUser.publicMetadata?.permissions)
          ? (clerkUser.publicMetadata.permissions as string[])
          : [],
      };

      // Set user immediately from Clerk to prevent loading UI hangs
      if (lastSyncedId.current !== userId || currentStoreUser?.id !== userId) {
        setUser(mappedUser);
      }

      if (lastSyncedId.current === userId && currentStoreUser?.id === userId) {
        setIsInitialLoad(false);
        return;
      }

      lastSyncedId.current = userId;

      const syncProfile = async () => {
        try {
          const token = await getToken();
          if (isCancelled || currentUserIdRef.current !== userId) return;

          const response = await fetch('/api/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: 'no-store',
          });

          if (isCancelled || currentUserIdRef.current !== userId) return;

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              const mergedUser: AuthUser = {
                ...mappedUser,
                ...data.user, // Merge GORM fields including XP, streakes, levels, role, and permissions
              };

              // Role validation for Admin route
              if (!isStaffAdminPanelRole(mergedUser.role)) {
                logger.warn('Unauthorized admin panel access attempt by role:', mergedUser.role);
                resetStore();
                setIsInitialLoad(false);
                return;
              }

              setUser(mergedUser);
            }
          }
        } catch (e) {
          logger.error('Failed to load secure profile details in Admin Panel:', e);
        } finally {
          if (!isCancelled && currentUserIdRef.current === userId) {
            setIsInitialLoad(false);
          }
        }
      };

      syncProfile();
    }

    return () => {
      isCancelled = true;
    };
  }, [clerkUser, isClerkLoaded, isUserLoaded, userId, setUser, resetStore, getToken]);

  const router = useRouter();
  const clerk = useClerk();
  const getClerkInstance = useCallback(() => {
    if (clerk) return clerk;
    if (typeof window !== 'undefined') {
      return (window as unknown as { Clerk?: typeof clerk }).Clerk || null;
    }
    return null;
  }, [clerk]);

  const user = useAuthStore((state) => state.user);
  const isStoreLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isLoading = isStoreLoading || isInitialLoad;

  const fetchWithAuth = useCallback(async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const [input, init] = args;
    const token = await getToken();
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, {
      ...init,
      headers,
    });
  }, [getToken]);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    const activeClerk = getClerkInstance();
    if (!activeClerk) return { success: false, error: 'نظام المصادقة غير جاهز بعد' };
    try {
      const result = await activeClerk.client.signIn.create({
        identifier: email,
        password,
        strategy: 'password',
      });
      if (result.status === 'complete') {
        await activeClerk.setActive({ session: result.createdSessionId });
        
        // Wait a brief moment for session token to settle
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Verify role on backend
        const token = await getToken();
        const response = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const role = data.user.role;
            if (!isStaffAdminPanelRole(role)) {
              await activeClerk.signOut();
              return { success: false, error: 'ليس لديك صلاحيات الوصول إلى لوحة التحكم' };
            }
          }
        }
        return { success: true };
      }
      if (result.status === 'needs_second_factor') {
        return { success: true, requires2FA: true, userId: result.id };
      }
      return { success: false, error: `الخطوات الإضافية مطلوبة: ${result.status}` };
    } catch (err: unknown) {
      logger.error('Admin Login error:', err);
      return { success: false, error: getClerkErrorMessage(err, 'فشل تسجيل الدخول') };
    }
  }, [getClerkInstance, getToken]);

  const register = useCallback(async (
    data: {
      email: string;
      password: string;
      username?: string;
      role?: string;
    }
  ): Promise<{success: boolean; error?: string; message?: string; autoLoggedIn?: boolean;}> => {
    const activeClerk = getClerkInstance();
    if (!activeClerk) return { success: false, error: 'نظام المصادقة غير جاهز بعد' };
    try {
      const result = await activeClerk.client.signUp.create({
        emailAddress: data.email,
        password: data.password,
        username: data.username,
      });
      if (result.status === 'complete') {
        await activeClerk.setActive({ session: result.createdSessionId });
        return { success: true, autoLoggedIn: true };
      }
      return { success: true, autoLoggedIn: false };
    } catch (err: unknown) {
      logger.error('Registration error:', err);
      return { success: false, error: getClerkErrorMessage(err, 'فشل إنشاء الحساب') };
    }
  }, [getClerkInstance]);

  const logout = useCallback(async () => {
    const activeClerk = getClerkInstance();
    if (activeClerk) {
      await activeClerk.signOut();
    }
    resetStore();
    router.replace('/admin-login');
  }, [getClerkInstance, resetStore, router]);

  const verify2FA = useCallback(async (userId: string, token: string, rememberMe?: boolean): Promise<{success: boolean; error?: string;}> => {
    const activeClerk = getClerkInstance();
    if (!activeClerk) return { success: false, error: 'نظام المصادقة غير جاهز بعد' };
    try {
      const signIn = activeClerk.client.signIn;
      if (signIn.id !== userId) {
        return { success: false, error: 'محاولة تسجيل دخول غير صالحة' };
      }
      const factor = signIn.supportedSecondFactors?.find(
        (f) => (f as { strategy: string }).strategy === 'totp' || 
               (f as { strategy: string }).strategy === 'phone_code' || 
               (f as { strategy: string }).strategy === 'email_code' || 
               (f as { strategy: string }).strategy === 'backup_code'
      );
      const strategy = ((factor as { strategy: string } | undefined)?.strategy || 'totp') as 'phone_code' | 'email_code' | 'totp' | 'backup_code';
      const result = await signIn.attemptSecondFactor({
        strategy,
        code: token,
      });
      if (result.status === 'complete') {
        await activeClerk.setActive({ session: result.createdSessionId });
        return { success: true };
      }
      return { success: false, error: `الخطوات الإضافية مطلوبة: ${result.status}` };
    } catch (err: unknown) {
      logger.error('2FA verification error:', err);
      return { success: false, error: getClerkErrorMessage(err, 'رمز التحقق غير صحيح') };
    }
  }, [getClerkInstance]);

  const refreshUser = useCallback(async (options?: {clearOnFailure?: boolean;}) => {
    if (!userId || !clerkUser) {
      if (options?.clearOnFailure) {
        resetStore();
      }
      return false;
    }
    try {
      await clerkUser.reload();
      const token = await getToken();
      const response = await fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser({
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            username: clerkUser.username || null,
            name: clerkUser.fullName || clerkUser.username || null,
            avatar: clerkUser.imageUrl || null,
            role: data.user.role || 'STUDENT',
            emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
            permissions: data.user.permissions || [],
            ...data.user,
          });
          return true;
        }
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
  }, [userId, clerkUser, getToken, setUser, resetStore]);

  const forgotPassword = useCallback(async (email: string) => authApiService.forgotPassword(email), []);
  const resetPassword = useCallback(async (token: string, newPassword: string) => authApiService.resetPassword(token, newPassword), []);
  const verifyEmail = useCallback(async (token: string) => authApiService.verifyEmail(token), []);
  const resendVerification = useCallback(async (email: string) => authApiService.resendVerification(email), []);
  const requestMagicLink = useCallback(async (email: string): Promise<{success: boolean; error?: string;}> => {
    const activeClerk = getClerkInstance();
    if (!activeClerk) return { success: false, error: 'نظام المصادقة غير جاهز بعد' };
    try {
      const result = await activeClerk.client.signIn.create({
        identifier: email,
      });
      const firstFactor = result.supportedFirstFactors?.find(
        (f) => (f as { strategy: string }).strategy === 'email_code'
      ) as { strategy: string; emailAddressId?: string } | undefined;
      if (firstFactor && firstFactor.emailAddressId) {
        await activeClerk.client.signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: firstFactor.emailAddressId,
        });
        return { success: true };
      }
      return { success: false, error: 'طريقة الدخول السريع غير مدعومة لهذا الحساب' };
    } catch (err: unknown) {
      logger.error('Magic link request error:', err);
      return { success: false, error: getClerkErrorMessage(err, 'فشل إرسال كود الدخول السريع') };
    }
  }, [getClerkInstance]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    verify2FA,
    refreshUser,
    fetchWithAuth,
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
