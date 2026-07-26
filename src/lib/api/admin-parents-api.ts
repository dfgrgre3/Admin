import { adminApi } from "./admin-api";
import type { UserRole, UserStatus } from "@/types/enums";

export interface ParentListItem {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  phone?: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  country?: string | null;
  emailVerified: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  linkedStudentsCount: number;
  activeSubscription?: boolean;
  activeSubscriptionId?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students?: number;
  };
}

export interface ParentStatistics {
  totalParents: number;
  activeParents: number;
  suspendedParents: number;
  pendingApproval: number;
  onlineParents: number;
  newParentsToday: number;
  newParentsThisMonth: number;
}

export interface ParentStudentsQuery {
  page?: number;
  limit?: number;
}

export interface ParentStudent {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  level: number;
  progress: number;
  attendance: number;
  currentGPA: number;
  lastActivity?: string | null;
}

export interface ParentStudentsResponse {
  students: ParentStudent[];
  total: number;
}

export interface ParentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  sortBy?: "name" | "createdAt" | "lastLogin" | "linkedStudentsCount";
  sortOrder?: "asc" | "desc";
  country?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdFrom?: string;
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  minStudents?: number;
  maxStudents?: number;
  activeSubscription?: boolean;
}

export interface ParentsPage {
  parents: ParentListItem[];
  summary: ParentStatistics;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

function unwrapData<T>(value: T | DataEnvelope<T>): T {
  if (isDataEnvelope<T>(value)) {
    return value.data;
  }
  return value as T;
}

export const adminParentsApi = {
  // Get parents list with server-side pagination and filtering
  async list(query: ParentsQuery, options?: { signal?: AbortSignal }): Promise<ParentsPage> {
    const fetchOptions: RequestInit = {};
    if (options?.signal) {
      fetchOptions.signal = options.signal;
    }
    // Use the existing users endpoint with role filter
    const result = await adminApi.get<any>("users", { ...query, role: "PARENT" as UserRole }, fetchOptions);
    const data = unwrapData(result);
    
    // Transform users response to parents format
    return {
      parents: (data.users || []).map((user: any) => ({
        ...user,
        linkedStudentsCount: user._count?.students || 0,
        activeSubscription: !!user.activeSubscriptionId,
      })),
      summary: data.summary || {
        totalParents: 0,
        activeParents: 0,
        suspendedParents: 0,
        pendingApproval: 0,
        onlineParents: 0,
        newParentsToday: 0,
        newParentsThisMonth: 0,
      },
      pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  // Get parent statistics
  async getStatistics(): Promise<ParentStatistics> {
    const result = await adminApi.get<ParentStatistics | DataEnvelope<ParentStatistics>>("parents/statistics");
    return unwrapData(result);
  },

  // Get parent by ID
  async get(parentId: string): Promise<ParentListItem> {
    const result = await adminApi.get<ParentListItem | DataEnvelope<ParentListItem>>(`users/${parentId}`);
    const data = unwrapData(result);
    return {
      ...data,
      linkedStudentsCount: data._count?.students || 0,
      activeSubscription: !!data.activeSubscriptionId,
    };
  },

  // Get parent students
  async getStudents(parentId: string): Promise<ParentStudentsResponse> {
    const result = await adminApi.get<ParentStudentsResponse | DataEnvelope<ParentStudentsResponse>>(`users/${parentId}/students`);
    return unwrapData(result);
  },

  // Link student to parent
  async linkStudent(parentId: string, studentId: string): Promise<{ message: string }> {
    const result = await adminApi.post<{ message: string } | DataEnvelope<{ message: string }>>(`users/${parentId}/students/link`, { studentId });
    return unwrapData(result);
  },

  // Unlink student from parent
  async unlinkStudent(parentId: string, studentId: string): Promise<{ message: string }> {
    const result = await adminApi.delete<{ message: string } | DataEnvelope<{ message: string }>>(`users/${parentId}/students/unlink?studentId=${studentId}`);
    return unwrapData(result);
  },

  // Update parent
  async update(parentId: string, changes: Partial<ParentListItem>): Promise<ParentListItem> {
    const result = await adminApi.patch<ParentListItem | DataEnvelope<ParentListItem>>(`users/${parentId}`, changes);
    return unwrapData(result);
  },

  // Update parent status
  async updateStatus(parentId: string, status: UserStatus, details?: { reason?: string; expiresAt?: string | null }): Promise<ParentListItem> {
    const result = await adminApi.patch<ParentListItem | DataEnvelope<ParentListItem>>(`users/${parentId}`, {
      status,
      statusReason: details?.reason,
      statusExpiresAt: details?.expiresAt,
    });
    return unwrapData(result);
  },

  // Delete parent (soft delete)
  async remove(parentId: string): Promise<void> {
    return adminApi.delete<void>(`users/${parentId}`);
  },

  // Reset parent password
  async resetPassword(parentId: string, password: string): Promise<void> {
    return adminApi.post<void>(`users/${parentId}/password`, { password });
  },

  // Bulk update parents
  async updateMany(parentIds: string[], changes: Partial<Pick<ParentListItem, "role" | "status">>) {
    return Promise.allSettled(parentIds.map((parentId) => 
      adminApi.patch<ParentListItem | DataEnvelope<ParentListItem>>(`users/${parentId}`, changes).then(unwrapData)
    ));
  },

  // Bulk delete parents
  async bulkRemove(parentIds: string[]): Promise<{ deleted: number; failed: number }> {
    const response = await adminApi.post<{ deleted: number; failed: number } | DataEnvelope<{ deleted: number; failed: number }>>("users/bulk-delete", { userIds: parentIds });
    return unwrapData(response);
  },
};
