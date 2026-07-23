/**
 * React Query Hooks for Instructor Management
 * Provides hooks for fetching and managing instructor data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  instructorsApi,
  Instructor,
  Document,
  Contract,
  Payout,
  PerformanceMetric,
  Violation,
  InstructorStatus,
  DocumentStatus,
  Penalty,
} from '@/lib/api/instructors-api';

// Query Keys
export const instructorKeys = {
  all: ['instructors'] as const,
  lists: () => [...instructorKeys.all, 'list'] as const,
  list: (filters: { page: number; limit: number; search: string; status: string }) =>
    [...instructorKeys.lists(), filters] as const,
  details: () => [...instructorKeys.all, 'detail'] as const,
  detail: (id: string) => [...instructorKeys.details(), id] as const,
  documents: (id: string) => [...instructorKeys.detail(id), 'documents'] as const,
  contracts: (id: string) => [...instructorKeys.detail(id), 'contracts'] as const,
  payouts: (id: string) => [...instructorKeys.detail(id), 'payouts'] as const,
  performance: (id: string) => [...instructorKeys.detail(id), 'performance'] as const,
  violations: (id: string) => [...instructorKeys.detail(id), 'violations'] as const,
  statistics: () => [...instructorKeys.all, 'statistics'] as const,
};

// ==================== Main Instructor Hooks ====================

/**
 * Hook to fetch all instructors with filters
 */
export function useInstructors(params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: instructorKeys.list(params),
    queryFn: () => instructorsApi.getInstructors(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch a single instructor by ID
 */
export function useInstructor(id: string) {
  return useQuery({
    queryKey: instructorKeys.detail(id),
    queryFn: () => instructorsApi.getInstructor(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch instructor statistics
 */
export function useInstructorStatistics() {
  return useQuery({
    queryKey: instructorKeys.statistics(),
    queryFn: () => instructorsApi.getStatistics(),
    refetchInterval: 60000, // Refetch every minute
  });
}

// ==================== Document Hooks ====================

/**
 * Hook to fetch instructor documents
 */
export function useInstructorDocuments(instructorId: string) {
  return useQuery({
    queryKey: instructorKeys.documents(instructorId),
    queryFn: () => instructorsApi.getDocuments(instructorId),
    enabled: !!instructorId,
  });
}

/**
 * Hook to review a document
 */
export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      instructorId,
      documentId,
      data,
    }: {
      instructorId: string;
      documentId: string;
      data: { status: DocumentStatus; reviewNotes?: string };
    }) => instructorsApi.reviewDocument(instructorId, documentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.documents(variables.instructorId) });
      toast.success('تم تحديث حالة المستند بنجاح');
    },
    onError: () => {
      toast.error('فشل في تحديث حالة المستند');
    },
  });
}

// ==================== Contract Hooks ====================

/**
 * Hook to fetch instructor contracts
 */
export function useInstructorContracts(instructorId: string) {
  return useQuery({
    queryKey: instructorKeys.contracts(instructorId),
    queryFn: () => instructorsApi.getContracts(instructorId),
    enabled: !!instructorId,
  });
}

/**
 * Hook to create a new contract
 */
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instructorId, data }: { instructorId: string; data: Partial<Contract> }) =>
      instructorsApi.createContract(instructorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.contracts(variables.instructorId) });
      toast.success('تم إنشاء العقد بنجاح');
    },
    onError: () => {
      toast.error('فشل في إنشاء العقد');
    },
  });
}

// ==================== Payout Hooks ====================

/**
 * Hook to fetch instructor payouts
 */
export function useInstructorPayouts(instructorId: string, params?: { page: number; limit: number }) {
  return useQuery({
    queryKey: [...instructorKeys.payouts(instructorId), params],
    queryFn: () => instructorsApi.getPayouts(instructorId, params),
    enabled: !!instructorId,
  });
}

// ==================== Performance Hooks ====================

/**
 * Hook to fetch instructor performance metrics
 */
export function useInstructorPerformance(
  instructorId: string,
  period?: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: [...instructorKeys.performance(instructorId), period],
    queryFn: () => instructorsApi.getPerformance(instructorId, period),
    enabled: !!instructorId,
  });
}

// ==================== Violation Hooks ====================

/**
 * Hook to fetch instructor violations
 */
export function useInstructorViolations(instructorId: string) {
  return useQuery({
    queryKey: instructorKeys.violations(instructorId),
    queryFn: () => instructorsApi.getViolations(instructorId),
    enabled: !!instructorId,
  });
}

/**
 * Hook to create a new violation
 */
export function useCreateViolation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instructorId, data }: { instructorId: string; data: Partial<Violation> }) =>
      instructorsApi.createViolation(instructorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.violations(variables.instructorId) });
      toast.success('تم إنشاء المخالفة بنجاح');
    },
    onError: () => {
      toast.error('فشل في إنشاء المخالفة');
    },
  });
}

/**
 * Hook to resolve a violation
 */
export function useResolveViolation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      instructorId,
      violationId,
      data,
    }: {
      instructorId: string;
      violationId: string;
      data: { resolution: string; penalty?: Penalty };
    }) => instructorsApi.resolveViolation(instructorId, violationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.violations(variables.instructorId) });
      toast.success('تم حل المخالفة بنجاح');
    },
    onError: () => {
      toast.error('فشل في حل المخالفة');
    },
  });
}

// ==================== Instructor Actions Hooks ====================

/**
 * Hook to create a new instructor
 */
export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Instructor>) => instructorsApi.createInstructor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.statistics() });
      toast.success('تم إنشاء المدرّس بنجاح');
    },
    onError: () => {
      toast.error('فشل في إنشاء المدرّس');
    },
  });
}

/**
 * Hook to update an instructor
 */
export function useUpdateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Instructor> }) =>
      instructorsApi.updateInstructor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      toast.success('تم تحديث بيانات المدرّس بنجاح');
    },
    onError: () => {
      toast.error('فشل في تحديث بيانات المدرّس');
    },
  });
}

/**
 * Hook to delete an instructor
 */
export function useDeleteInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => instructorsApi.deleteInstructor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.statistics() });
      toast.success('تم حذف المدرّس بنجاح');
    },
    onError: () => {
      toast.error('فشل في حذف المدرّس');
    },
  });
}

/**
 * Hook to bulk delete instructors
 */
export function useBulkDeleteInstructors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => instructorsApi.bulkDeleteInstructors(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.statistics() });
      toast.success('تم حذف المدرّسين بنجاح');
    },
    onError: () => {
      toast.error('فشل في حذف المدرّسين');
    },
  });
}

/**
 * Hook to approve an instructor
 */
export function useApproveInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => instructorsApi.approveInstructor(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.statistics() });
      toast.success('تم اعتماد المدرّس بنجاح');
    },
    onError: () => {
      toast.error('فشل في اعتماد المدرّس');
    },
  });
}

/**
 * Hook to reject an instructor
 */
export function useRejectInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      instructorsApi.rejectInstructor(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.statistics() });
      toast.success('تم رفض المدرّس');
    },
    onError: () => {
      toast.error('فشل في رفض المدرّس');
    },
  });
}

/**
 * Hook to suspend an instructor
 */
export function useSuspendInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, duration }: { id: string; reason: string; duration?: number }) =>
      instructorsApi.suspendInstructor(id, reason, duration),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.statistics() });
      toast.success('تم إيقاف المدرّس بنجاح');
    },
    onError: () => {
      toast.error('فشل في إيقاف المدرّس');
    },
  });
}

// ==================== Notification Hooks ====================

/**
 * Hook to send notification to a single instructor
 */
export function useSendNotification() {
  return useMutation({
    mutationFn: ({ instructorId, data }: { instructorId: string; data: { title: string; message: string; type: string } }) =>
      instructorsApi.sendNotification(instructorId, data),
    onSuccess: () => {
      toast.success('تم إرسال الإشعار بنجاح');
    },
    onError: () => {
      toast.error('فشل في إرسال الإشعار');
    },
  });
}

/**
 * Hook to send bulk notifications
 */
export function useBulkSendNotification() {
  return useMutation({
    mutationFn: ({ instructorIds, data }: { instructorIds: string[]; data: { title: string; message: string; type: string } }) =>
      instructorsApi.bulkSendNotification(instructorIds, data),
    onSuccess: (_, variables) => {
      toast.success(`تم إرسال الإشعار لـ ${variables.instructorIds.length} مدرّس`);
    },
    onError: () => {
      toast.error('فشل في إرسال الإشعارات');
    },
  });
}

// ==================== Export Hooks ====================

/**
 * Hook to export instructors to CSV
 */
export function useExportInstructors() {
  return useMutation({
    mutationFn: (filters?: { status?: string; search?: string }) =>
      instructorsApi.exportInstructors(filters),
    onSuccess: (blob, filters) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructors-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('تم تصدير البيانات بنجاح');
    },
    onError: () => {
      toast.error('فشل في تصدير البيانات');
    },
  });
}