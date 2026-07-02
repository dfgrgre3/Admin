import { adminApi } from "./admin-api";
import type { User } from "@/types/user";
import type { UserDetails } from "@/app/(admin)/admin/users/[id]/_components/types";
import { UserRole, UserStatus } from "@/types/enums";

export interface AdminUserListItem extends Pick<User,
  "id" | "email" | "permissions" |
  "emailVerified" | "createdAt" | "lastLogin" | "totalXP" | "level" | "currentStreak"
> {
  name: string | null;
  username: string | null;
  avatar: string | null;
  phone?: string | null;
  phoneVerified?: boolean | null;
  twoFactorEnabled?: boolean;
  country?: string | null;
  gradeLevel?: string | null;
  activeSubscriptionId?: string | null;
  subscriptionExpiresAt?: string | null;
  role: UserRole;
  status: UserStatus;
  _count: { tasks: number; studySessions: number; achievements: number };
}

export interface AdminUsersPage {
  users: AdminUserListItem[];
  summary: { totalUsers: number; totalAdmins: number; powerUsers: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: "name" | "createdAt" | "lastLogin" | "totalXP" | "status";
  sortOrder?: "asc" | "desc";
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdFrom?: string;
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  country?: string;
  gradeLevel?: string;
  subscriptionStatus?: string;
  subscriptionExpiresTo?: string;
  includeDeleted?: boolean;
}

type DataEnvelope<T> = { data: T };

function unwrapData<T>(value: T | DataEnvelope<T>): T {
  return value && typeof value === "object" && "data" in value
    ? (value as DataEnvelope<T>).data
    : value as T;
}

export const adminUsersApi = {
  async list(query: AdminUsersQuery, options?: { signal?: AbortSignal }): Promise<AdminUsersPage> {
    const fetchOptions: RequestInit = {};
    if (options?.signal) {
      fetchOptions.signal = options.signal;
    }
    const result = await adminApi.get<AdminUsersPage | DataEnvelope<AdminUsersPage>>("users", { ...query }, fetchOptions);
    return unwrapData(result);
  },

  async get(userId: string): Promise<UserDetails> {
    const result = await adminApi.get<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}`);
    return unwrapData(result);
  },

  update(userId: string, changes: Partial<UserDetails>): Promise<UserDetails> {
    return adminApi.patch<UserDetails>(`users/${userId}`, changes);
  },

  updateStatus(userId: string, status: UserStatus, details?: { reason?: string; expiresAt?: string | null }): Promise<UserDetails> {
    return adminApi.patch<UserDetails>(`users/${userId}`, {
      status,
      statusReason: details?.reason,
      statusExpiresAt: details?.expiresAt,
    });
  },

  remove(userId: string): Promise<void> {
    return adminApi.delete<void>(`users/${userId}`);
  },

  resetPassword(userId: string, password: string): Promise<void> {
    return adminApi.post<void>(`users/${userId}/password`, { password });
  },

  updateMany(userIds: string[], changes: Partial<Pick<UserDetails, "role" | "status">>) {
    return Promise.allSettled(userIds.map((userId) => adminApi.patch<UserDetails>(`users/${userId}`, changes)));
  },
};
