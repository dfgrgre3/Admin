export type CourseStatus = 'draft' | 'pending_review' | 'published' | 'archived';

export interface CourseTag {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface CourseChangelogEntry {
  id: string;
  subjectId: string;
  userId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  action: string;
  createdAt: string;
}

export interface CourseReviewComment {
  id: string;
  subjectId: string;
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
  draft: 'مسودة',
  pending_review: 'قيد المراجعة',
  published: 'منشور',
  archived: 'مؤرشف',
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
  published: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-red-100 text-red-700 border-red-200',
};
