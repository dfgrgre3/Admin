"use client";

import { z } from "zod";

// ─── Backend Model Types (matching LMS models) ────────────────────────────────

export type CourseStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED" | "REJECTED";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type LessonType = "VIDEO" | "TEXT" | "AUDIO" | "FILE" | "EXTERNAL_LINK" | "INTERACTIVE_QUIZ";
export type PriceType = "FREE" | "SUBSCRIPTION" | "BUNDLE" | "ONE_TIME";

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface CourseLevelOption {
  value: CourseLevel;
  label: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar?: string | null;
  email: string;
  specialization?: string | null;
  status: string;
}

export interface TeacherAssignment {
  id: string;
  courseId: string;
  instructorId: string;
  role: string;
  permissions?: Record<string, unknown>;
  instructor?: Teacher;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  availableFrom?: string | null;
  dripDelayDays?: number | null;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  content?: string | null;
  mediaUrl?: string | null;
  durationSeconds: number;
  isFreePreview: boolean;
  orderIndex: number;
  availabilityType: 'CALENDAR_DATE' | 'ENROLLMENT_RELATIVE';
  availableFrom?: string | null;
  dripDelayDays?: number | null;
  attachments?: Attachment[];
  subtitles?: Subtitle[];
  quizzes?: InteractiveQuiz[];
  createdAt: string;
  updatedAt: string;
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

export interface Exam {
  id: string;
  title: string;
  type: string;
  questionsCount: number;
  duration: number;
  isPublished: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxScore: number;
  courseId?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  templateHtml: string;
  isDefault: boolean;
}

export interface Pricing {
  id: string;
  courseId: string;
  type: PriceType;
  amount: number;
  currencyCode: string;
  subscriptionDurationDays?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SEOData {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  canonicalUrl?: string | null;
}

export interface CourseDraft {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  coverImageUrl?: string | null;
  promoVideoUrl?: string | null;
  status: CourseStatus;
  level: CourseLevel;
  language: string;
  estimatedDurationMins: number;
  hasCertificate: boolean;
  certificateTemplate?: string | null;
  maxStudents?: number | null;
  version: number;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  newFrom?: string | null;
  newUntil?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  prerequisitesText?: string | null;
  targetAudience?: string | null;
  learningOutcomes: string[];
  primaryInstructorId: string;
  availableFrom?: string | null;
  availableUntil?: string | null;
  categoryIds: string[];
  sections: Chapter[];
  pricings: Pricing[];
  instructors: TeacherAssignment[];
  updatedAt: string;
}

// ─── Form Validation Schemas ────────────────────────────────────────────────

export const basicInfoSchema = z.object({
  title: z.string().min(1, "عنوان الكورس مطلوب"),
  slug: z.string().min(1, "الرابط المختصر مطلوب").regex(/^[a-z0-9-]+$/, "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).min(1, "يجب اختيار تصنيف واحد على الأقل"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language: z.string().min(1, "اللغة مطلوبة"),
  estimatedDurationMins: z.coerce.number().min(0, "المدة يجب أن تكون صفر أو أكثر"),
  difficulty: z.string().optional(), // legacy field
  coverImageUrl: z.string().url("رابط غير صالح للصورة").optional().or(z.literal("")),
  promoVideoUrl: z.string().url("رابط غير صالح للفيديو").optional().or(z.literal("")),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

export const teacherSchema = z.object({
  instructorId: z.string().min(1, "يجب اختيار مدرس"),
  role: z.string().default("instructor"),
});

export const chapterSchema = z.object({
  title: z.string().min(1, "عنوان الفصل مطلوب"),
  orderIndex: z.coerce.number().min(0),
  availableFrom: z.string().optional().nullable(),
  dripDelayDays: z.coerce.number().min(0).optional().nullable(),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "عنوان الدرس مطلوب"),
  type: z.enum(["VIDEO", "TEXT", "AUDIO", "FILE", "EXTERNAL_LINK", "INTERACTIVE_QUIZ"]),
  content: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  durationSeconds: z.coerce.number().min(0),
  isFreePreview: z.boolean(),
  orderIndex: z.coerce.number().min(0),
  availabilityType: z.enum(["CALENDAR_DATE", "ENROLLMENT_RELATIVE"]),
  availableFrom: z.string().optional().nullable(),
  dripDelayDays: z.coerce.number().min(0).optional().nullable(),
});

export type LessonFormData = z.infer<typeof lessonSchema>;


export const videoSchema = z.object({
  lessonId: z.string().min(1, "يجب اختيار درس"),
  videoUrl: z.string().url("رابط فيديو غير صالح").optional().or(z.literal("")),
  fileName: z.string().optional(),
  duration: z.coerce.number().min(0).optional(),
  resolution: z.string().optional(),
  encodingStatus: z.string().optional(),
  uploadStatus: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).default("PRIVATE"),
});

export const fileSchema = z.object({
  lessonId: z.string().min(1, "يجب اختيار درس"),
  title: z.string().min(1, "عنوان الملف مطلوب"),
  fileUrl: z.string().url("رابط ملف غير صالح"),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export const examSchema = z.object({
  examId: z.string().min(1, "يجب اختيار اختبار"),
  lessonId: z.string().optional(),
});

export const assignmentSchema = z.object({
  assignmentId: z.string().min(1, "يجب اختيار واجب"),
  lessonId: z.string().optional(),
});

export const pricingSchema = z.object({
  type: z.enum(["FREE", "PAID", "SUBSCRIPTION", "BUNDLE", "ONE_TIME"]),
  amount: z.coerce.number().min(0),
  currencyCode: z.string().default("EGP"),
  subscriptionDurationDays: z.coerce.number().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const seoSchema = z.object({
  seoTitle: z.string().max(60, "عنوان SEO يجب أن يكون 60 حرف كحد أقصى").optional().nullable(),
  seoDescription: z.string().max(160, "وصف SEO يجب أن يكون 160 حرف كحد أقصى").optional().nullable(),
  seoKeywords: z.array(z.string()),
  canonicalUrl: z.string().url("رابط Canonical غير صالح").optional().nullable(),
});

export type SEOFormData = z.infer<typeof seoSchema>;

export const certificateSchema = z.object({
  templateId: z.string().min(1, "يجب اختيار قالب شهادة"),
  hasCertificate: z.boolean().default(false),
});

// ─── Wizard Step Types ──────────────────────────────────────────────────────

export type BuilderStep = 
  | "basic-info"
  | "teachers"
  | "chapters"
  | "lessons"
  | "videos"
  | "files"
  | "exams"
  | "assignments"
  | "pricing"
  | "certificates"
  | "seo"
  | "preview"
  | "publish";

export interface BuilderStepConfig {
  id: BuilderStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  isOptional?: boolean;
  requiredPermissions?: string[];
}

export const BUILDER_STEPS: BuilderStepConfig[] = [
  {
    id: "basic-info",
    title: "المعلومات الأساسية",
    description: "العنوان، الوصف، التصنيف، المستوى، اللغة، الصور",
    icon: null, // Will be set in component
  },
  {
    id: "teachers",
    title: "المعلمين",
    description: "تعيين وحذف المعلمين للكورس",
    icon: null,
  },
  {
    id: "chapters",
    title: "الفصول",
    description: "إنشاء وتعديل وحذف وترتيب الفصول",
    icon: null,
  },
  {
    id: "lessons",
    title: "الدروس",
    description: "إدارة الدروس داخل كل فصل",
    icon: null,
  },
  {
    id: "videos",
    title: "الفيديوهات",
    description: "رفع واستبدال وحذف فيديوهات الدروس",
    icon: null,
  },
  {
    id: "files",
    title: "الملفات والمرفقات",
    description: "رفع وتحميل وحذف الملفات المرفقة بالدروس",
    icon: null,
  },
  {
    id: "exams",
    title: "الاختبارات",
    description: "ربط وفك ربط الاختبارات بالدروس",
    icon: null,
  },
  {
    id: "assignments",
    title: "الواجبات",
    description: "ربط وفك ربط الواجبات بالدروس",
    icon: null,
  },
  {
    id: "pricing",
    title: "التسعير",
    description: "نوع التسعير، العملة، السعر، الخصم، الاشتراكات",
    icon: null,
  },
  {
    id: "certificates",
    title: "الشهادات",
    description: "تعيين قوالب الشهادات للكورس",
    icon: null,
  },
  {
    id: "seo",
    title: "محركات البحث (SEO)",
    description: "عنوان الصفحة، الوصف، الكلمات المفتاحية، الرابط الكنوني",
    icon: null,
  },
  {
    id: "preview",
    title: "معاينة الكورس",
    description: "عرض الكورس كما سيظهر للطالب",
    icon: null,
  },
  {
    id: "publish",
    title: "النشر",
    description: "قائمة التحقق والنشر النهائي",
    icon: null,
  },
];

// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Validation Error Types ─────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
}