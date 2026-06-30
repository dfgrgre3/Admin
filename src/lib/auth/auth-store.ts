import { create } from 'zustand';
import { clearUserId, setUserId } from '@/lib/user-utils';


export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  name?: string | null;
  avatar: string | null;
  role: string;
  emailVerified: boolean | null;

  totalXP?: number;
  level?: number;
  permissions: string[];
  phone?: string | null;
  phoneVerified?: boolean | null;
  totalStudyTime?: number;
  tasksCompleted?: number;
  examsPassed?: number;
  pomodoroSessions?: number;
  deepWorkSessions?: number;
  studyXP?: number;
  taskXP?: number;
  examXP?: number;
  challengeXP?: number;
  questXP?: number;
  seasonXP?: number;
  currentStreak?: number;
  longestStreak?: number;
  status?: string;
  createdAt?: string | Date;
  lastLogin?: string | Date;
  school?: string | null;
  bio?: string | null;
}

/** Maps raw API /auth/me response user object to AuthUser */
export function mapApiUserToAuthUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: raw.id as string,
    email: (raw.email as string) || '',
    username: (raw.username as string) || null,
    name: (raw.name as string) || (raw.username as string) || null,
    avatar: (raw.avatar as string) || null,
    role: (raw.role as string) || 'STUDENT',
    emailVerified: (raw.emailVerified as boolean) || false,
    permissions: (raw.permissions as string[]) || [],
    phone: (raw.phone as string) || null,
    phoneVerified: (raw.phoneVerified as boolean) || null,
    totalXP: raw.totalXP as number | undefined,
    level: raw.level as number | undefined,
    totalStudyTime: raw.totalStudyTime as number | undefined,
    tasksCompleted: raw.tasksCompleted as number | undefined,
    examsPassed: raw.examsPassed as number | undefined,
    currentStreak: raw.currentStreak as number | undefined,
    longestStreak: raw.longestStreak as number | undefined,
    status: raw.status as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    lastLogin: raw.lastLogin as string | undefined,
    school: (raw.school as string) || null,
    bio: (raw.bio as string) || null,
  };
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRefreshing: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;

  // Async Actions handled via the store or external calls
  // (Moving the complex logic here helps reduce Context size)
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isRefreshing: false,
    setUser: (user) => {
      if (user?.id) {
        setUserId(user.id);
      } else {
        clearUserId();
      }
      set({ user, isAuthenticated: !!user, isLoading: false });
    },
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
    reset: () => {
      set({ user: null, isAuthenticated: false, isLoading: false });
      clearUserId();
    }
  })
);
