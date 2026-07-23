/**
 * Instructor Management API Service
 * Handles all API calls for instructor management
 */

import { adminFetch } from './admin-api';

// Types
export interface Instructor {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  phone?: string;
  country?: string;
  status: InstructorStatus;
  role: string;
  specialties: string[];
  languages: string[];
  commissionRate: number;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  bio?: string;
  experience?: number;
  isVerified: boolean;
  documents?: Document[];
}

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  status: DocumentStatus;
  url: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  size?: number;
}

export interface Contract {
  id: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  commissionRate: number;
  terms: string;
  signedAt?: string;
  signedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PaymentMethod;
  period: {
    startDate: string;
    endDate: string;
  };
  transactions: number;
  students: number;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
  referenceNumber?: string;
}

export interface PerformanceMetric {
  id: string;
  period: {
    startDate: string;
    endDate: string;
  };
  students: number;
  courses: number;
  completionRate: number;
  rating: number;
  revenue: number;
  engagement: number;
  responseTime: number;
  comparedToPrevious: {
    students: number;
    revenue: number;
    rating: number;
  };
}

export interface Violation {
  id: string;
  type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  status: ViolationStatus;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  penalty?: Penalty;
}

export interface Penalty {
  type: PenaltyType;
  duration?: number;
  amount?: number;
}

// Enums
export type InstructorStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type DocumentType = 'id' | 'cv' | 'certificate' | 'video' | 'experience' | 'other';
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
export type ContractType = 'standard' | 'custom' | 'renewal';
export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'paypal' | 'stripe' | 'other';
export type ViolationType = 'content_quality' | 'late_response' | 'policy_violation' | 'student_complaint' | 'technical_issue' | 'other';
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
export type PenaltyType = 'warning' | 'suspension' | 'termination' | 'fine';

// API Response Types
export interface InstructorsListResponse {
  instructors: Instructor[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    underReview: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InstructorDetailResponse {
  instructor: Instructor;
  documents: Document[];
  contracts: Contract[];
  payouts: Payout[];
  performance: PerformanceMetric[];
  violations: Violation[];
}

// API Functions
export const instructorsApi = {
  /**
   * Get all instructors with filters
   */
  getInstructors: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<InstructorsListResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await adminFetch(`/api/admin/instructors?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch instructors');
    }
    return response.json();
  },

  /**
   * Get instructor by ID
   */
  getInstructor: async (id: string): Promise<InstructorDetailResponse> => {
    const response = await adminFetch(`/api/admin/instructors/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch instructor');
    }
    return response.json();
  },

  /**
   * Create new instructor
   */
  createInstructor: async (data: Partial<Instructor>): Promise<Instructor> => {
    const response = await adminFetch('/api/admin/instructors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create instructor');
    }
    return response.json();
  },

  /**
   * Update instructor
   */
  updateInstructor: async (id: string, data: Partial<Instructor>): Promise<Instructor> => {
    const response = await adminFetch(`/api/admin/instructors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update instructor');
    }
    return response.json();
  },

  /**
   * Delete instructor (soft delete)
   */
  deleteInstructor: async (id: string): Promise<void> => {
    const response = await adminFetch(`/api/admin/instructors/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete instructor');
    }
  },

  /**
   * Bulk delete instructors
   */
  bulkDeleteInstructors: async (ids: string[]): Promise<void> => {
    const response = await adminFetch('/api/admin/instructors/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error('Failed to delete instructors');
    }
  },

  /**
   * Approve instructor
   */
  approveInstructor: async (id: string): Promise<Instructor> => {
    const response = await adminFetch(`/api/admin/instructors/${id}/approve`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to approve instructor');
    }
    return response.json();
  },

  /**
   * Reject instructor
   */
  rejectInstructor: async (id: string, reason: string): Promise<Instructor> => {
    const response = await adminFetch(`/api/admin/instructors/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      throw new Error('Failed to reject instructor');
    }
    return response.json();
  },

  /**
   * Suspend instructor
   */
  suspendInstructor: async (id: string, reason: string, duration?: number): Promise<Instructor> => {
    const response = await adminFetch(`/api/admin/instructors/${id}/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason, duration }),
    });
    if (!response.ok) {
      throw new Error('Failed to suspend instructor');
    }
    return response.json();
  },

  /**
   * Get instructor documents
   */
  getDocuments: async (instructorId: string): Promise<Document[]> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/documents`);
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    return response.json();
  },

  /**
   * Review document
   */
  reviewDocument: async (
    instructorId: string,
    documentId: string,
    data: { status: DocumentStatus; reviewNotes?: string }
  ): Promise<Document> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/documents/${documentId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to review document');
    }
    return response.json();
  },

  /**
   * Get instructor contracts
   */
  getContracts: async (instructorId: string): Promise<Contract[]> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/contracts`);
    if (!response.ok) {
      throw new Error('Failed to fetch contracts');
    }
    return response.json();
  },

  /**
   * Create contract
   */
  createContract: async (instructorId: string, data: Partial<Contract>): Promise<Contract> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create contract');
    }
    return response.json();
  },

  /**
   * Get instructor payouts
   */
  getPayouts: async (instructorId: string, params?: { page?: number; limit?: number }): Promise<{
    payouts: Payout[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const response = await adminFetch(`/api/admin/instructors/${instructorId}/payouts?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payouts');
    }
    return response.json();
  },

  /**
   * Get instructor performance
   */
  getPerformance: async (instructorId: string, period?: { startDate: string; endDate: string }): Promise<PerformanceMetric[]> => {
    const searchParams = new URLSearchParams();
    if (period?.startDate) searchParams.set('startDate', period.startDate);
    if (period?.endDate) searchParams.set('endDate', period.endDate);

    const response = await adminFetch(`/api/admin/instructors/${instructorId}/performance?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch performance');
    }
    return response.json();
  },

  /**
   * Get instructor violations
   */
  getViolations: async (instructorId: string): Promise<Violation[]> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/violations`);
    if (!response.ok) {
      throw new Error('Failed to fetch violations');
    }
    return response.json();
  },

  /**
   * Create violation
   */
  createViolation: async (instructorId: string, data: Partial<Violation>): Promise<Violation> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/violations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create violation');
    }
    return response.json();
  },

  /**
   * Resolve violation
   */
  resolveViolation: async (
    instructorId: string,
    violationId: string,
    data: { resolution: string; penalty?: Penalty }
  ): Promise<Violation> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/violations/${violationId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to resolve violation');
    }
    return response.json();
  },

  /**
   * Send notification to instructor
   */
  sendNotification: async (instructorId: string, data: { title: string; message: string; type: string }): Promise<void> => {
    const response = await adminFetch(`/api/admin/instructors/${instructorId}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
  },

  /**
   * Bulk send notification
   */
  bulkSendNotification: async (instructorIds: string[], data: { title: string; message: string; type: string }): Promise<void> => {
    const response = await adminFetch('/api/admin/instructors/bulk-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instructorIds, ...data }),
    });
    if (!response.ok) {
      throw new Error('Failed to send bulk notifications');
    }
  },

  /**
   * Export instructors to CSV
   */
  exportInstructors: async (filters?: { status?: string; search?: string }): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') searchParams.set('status', filters.status);
    if (filters?.search) searchParams.set('search', filters.search);

    const response = await adminFetch(`/api/admin/instructors/export?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to export instructors');
    }
    return response.blob();
  },

  /**
   * Get instructor statistics
   */
  getStatistics: async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    underReview: number;
    totalRevenue: number;
    totalStudents: number;
    averageRating: number;
  }> => {
    const response = await adminFetch('/api/admin/instructors/statistics');
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    return response.json();
  },
};