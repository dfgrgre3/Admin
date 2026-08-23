// Single source of truth: backend `common.CourseStatus` (UPPERCASE).
export type { CourseStatus } from '@/features/courses/types';
import type { CourseStatus } from '@/features/courses/types';

export interface CourseTag {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface CourseChangelogEntry {
  id: string;
  courseId: string;
  userId: string;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface CourseReviewComment {
  id: string;
  courseId: string;
  reviewerId: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface RelatedCourse {
  courseId: string;
  relatedCourseId: string;
  relationType: 'related' | 'prerequisite';
}

export interface Course {
  id: string;
  name: string;
  nameAr: string | null;
  code: string | null;
  description: string | null;
  price: number;
  level: string;
  instructorName: string | null;
  instructorId: string | null;
  categoryId: string | null;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  isActive: boolean;
  isPublished: boolean;
  isFeatured?: boolean;
  durationHours: number;
  requirements: string | null;
  learningObjectives: string | null;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  language?: string | null;
  coursePrerequisites?: string[] | null;
  targetAudience?: string[] | null;
  whatYouLearn?: string[] | null;

  // Lifecycle fields (Phase 1)
  status?: CourseStatus;
  maxStudents?: number | null;
  version?: string;
  isTrending?: boolean;
  isNew?: boolean;
  newUntil?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  hasCertificate?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  tags?: CourseTag[];

  _count: {
    enrollments: number;
    topics: number;
    reviews?: number;
    teachers?: number;
  };
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  coursesCount: number;
}

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: 'مسودة',
  UNDER_REVIEW: 'قيد المراجعة',
  PUBLISHED: 'منشور',
  ARCHIVED: 'مؤرشف',
  REJECTED: 'مرفوض',
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
  ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
};
