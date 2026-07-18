import { adminApi } from "./admin-api";
import type { User } from "@/types/user";
import type { UserDetails } from "@/app/(admin)/admin/users/[id]/_components/types";
import { UserRole, UserStatus } from "@/types/enums";

// Payment status values as returned by the backend User model.
// (Distinct from the Payments-style PaymentStatus in @/types/payment.)
export type UserPaymentStatus = "PAID" | "OVERDUE" | "TRIAL" | "NONE" | null;

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
  paymentStatus?: UserPaymentStatus;
  trialEndsAt?: string | null;
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
  paymentStatus?: string;
  includeDeleted?: boolean;
}

type DataEnvelope<T> = { data: T };

function isDataEnvelope<T>(value: unknown): value is DataEnvelope<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "data" in value
  );
}

// Safely unwrap a { data } envelope. Tolerates null/undefined and plain
// (already-unwrapped) payloads without throwing.
function unwrapData<T>(value: T | DataEnvelope<T>): T {
  if (isDataEnvelope<T>(value)) {
    return value.data;
  }
  return value as T;
}

// ── Profile-scoped sub-resource response types ──

export interface UserActivityFeedItem {
  id: string;
  type: "security" | "study" | "enrollment" | "exam";
  title: string;
  detail?: string;
  ip?: string;
  status?: string;
  timestamp: string;
}

export interface UserActivityResponse {
  userId: string;
  total: number;
  feed: UserActivityFeedItem[];
}

export interface EnrollResponse {
  success: boolean;
  alreadyEnrolled?: boolean;
  courseId?: string;
  courseName?: string;
  message?: string;
}

export interface LoginAttempt {
  id: string;
  eventType: string;
  success: boolean;
  ip: string;
  userAgent: string;
  location?: string;
  createdAt: string;
}

export interface LoginAttemptsResponse {
  userId: string;
  total: number;
  failedCount: number;
  attempts: LoginAttempt[];
}

export interface VideoEngagement {
  lessonId: string;
  timeSpentSeconds: number;
  timeSpentMinutes: number;
  completed: boolean;
  status: string;
  lastWatchedPosition: number;
}

export interface VideoEngagementResponse {
  userId: string;
  totalVideos: number;
  totalWatchSeconds: number;
  totalWatchMinutes: number;
  videos: VideoEngagement[];
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

  async get(userId: string, options?: { signal?: AbortSignal }): Promise<UserDetails> {
    const fetchOptions: RequestInit = {};
    if (options?.signal) {
      fetchOptions.signal = options.signal;
    }
    const result = await adminApi.get<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}`, undefined, fetchOptions);
    return unwrapData(result);
  },

  update(userId: string, changes: Partial<UserDetails>): Promise<UserDetails> {
    return adminApi.patch<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}`, changes).then(unwrapData);
  },

  updateStatus(userId: string, status: UserStatus, details?: { reason?: string; expiresAt?: string | null }): Promise<UserDetails> {
    return adminApi.patch<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}`, {
      status,
      statusReason: details?.reason,
      statusExpiresAt: details?.expiresAt,
    }).then(unwrapData);
  },

  remove(userId: string): Promise<void> {
    return adminApi.delete<void>(`users/${userId}`);
  },

  resetPassword(userId: string, password: string): Promise<void> {
    return adminApi.post<void>(`users/${userId}/password`, { password });
  },

  updateMany(userIds: string[], changes: Partial<Pick<UserDetails, "role" | "status">>) {
    return Promise.allSettled(userIds.map((userId) => adminApi.patch<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}`, changes).then(unwrapData)));
  },

  // Bulk create users from CSV import
  async bulkCreate(users: Array<{ email: string; name: string; username?: string; password: string; role?: string }>): Promise<{ created: number; failed: number }> {
    const response = await adminApi.post<{ created: number; failed: number } | DataEnvelope<{ created: number; failed: number }>>("users/bulk-create", { users });
    return unwrapData(response);
  },

  // Bulk delete users
  async bulkRemove(userIds: string[]): Promise<{ deleted: number; failed: number }> {
    const response = await adminApi.post<{ deleted: number; failed: number } | DataEnvelope<{ deleted: number; failed: number }>>("users/bulk-delete", { userIds });
    return unwrapData(response);
  },

  // Reset all permissions to default.
  // NOTE: the backend does not currently expose this endpoint; the call is
  // kept for API parity but will 404 until the route is added server-side.
  async resetAllPermissions(): Promise<void> {
    await adminApi.post<void>("users/reset-all-permissions", {});
  },

  // ── Profile-scoped sub-resources (Single View of the Customer) ──

  // GET /api/admin/users/{id}/activity
  async getActivity(userId: string, options?: { limit?: number }): Promise<UserActivityResponse> {
    const result = await adminApi.get<UserActivityResponse | DataEnvelope<UserActivityResponse>>("users/" + userId + "/activity", options);
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/enrollments
  async enroll(userId: string, courseId: string, isFree = false): Promise<EnrollResponse> {
    const result = await adminApi.post<EnrollResponse | DataEnvelope<EnrollResponse>>("users/" + userId + "/enrollments", { courseId, isFree });
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/login-attempts
  async getLoginAttempts(userId: string, options?: { limit?: number }): Promise<LoginAttemptsResponse> {
    const result = await adminApi.get<LoginAttemptsResponse | DataEnvelope<LoginAttemptsResponse>>("users/" + userId + "/login-attempts", options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/video-engagement
  async getVideoEngagement(userId: string, options?: { limit?: number }): Promise<VideoEngagementResponse> {
    const result = await adminApi.get<VideoEngagementResponse | DataEnvelope<VideoEngagementResponse>>("users/" + userId + "/video-engagement", options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/enrollments
  async getEnrollments(userId: string): Promise<{ total: number; avgProgress: number; enrollments: UserEnrollment[] }> {
    const result = await adminApi.get<{ total: number; avgProgress: number; enrollments: UserEnrollment[] } | DataEnvelope<{ total: number; avgProgress: number; enrollments: UserEnrollment[] }>>("users/" + userId + "/enrollments");
    return unwrapData(result);
  },
};

export interface UserEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  price: number;
  progress: number;
  status: string;
  enrolledAt: string;
}
