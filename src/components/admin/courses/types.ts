"use client";

// ─── Shared Course Types ──────────────────────────────────────────────────────
// Central type definitions used across all admin/courses components

export interface CourseBase {
  id: string;
  name: string;
  nameAr: string | null;
  code: string | null;
  description: string | null;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
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
  createdAt?: string | null;
  updatedAt?: string | null;
  status?: "draft" | "pending_review" | "published" | "archived" | string;
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
  slug?: string;
  icon?: string | null;
  description?: string | null;
  coursesCount?: number;
}

// ─── Level Configuration ──────────────────────────────────────────────────────

export interface LevelConfigEntry {
  label: string;
  color: string;
  num: string;
}

export const levelConfig: Record<string, LevelConfigEntry> = {
  BEGINNER: {
    label: "مبتدئ",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    num: "1",
  },
  INTERMEDIATE: {
    label: "متوسط",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    num: "2",
  },
  ADVANCED: {
    label: "متقدم",
    color: "text-violet-400 bg-violet-500/10 border-violet-500/25",
    num: "3",
  },
};

export const FALLBACK_LEVEL: LevelConfigEntry = {
  label: "غير محدد",
  color: "text-slate-400 bg-slate-500/10 border-slate-500/25",
  num: "-",
};

// ─── Action Callbacks ─────────────────────────────────────────────────────────

export interface CourseActionCallbacks {
  onEdit?: (course: CourseBase) => void;
  onDuplicate?: (course: CourseBase) => void;
  onDelete?: (course: CourseBase) => void;
  onToggleStatus?: (course: CourseBase) => void;
  onToggleActive?: (course: CourseBase) => void;
  onViewCurriculum?: (course: CourseBase) => void;
  onViewAnalytics?: (course: CourseBase) => void;
}
