import { apiClient } from '@/lib/api/api-client';
import type {
  CoursesListResponse,
  CourseFilters,
  CourseListItem,
  CourseMetaResponse,
  CourseDetails,
  CourseFormValues,
  CheckSlugResponse,
  CourseCurriculum,
  Module,
  Lesson,
  AssetUploadRequest,
  AssetUploadResponse,
  BulkActionPayload,
  BulkActionResponse,
} from '../types';

/** الاستجابة الأولية من GET /api/admin/courses قبل تسويتها في CoursesListResponse */
type RawCoursePagination = {
  page?: number | string | null;
  currentPage?: number | string | null;
  per_page?: number | string | null;
  limit?: number | string | null;
  perPage?: number | string | null;
  total?: number | string | null;
  total_pages?: number | string | null;
  totalPages?: number | string | null;
  has_next?: boolean | null;
  has_prev?: boolean | null;
};

type RawCourseListResponse = {
  items?: CourseListItem[];
  courses?: CourseListItem[];
  data?: {
    courses?: CourseListItem[];
    items?: CourseListItem[];
    pagination?: RawCoursePagination;
  };
  pagination?: RawCoursePagination;
  filters_used?: CourseFilters;
};

function prepareCoursePayload<T extends object>(data: T): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...data };

  let targetAudienceStr: string | undefined = undefined;
  if (Array.isArray(payload.target_audience)) {
    targetAudienceStr = payload.target_audience.filter(Boolean).join('\n');
  } else if (typeof payload.target_audience === 'string') {
    targetAudienceStr = payload.target_audience;
  } else if (Array.isArray(payload.targetAudience)) {
    targetAudienceStr = payload.targetAudience.filter(Boolean).join('\n');
  } else if (typeof payload.targetAudience === 'string') {
    targetAudienceStr = payload.targetAudience;
  }

  if (targetAudienceStr !== undefined) {
    payload.targetAudience = targetAudienceStr;
    payload.target_audience = targetAudienceStr;
  }

  let prereqStr: string | undefined = undefined;
  if (Array.isArray(payload.prerequisites_text)) {
    prereqStr = payload.prerequisites_text.filter(Boolean).join('\n');
  } else if (typeof payload.prerequisites_text === 'string') {
    prereqStr = payload.prerequisites_text;
  } else if (Array.isArray(payload.prerequisitesText)) {
    prereqStr = payload.prerequisitesText.filter(Boolean).join('\n');
  } else if (typeof payload.prerequisitesText === 'string') {
    prereqStr = payload.prerequisitesText;
  }

  if (prereqStr !== undefined) {
    payload.prerequisitesText = prereqStr;
    payload.prerequisites_text = prereqStr;
  }

  return payload;
}

export const courseService = {
  /** GET /api/admin/courses */
  async getCourses(filters: CourseFilters = {}): Promise<CoursesListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL') {
        if (Array.isArray(val)) {
          val.forEach((item) => params.append(key, String(item)));
        } else {
          params.append(key, String(val));
        }
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/admin/courses${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<RawCourseListResponse>(endpoint);

    const rawItems =
      res?.items || res?.courses || res?.data?.courses || res?.data?.items || ([] as CourseListItem[]);
    const rawPagination = res?.pagination || res?.data?.pagination || {};

    const page = Number(rawPagination.page || rawPagination.currentPage || filters.page || 1);
    const perPage = Number(rawPagination.per_page || rawPagination.limit || rawPagination.perPage || filters.per_page || 12);
    const total = Number(rawPagination.total ?? rawItems.length);
    const totalPages = Number(rawPagination.total_pages || rawPagination.totalPages || Math.ceil(total / perPage) || 1);

    return {
      items: rawItems,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
        has_next: rawPagination.has_next ?? (page < totalPages),
        has_prev: rawPagination.has_prev ?? (page > 1),
      },
      filters_used: res?.filters_used || {},
    };
  },

  /** GET /api/admin/courses/meta */
  async getCourseMeta(): Promise<CourseMetaResponse> {
    return apiClient.get<CourseMetaResponse>('/api/admin/courses/meta');
  },

  /** GET /api/admin/courses/{courseId} */
  async getCourseById(courseId: string): Promise<CourseDetails> {
    return apiClient.get<CourseDetails>(`/api/admin/courses/${courseId}`);
  },

  /** POST /api/admin/courses */
  async createCourse(data: CourseFormValues): Promise<CourseDetails & { course_id?: string; redirect_to?: string }> {
    return apiClient.post('/api/admin/courses', prepareCoursePayload(data));
  },

  /** PATCH /api/admin/courses/{courseId} */
  async updateCourse(courseId: string, data: Partial<CourseFormValues>): Promise<CourseDetails> {
    return apiClient.patch(`/api/admin/courses/${courseId}`, prepareCoursePayload(data));
  },

  /** DELETE /api/admin/courses/{courseId} */
  async deleteCourse(courseId: string): Promise<{ success: boolean; affected_data_status?: string }> {
    return apiClient.delete(`/api/admin/courses/${courseId}`);
  },

  /** POST /api/admin/courses/{courseId}/publish */
  async publishCourse(courseId: string): Promise<CourseDetails> {
    return apiClient.post(`/api/admin/courses/${courseId}/publish`, {});
  },

  /** POST /api/admin/courses/{courseId}/unpublish */
  async unpublishCourse(courseId: string): Promise<CourseDetails> {
    return apiClient.post(`/api/admin/courses/${courseId}/unpublish`, {});
  },

  /** POST /api/admin/courses/{courseId}/archive */
  async archiveCourse(courseId: string): Promise<CourseDetails> {
    return apiClient.post(`/api/admin/courses/${courseId}/archive`, {});
  },

  /**
   * POST /api/admin/courses/{courseId}/unarchive
   * يُرجع الكورس المؤرشف إلى حالة DRAFT. الباكند لا يوفّر مسار /restore للكورسات؛
   * المسار الصحيح (المُسجّل في hexagonal_routes.go) هو /unarchive.
   */
  async restoreCourse(courseId: string): Promise<CourseDetails> {
    return apiClient.post(`/api/admin/courses/${courseId}/unarchive`, {});
  },

  /** POST /api/admin/courses/{courseId}/duplicate */
  async duplicateCourse(courseId: string): Promise<CourseDetails> {
    return apiClient.post(`/api/admin/courses/${courseId}/duplicate`, {});
  },

  /** POST /api/admin/courses/bulk */
  async bulkCoursesAction(payload: BulkActionPayload): Promise<BulkActionResponse> {
    return apiClient.post('/api/admin/courses/bulk', payload);
  },

  /** GET /api/admin/courses/check-slug */
  async checkSlug(slug: string, excludeCourseId?: string): Promise<CheckSlugResponse> {
    const params = new URLSearchParams({ slug });
    if (excludeCourseId) params.append('exclude_course_id', excludeCourseId);
    return apiClient.get<CheckSlugResponse>(`/api/admin/courses/check-slug?${params.toString()}`);
  },

  /** GET /api/admin/courses/{courseId}/curriculum */
  async getCourseCurriculum(courseId: string): Promise<CourseCurriculum> {
    return apiClient.get<CourseCurriculum>(`/api/admin/courses/${courseId}/curriculum`);
  },

  /** POST /api/admin/courses/{courseId}/modules */
  async createModule(courseId: string, data: Partial<Module>): Promise<Module> {
    return apiClient.post(`/api/admin/courses/${courseId}/modules`, data);
  },

  /** PATCH /api/admin/courses/{courseId}/modules/{moduleId} */
  async updateModule(courseId: string, moduleId: string, data: Partial<Module>): Promise<Module> {
    return apiClient.patch(`/api/admin/courses/${courseId}/modules/${moduleId}`, data);
  },

  /** DELETE /api/admin/courses/{courseId}/modules/{moduleId} */
  async deleteModule(courseId: string, moduleId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/api/admin/courses/${courseId}/modules/${moduleId}`);
  },

  /** POST /api/admin/courses/{courseId}/modules/reorder */
  async reorderModules(courseId: string, moduleIds: string[]): Promise<CourseCurriculum> {
    return apiClient.post(`/api/admin/courses/${courseId}/modules/reorder`, { module_ids: moduleIds });
  },

  /** POST /api/admin/courses/{courseId}/modules/{moduleId}/lessons */
  async createLesson(courseId: string, moduleId: string, data: Partial<Lesson>): Promise<Lesson> {
    return apiClient.post(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons`, data);
  },

  /** PATCH /api/admin/courses/{courseId}/lessons/{lessonId} */
  async updateLesson(courseId: string, lessonId: string, data: Partial<Lesson>): Promise<Lesson> {
    return apiClient.patch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, data);
  },

  /** DELETE /api/admin/courses/{courseId}/lessons/{lessonId} */
  async deleteLesson(courseId: string, lessonId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/api/admin/courses/${courseId}/lessons/${lessonId}`);
  },

  /** POST /api/admin/courses/{courseId}/modules/{moduleId}/lessons/reorder */
  async reorderLessons(courseId: string, moduleId: string, lessonIds: string[]): Promise<{ success: boolean }> {
    return apiClient.post(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/reorder`, { lesson_ids: lessonIds });
  },

  /** POST /api/admin/uploads/presign */
  async requestUpload(payload: AssetUploadRequest): Promise<AssetUploadResponse> {
    return apiClient.post('/api/admin/uploads/presign', payload);
  },

  /** POST /api/admin/uploads/confirm */
  async confirmUpload(uploadId: string, relatedEntityType?: string, relatedEntityId?: string): Promise<{ asset_id: string; url: string; status: string }> {
    return apiClient.post('/api/admin/uploads/confirm', {
      upload_id: uploadId,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
    });
  },

  /** POST /api/admin/courses/export */
  async exportCourses(filters: CourseFilters): Promise<{ job_id: string }> {
    return apiClient.post('/api/admin/courses/export', { filters });
  },

  /** GET /api/admin/jobs/{jobId} */
  async getExportJob(jobId: string): Promise<{ status: string; progress: number; download_url?: string; expires_at?: string }> {
    return apiClient.get(`/api/admin/jobs/${jobId}`);
  },
};
