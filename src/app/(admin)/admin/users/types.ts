// ─────────────────────────────────────────────
//  Users - shared types
// ─────────────────────────────────────────────

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "PARENT";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING";

export type DangerousUserAction =
  | "SUSPEND"
  | "BAN"
  | "UNSUSPEND"
  | "UNBAN"
  | "RESET_PASSWORD"
  | "DELETE"
  | "FORCE_LOGOUT"
  | "VERIFY_EMAIL"
  | "VERIFY_PHONE"
  | "PROMOTE"
  | "DEMOTE"
  | "RESEND_OTP"
  | "RESET_ATTEMPTS";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  isOnline?: boolean;
}

export interface UserDetails extends UserSummary {
  attemptsCount?: number;
  examsCount?: number;
  averageScore?: number;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UsersResponse {
  users: UserDetails[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
}

export interface UserActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}
