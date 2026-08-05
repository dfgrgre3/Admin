import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/course-service';
import type { CourseFilters, CourseFormValues, BulkActionPayload, Module, Lesson } from '../types';
import { toast } from 'sonner';

export const COURSE_QUERY_KEYS = {
  list: (filters: CourseFilters) => ['admin', 'courses', 'list', filters] as const,
  meta: () => ['admin', 'courses', 'meta'] as const,
  details: (id: string) => ['admin', 'courses', 'details', id] as const,
  curriculum: (id: string) => ['admin', 'courses', 'curriculum', id] as const,
  slugCheck: (slug: string, excludeId?: string) => ['admin', 'courses', 'slug', slug, excludeId] as const,
};

/** TanStack Query hook for fetching courses list */
export function useCoursesList(filters: CourseFilters) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(filters),
    queryFn: () => courseService.getCourses(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/** TanStack Query hook for fetching dynamic filters meta */
export function useCourseMeta() {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.meta(),
    queryFn: () => courseService.getCourseMeta(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/** TanStack Query hook for fetching single course details */
export function useCourseDetails(courseId: string | null) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.details(courseId || ''),
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 15,
  });
}

/** TanStack Query hook for async slug availability check */
export function useCheckSlug(slug: string, excludeCourseId?: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.slugCheck(slug, excludeCourseId),
    queryFn: () => courseService.checkSlug(slug, excludeCourseId),
    enabled: slug.trim().length >= 3,
    staleTime: 1000 * 10,
  });
}

/** Course mutations hook */
export function useCourseMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CourseFormValues) => courseService.createCourse(data),
    onSuccess: (res) => {
      toast.success('تم إنشاء الدورة بنجاح');
      invalidateLists();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل إنشاء الدورة');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseFormValues> }) =>
      courseService.updateCourse(id, data),
    onSuccess: (res, variables) => {
      toast.success('تم تحديث بيانات الدورة بنجاح');
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.details(variables.id) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل تحديث الدورة');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      toast.success('تم حذف الدورة بنجاح');
      invalidateLists();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل حذف الدورة');
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => courseService.publishCourse(id),
    onSuccess: (res, id) => {
      toast.success('تم نشر الدورة بنجاح');
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.details(id) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل نشر الدورة');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => courseService.unpublishCourse(id),
    onSuccess: (res, id) => {
      toast.success('تم إلغاء نشر الدورة');
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.details(id) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل إلغاء نشر الدورة');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => courseService.archiveCourse(id),
    onSuccess: (res, id) => {
      toast.success('تم أرشفة الدورة');
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.details(id) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل أرشفة الدورة');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => courseService.restoreCourse(id),
    onSuccess: (res, id) => {
      toast.success('تم استعادة الدورة');
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.details(id) });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل استعادة الدورة');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => courseService.duplicateCourse(id),
    onSuccess: () => {
      toast.success('تم تكرار الدورة بنجاح');
      invalidateLists();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل تكرار الدورة');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (payload: BulkActionPayload) => courseService.bulkCoursesAction(payload),
    onSuccess: (res) => {
      if (res.failed_count > 0) {
        toast.warning(`تم تنفيذ الإجراء بنجاح جزئي (${res.succeeded_count} نجح، ${res.failed_count} فشل)`);
      } else {
        toast.success(`تم تنفيذ الإجراء الجماعي بنجاح على ${res.succeeded_count} عنصر`);
      }
      invalidateLists();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'فشل تنفيذ الإجراء الجماعي');
    },
  });

  return {
    createCourse: createMutation,
    updateCourse: updateMutation,
    deleteCourse: deleteMutation,
    publishCourse: publishMutation,
    unpublishCourse: unpublishMutation,
    archiveCourse: archiveMutation,
    restoreCourse: restoreMutation,
    duplicateCourse: duplicateMutation,
    bulkAction: bulkActionMutation,
  };
}

/** Curriculum TanStack Query hooks */
export function useCurriculum(courseId: string | null) {
  const queryClient = useQueryClient();

  const curriculumQuery = useQuery({
    queryKey: COURSE_QUERY_KEYS.curriculum(courseId || ''),
    queryFn: () => courseService.getCourseCurriculum(courseId!),
    enabled: !!courseId,
  });

  const invalidateCurriculum = () => {
    if (courseId) {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.curriculum(courseId) });
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.details(courseId) });
    }
  };

  const createModule = useMutation({
    mutationFn: (data: Partial<Module>) => courseService.createModule(courseId!, data),
    onSuccess: () => {
      toast.success('تمت إضافة الوحدة بنجاح');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل إضافة الوحدة'),
  });

  const updateModule = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Partial<Module> }) =>
      courseService.updateModule(courseId!, moduleId, data),
    onSuccess: () => {
      toast.success('تم تعديل الوحدة');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل تعديل الوحدة'),
  });

  const deleteModule = useMutation({
    mutationFn: (moduleId: string) => courseService.deleteModule(courseId!, moduleId),
    onSuccess: () => {
      toast.success('تم حذف الوحدة');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل حذف الوحدة'),
  });

  const reorderModules = useMutation({
    mutationFn: (moduleIds: string[]) => courseService.reorderModules(courseId!, moduleIds),
    onSuccess: () => {
      toast.success('تم إعادة ترتيب الوحدات');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل ترتيب الوحدات'),
  });

  const createLesson = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Partial<Lesson> }) =>
      courseService.createLesson(courseId!, moduleId, data),
    onSuccess: () => {
      toast.success('تمت إضافة الدرس');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل إضافة الدرس'),
  });

  const updateLesson = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: Partial<Lesson> }) =>
      courseService.updateLesson(courseId!, lessonId, data),
    onSuccess: () => {
      toast.success('تم تعديل الدرس');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل تعديل الدرس'),
  });

  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) => courseService.deleteLesson(courseId!, lessonId),
    onSuccess: () => {
      toast.success('تم حذف الدرس');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل حذف الدرس'),
  });

  const reorderLessons = useMutation({
    mutationFn: ({ moduleId, lessonIds }: { moduleId: string; lessonIds: string[] }) =>
      courseService.reorderLessons(courseId!, moduleId, lessonIds),
    onSuccess: () => {
      toast.success('تم إعادة ترتيب الدروس');
      invalidateCurriculum();
    },
    onError: (err: any) => toast.error(err?.message || 'فشل ترتيب الدروس'),
  });

  return {
    curriculumQuery,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
  };
}
