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
  city?: string | null;
  gender?: string | null;
  gradeLevel?: string | null;
  activeSubscriptionId?: string | null;
  subscriptionExpiresAt?: string | null;
  paymentStatus?: UserPaymentStatus;
  trialEndsAt?: string | null;
  role: UserRole;
  status: UserStatus;
  walletBalance?: number;
  coursesCount?: number;
  ordersCount?: number;
  certificatesCount?: number;
  devicesCount?: number;
  subscriptionStatus?: string;
  isOnline?: boolean;
  lastActivityAt?: string | null;
  _count: { 
    tasks: number; 
    studySessions: number; 
    achievements: number;
    courses?: number;
    orders?: number;
    certificates?: number;
    devices?: number;
  };
}

export interface AdminUsersPage {
  users: AdminUserListItem[];
  summary: { 
    totalUsers: number; 
    totalAdmins: number; 
    powerUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalModerators: number;
    verified: number;
    notVerified: number;
    suspended: number;
    active: number;
    blocked: number;
    deleted: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    onlineNow: number;
  };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: "name" | "createdAt" | "lastLogin" | "totalXP" | "status" | "walletBalance" | "coursesCount" | "ordersCount";
  sortOrder?: "asc" | "desc";
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdFrom?: string;
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  country?: string;
  city?: string;
  gender?: string;
  gradeLevel?: string;
  subscriptionStatus?: string;
  subscriptionExpiresTo?: string;
  paymentStatus?: string;
  includeDeleted?: boolean;
  isOnline?: boolean;
  walletMin?: number;
  walletMax?: number;
  coursesMin?: number;
  coursesMax?: number;
  ordersMin?: number;
  ordersMax?: number;
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

  // GET /api/admin/users/analytics
  async getAnalytics(): Promise<{
    growth: Array<{ name: string; users: number }>;
    roles: Array<{ name: string; value: number }>;
    countries: Array<{ name: string; users: number }>;
    loginActivity: Array<{ name: string; logins: number }>;
    registrations: Array<{ name: string; registrations: number }>;
  }> {
    const result = await adminApi.get<any>("users/analytics");
    return unwrapData(result);
  },

  // GET /api/admin/users/filter-options
  async getFilterOptions(): Promise<{
    teachers: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; name: string }>;
    categories: Array<{ id: string; name: string }>;
  }> {
    const result = await adminApi.get<any>("users/filter-options");
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/ban
  async ban(userId: string, options?: { reason?: string; durationHours?: number; notifyUser?: boolean; permanent?: boolean; expiresAt?: string; hideContent?: boolean }): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/ban`, options || {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/suspend
  async suspend(userId: string, options?: { reason?: string; durationHours?: number; notifyUser?: boolean }): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/suspend`, options || {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/role
  async changeRole(userId: string, options?: { role?: string; reason?: string }): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/role`, options || {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/password-reset
  async sendPasswordReset(userId: string): Promise<void> {
    await adminApi.post<void>(`users/${userId}/password-reset`, {});
  },

  // POST /api/admin/users/invite
  async invite(options?: { email?: string; name?: string; role?: string; message?: string; expiresInHours?: number }): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>("users/invite", options || {});
    return unwrapData(result);
  },

  // POST /api/admin/users/merge
  async merge(primaryUserId: string, secondaryUserId: string, options?: { mergeOrders?: boolean; mergeEnrollments?: boolean; mergeCertificates?: boolean }): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/merge`, { primaryUserId, secondaryUserId, ...options });
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/anonymize
  async anonymize(userId: string, options?: { reason?: string; keepFinancials?: boolean }): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/anonymize`, options || {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/activate
  async activate(userId: string): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/activate`, {});
    return unwrapData(result);
  },

  // ── Extended Users Management Hub API ──

  // POST /api/admin/users/{id}/restore — soft-deleted user restore
  async restore(userId: string): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/restore`, {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/verify-email
  async verifyEmail(userId: string): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/verify-email`, {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/verify-phone
  async verifyPhone(userId: string): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/verify-phone`, {});
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/send-verification — send activation link
  async sendActivationLink(userId: string): Promise<void> {
    await adminApi.post<void>(`users/${userId}/send-verification`, {});
  },

  // POST /api/admin/users/{id}/notifications — send notification to a single user
  async sendNotification(userId: string, payload: {
    title: string;
    body: string;
    channels?: Array<"EMAIL" | "SMS" | "PUSH" | "IN_APP">;
    data?: Record<string, unknown>;
  }): Promise<void> {
    await adminApi.post<void>(`users/${userId}/notifications`, payload);
  },

  // POST /api/admin/users/{id}/assign-role
  async assignRole(userId: string, role: string, reason?: string): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/assign-role`, { role, reason });
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/permissions — add a permission
  async addPermission(userId: string, permission: string): Promise<UserDetails> {
    const result = await adminApi.post<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/permissions`, { permission });
    return unwrapData(result);
  },

  // DELETE /api/admin/users/{id}/permissions — remove a permission
  async removePermission(userId: string, permission: string): Promise<UserDetails> {
    const result = await adminApi.delete<UserDetails | DataEnvelope<UserDetails>>(`users/${userId}/permissions`, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission }),
    });
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/sessions
  async getSessions(userId: string): Promise<UserSession[]> {
    const result = await adminApi.get<UserSession[] | DataEnvelope<UserSession[]>>(`users/${userId}/sessions`);
    return unwrapData(result);
  },

  // POST /api/admin/users/{id}/sessions/{sessionId}/terminate
  async terminateSession(userId: string, sessionId: string): Promise<void> {
    await adminApi.post<void>(`users/${userId}/sessions/${sessionId}/terminate`, {});
  },

  // POST /api/admin/users/{id}/sessions/terminate-all
  async terminateAllSessions(userId: string): Promise<void> {
    await adminApi.post<void>(`users/${userId}/sessions/terminate-all`, {});
  },

  // GET /api/admin/users/{id}/devices
  async getDevices(userId: string): Promise<UserDevice[]> {
    const result = await adminApi.get<UserDevice[] | DataEnvelope<UserDevice[]>>(`users/${userId}/devices`);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/login-history
  async getLoginHistory(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; items: UserLoginHistoryItem[] }> {
    const result = await adminApi.get<{ total: number; items: UserLoginHistoryItem[] } | DataEnvelope<{ total: number; items: UserLoginHistoryItem[] }>>(`users/${userId}/login-history`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/notifications
  async getUserNotifications(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; items: UserNotificationItem[] }> {
    const result = await adminApi.get<{ total: number; items: UserNotificationItem[] } | DataEnvelope<{ total: number; items: UserNotificationItem[] }>>(`users/${userId}/notifications`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/orders
  async getOrders(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; items: UserOrderItem[] }> {
    const result = await adminApi.get<{ total: number; items: UserOrderItem[] } | DataEnvelope<{ total: number; items: UserOrderItem[] }>>(`users/${userId}/orders`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/certificates
  async getCertificates(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; items: UserCertificateItem[] }> {
    const result = await adminApi.get<{ total: number; items: UserCertificateItem[] } | DataEnvelope<{ total: number; items: UserCertificateItem[] }>>(`users/${userId}/certificates`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/wallet/transactions
  async getWalletTransactions(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; balance: number; items: UserWalletTransaction[] }> {
    const result = await adminApi.get<{ total: number; balance: number; items: UserWalletTransaction[] } | DataEnvelope<{ total: number; balance: number; items: UserWalletTransaction[] }>>(`users/${userId}/wallet/transactions`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/tickets
  async getSupportTickets(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; items: UserSupportTicket[] }> {
    const result = await adminApi.get<{ total: number; items: UserSupportTicket[] } | DataEnvelope<{ total: number; items: UserSupportTicket[] }>>(`users/${userId}/tickets`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/audit-logs
  async getAuditLogs(userId: string, options?: { limit?: number; page?: number }): Promise<{ total: number; items: UserAuditLogItem[] }> {
    const result = await adminApi.get<{ total: number; items: UserAuditLogItem[] } | DataEnvelope<{ total: number; items: UserAuditLogItem[] }>>(`users/${userId}/audit-logs`, options);
    return unwrapData(result);
  },

  // GET /api/admin/users/{id}/permissions
  async getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    const result = await adminApi.get<UserPermissionsResponse | DataEnvelope<UserPermissionsResponse>>(`users/${userId}/permissions`);
    return unwrapData(result);
  },

  // POST /api/admin/users/bulk-suspend
  async bulkSuspend(userIds: string[], reason?: string): Promise<BulkOperationResult> {
    const result = await adminApi.post<BulkOperationResult | DataEnvelope<BulkOperationResult>>("users/bulk-suspend", { userIds, reason });
    return unwrapData(result);
  },

  // POST /api/admin/users/bulk-activate
  async bulkActivate(userIds: string[]): Promise<BulkOperationResult> {
    const result = await adminApi.post<BulkOperationResult | DataEnvelope<BulkOperationResult>>("users/bulk-activate", { userIds });
    return unwrapData(result);
  },

  // POST /api/admin/users/bulk-restore
  async bulkRestore(userIds: string[]): Promise<BulkOperationResult> {
    const result = await adminApi.post<BulkOperationResult | DataEnvelope<BulkOperationResult>>("users/bulk-restore", { userIds });
    return unwrapData(result);
  },

  // POST /api/admin/users/bulk-assign-role
  async bulkAssignRole(userIds: string[], role: string): Promise<BulkOperationResult> {
    const result = await adminApi.post<BulkOperationResult | DataEnvelope<BulkOperationResult>>("users/bulk-assign-role", { userIds, role });
    return unwrapData(result);
  },

  // POST /api/admin/users/bulk-notify
  async bulkNotify(userIds: string[], payload: { title: string; body: string; channels?: Array<"EMAIL" | "SMS" | "PUSH" | "IN_APP"> }): Promise<BulkOperationResult> {
    const result = await adminApi.post<BulkOperationResult | DataEnvelope<BulkOperationResult>>("users/bulk-notify", { userIds, ...payload });
    return unwrapData(result);
  },

  // POST /api/admin/users/bulk-export
  async bulkExport(userIds: string[], format: "csv" | "excel" | "json" | "pdf"): Promise<Blob> {
    const response = await adminApi.fetch(`/admin/users/bulk-export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds, format }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.error || "فشل تصدير المستخدمين");
    }
    return response.blob();
  },

  // POST /api/admin/users/{id}/avatar — upload avatar image
  async uploadAvatar(userId: string, file: File): Promise<UserDetails> {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await adminApi.fetch(`/admin/users/${userId}/avatar`, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "فشل رفع الصورة");
    }
    return unwrapData(payload);
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

// ── Extended sub-resource types (Users Management Hub) ──

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  country: string | null;
  lastActivity: string | null;
  loginTime: string;
  logoutTime: string | null;
  isCurrent: boolean;
}

export interface UserDevice {
  id: string;
  name: string;
  browser: string;
  os: string;
  ip: string;
  country: string | null;
  lastUsedAt: string | null;
  trusted: boolean;
}

export interface UserLoginHistoryItem {
  id: string;
  date: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  country: string | null;
  result: "SUCCESS" | "FAILED" | "BLOCKED";
  reason: string | null;
}

export interface UserNotificationItem {
  id: string;
  type: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface UserOrderItem {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: string;
  itemsCount: number;
  createdAt: string;
}

export interface UserCertificateItem {
  id: string;
  title: string;
  courseName: string;
  issuedAt: string;
  grade: number | null;
  url: string | null;
}

export interface UserWalletTransaction {
  id: string;
  type: "CREDIT" | "DEBIT" | "REFUND";
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export interface UserSupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface UserAuditLogItem {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string | null;
  oldValue: unknown;
  newValue: unknown;
  ip: string | null;
  createdAt: string;
}

export interface UserPermissionsResponse {
  role: UserRole;
  roles: string[];
  permissions: string[];
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: Array<{ id: string; error: string }>;
}
