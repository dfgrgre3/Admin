import { apiClient } from './api-client';

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language: string;
  estimatedDurationMins: number;
  hasCertificate: boolean;
  certificateTemplate?: string;
  maxStudents?: number;
  version: number;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  prerequisitesText?: string;
  targetAudience?: string;
  learningOutcomes?: string[];
  primaryInstructorId: string;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
  pricings?: Pricing[];
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  availableFrom?: number;
  dripDelayDays?: number;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'AUDIO' | 'FILE' | 'EXTERNAL_LINK' | 'INTERACTIVE_QUIZ';
  content?: string | null;
  mediaUrl?: string | null;
  durationSeconds: number;
  isFreePreview: boolean;
  orderIndex: number;
  availabilityType: 'CALENDAR_DATE' | 'ENROLLMENT_RELATIVE';
  availableFrom?: string | null;
  dripDelayDays?: number | null;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  subtitles?: Subtitle[];
  quizzes?: InteractiveQuiz[];
}

export interface Subtitle {
  id: string;
  lessonId: string;
  language: string;
  vttUrl: string;
  createdAt: string;
}

export interface InteractiveQuiz {
  id: string;
  lessonId: string;
  timestampSec: number;
  question: string;
  options: string[];
  correctIndex: number;
  createdAt: string;
}

export interface Attachment {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
}

export interface Pricing {
  id: string;
  courseId: string;
  type: 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'BUNDLE' | 'ONE_TIME';
  amount: number;
  currencyCode: string;
  subscriptionDurationDays?: number | null;
  discountPrice?: number;
  discountStartAt?: number;
  discountEndAt?: number;
  subscriptionPlanId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  bundleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  title: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language: string;
  estimatedDurationMins?: number;
  hasCertificate?: boolean;
  certificateTemplate?: string;
  maxStudents?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  prerequisitesText?: string;
  targetAudience?: string;
  learningOutcomes?: string[];
  primaryInstructorId: string;
  categoryIds?: string[];
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  estimatedDurationMins?: number;
  hasCertificate?: boolean;
  certificateTemplate?: string;
  maxStudents?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  prerequisitesText?: string;
  targetAudience?: string;
  learningOutcomes?: string[];
  primaryInstructorId?: string;
  categoryIds?: string[];
}

export interface CourseListFilters {
  status?: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  categoryId?: string;
  instructorId?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

function prepareCoursePayload<T extends Record<string, any>>(data: T): Record<string, any> {
  const payload: Record<string, any> = { ...data };

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

export const courseApi = {
  // Course CRUD
  listCourses: async (filters?: CourseListFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.level) params.set('level', filters.level);
    if (filters?.language) params.set('language', filters.language);
    if (filters?.categoryId) params.set('categoryId', filters.categoryId);
    if (filters?.instructorId) params.set('instructorId', filters.instructorId);
    if (filters?.isFeatured !== undefined) params.set('isFeatured', String(filters.isFeatured));
    if (filters?.isTrending !== undefined) params.set('isTrending', String(filters.isTrending));
    if (filters?.isNew !== undefined) params.set('isNew', String(filters.isNew));
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    return apiClient.get<{ courses: Course[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
    `/api/admin/courses?${params.toString()}`
    );
  },

  getCourse: async (id: string) => {
    return apiClient.get<{ course: Course }>(`/api/admin/courses/${id}`);
  },

  createCourse: async (data: CreateCourseInput) => {
    return apiClient.post<{ course: Course }>('/api/admin/courses', prepareCoursePayload(data));
  },

  updateCourse: async (id: string, data: UpdateCourseInput) => {
    return apiClient.patch<{ course: Course }>(`/api/admin/courses/${id}`, prepareCoursePayload(data));
  },

  deleteCourse: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/admin/courses/${id}`);
  },

  // Course Workflow
  submitForReview: async (id: string) => {
    return apiClient.post<{ message: string; status: string }>(`/api/admin/courses/${id}/submit-review`, {});
  },

  approveCourse: async (id: string, reviewerId: string, notes?: string) => {
    return apiClient.post<{ message: string; status: string }>(`/api/admin/courses/${id}/approve`, {
      reviewerId,
      notes,
    });
  },

  rejectCourse: async (id: string, reviewerId: string, reason: string) => {
    return apiClient.post<{ message: string; status: string }>(`/api/admin/courses/${id}/reject`, {
      reviewerId,
      reason,
    });
  },

  archiveCourse: async (id: string) => {
    return apiClient.post<{ message: string; status: string }>(`/api/admin/courses/${id}/archive`, {});
  },

  unarchiveCourse: async (id: string) => {
    return apiClient.post<{ message: string; status: string }>(`/api/admin/courses/${id}/unarchive`, {});
  },

  // Section Management
  listSections: async (courseId: string) => {
    return apiClient.get<{ sections: Section[] }>(`/api/admin/courses/${courseId}/sections`);
  },

  createSection: async (courseId: string, data: { title: string; orderIndex?: number; availableFrom?: number; dripDelayDays?: number }) => {
    return apiClient.post<{ section: Section }>(`/api/admin/courses/${courseId}/sections`, data);
  },

  updateSection: async (courseId: string, sectionId: string, data: Partial<{ title: string; orderIndex: number; availableFrom: number; dripDelayDays: number }>) => {
    return apiClient.patch<{ section: Section }>(`/api/admin/courses/${courseId}/sections/${sectionId}`, data);
  },

  deleteSection: async (courseId: string, sectionId: string) => {
    return apiClient.delete<{ message: string }>(`/api/admin/courses/${courseId}/sections/${sectionId}`);
  },

  reorderSections: async (courseId: string, sectionIds: string[]) => {
    return apiClient.post<{ message: string }>(`/api/admin/courses/${courseId}/sections/reorder`, {
      sectionIds,
    });
  },

  // Lesson Management
  listLessons: async (courseId: string, sectionId: string) => {
    return apiClient.get<{ lessons: Lesson[] }>(`/api/admin/courses/${courseId}/sections/${sectionId}/lessons`);
  },

  createLesson: async (courseId: string, sectionId: string, data: {
    title: string;
    type: 'VIDEO' | 'TEXT' | 'AUDIO' | 'FILE' | 'EXTERNAL_LINK' | 'INTERACTIVE_QUIZ';
    content?: string;
    mediaUrl?: string;
    durationSeconds?: number;
    isFreePreview?: boolean;
    orderIndex?: number;
    availabilityType?: 'CALENDAR_DATE' | 'ENROLLMENT_RELATIVE';
    availableFrom?: number;
    dripDelayDays?: number;
  }) => {
    return apiClient.post<{ lesson: Lesson }>(`/api/admin/courses/${courseId}/sections/${sectionId}/lessons`, data);
  },

  updateLesson: async (courseId: string, sectionId: string, lessonId: string, data: Partial<{
    title: string;
    type: 'VIDEO' | 'TEXT' | 'AUDIO' | 'FILE' | 'EXTERNAL_LINK' | 'INTERACTIVE_QUIZ';
    content?: string;
    mediaUrl?: string;
    durationSeconds?: number;
    isFreePreview?: boolean;
    orderIndex?: number;
    availabilityType?: 'CALENDAR_DATE' | 'ENROLLMENT_RELATIVE';
    availableFrom?: number;
    dripDelayDays?: number;
  }>) => {
    return apiClient.patch<{ lesson: Lesson }>(`/api/admin/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, data);
  },

  deleteLesson: async (courseId: string, sectionId: string, lessonId: string) => {
    return apiClient.delete<{ message: string }>(`/api/admin/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
  },

  reorderLessons: async (courseId: string, sectionId: string, lessonIds: string[]) => {
    return apiClient.post<{ message: string }>(`/api/admin/courses/${courseId}/sections/${sectionId}/lessons/reorder`, {
      lessonIds,
    });
  },

  // Enrollment Management
  enrollUser: async (courseId: string, userId: string) => {
    return apiClient.post<{ enrollment: Enrollment }>(`/api/admin/courses/${courseId}/enrollments`, {
      courseId,
      userId,
    });
  },

  getEnrollment: async (courseId: string, userId: string) => {
    return apiClient.get<{ enrollment: Enrollment }>(`/api/admin/courses/${courseId}/enrollments/${userId}`);
  },

  updateProgress: async (courseId: string, userId: string, progress: number) => {
    return apiClient.patch<{ enrollment: Enrollment }>(`/api/admin/courses/${courseId}/enrollments/${userId}`, {
      progress,
    });
  },

  listEnrollments: async (courseId: string, filters?: { userId?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    return apiClient.get<{ enrollments: Enrollment[]; pagination: { page: number; limit: number; total: number } }>(
    `/api/admin/courses/${courseId}/enrollments?${params.toString()}`
    );
  },

  // Pricing Management
  getPricing: async (courseId: string) => {
    return apiClient.get<{ pricing: Pricing }>(`/api/admin/courses/${courseId}/pricing`);
  },

  setPricing: async (courseId: string, data: {
    type: 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'BUNDLE';
    amount: number;
    currencyCode: string;
    subscriptionDurationDays?: number;
    discountPrice?: number;
    discountStartAt?: number;
    discountEndAt?: number;
    subscriptionPlanId?: string;
  }) => {
    return apiClient.post<{ pricing: Pricing }>(`/api/admin/courses/${courseId}/pricing`, data);
  },
};
