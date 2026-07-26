"use client";

import { UserRole } from "@/types/enums";
import type { UserStatus } from "@/types/enums";
export { UserStatus } from "@/types/enums";

export interface AdminNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean | null;
  phone: string | null;
  phoneVerified: boolean | null;
  twoFactorEnabled: boolean;
  twoFactorEnforced?: boolean;
  balance?: number;
  aiCredits?: number;
  examCredits?: number;
  activeSubscriptionId?: string | null;
  subscriptionExpiresAt?: string | null;
  googleId?: string | null;
  githubId?: string | null;
  authProvider?: string | null;
  createdBy?: string | null;
  archivedAt?: string | null;
  statusReason?: string | null;
  statusExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  tasksCompleted: number;
  examsPassed: number;
  pomodoroSessions: number;
  deepWorkSessions: number;
  studyXP: number;
  taskXP: number;
  examXP: number;
  challengeXP: number;
  questXP: number;
  seasonXP: number;
  gradeLevel: string | null;
  educationType: string | null;
  section: string | null;
  interestedSubjects: string[];
  studyGoal: string | null;
  bio: string | null;
  school: string | null;
  country: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  adminNotes?: AdminNote[];
  _count: {
    tasks: number;
    studySessions: number;
    achievements: number;
    notifications: number;
    examResults: number;
    subjectEnrollments: number;
    customGoals: number;
    reminders: number;
    sessions: number;
  };
  achievements: Array<{
    id: string;
    earnedAt: string;
    achievement: {
      title: string;
      icon: string;
      xpReward: number;
    };
  }>;
  examResults: Array<{
    id: string;
    score: number;
    takenAt: string;
    exam: {
      title: string;
      subject: {
        name: string;
      };
    };
  }>;
  studySessions: Array<{
    id: string;
    startTime: string;
    endTime: string;
    durationMin: number;
    focusScore: number;
    subject: {
      name: string;
    } | null;
  }>;
}

export const roleColors: Record<string, string> = {
  ADMIN: "bg-danger shadow-danger/20 text-white",
  TEACHER: "bg-primary shadow-primary/20 text-white",
  STUDENT: "bg-success shadow-success/20 text-white",
  MODERATOR: "bg-warning shadow-warning/20 text-white",
  USER: "bg-secondary shadow-secondary/20 text-white"
};

export const roleLabels: Record<string, string> = {
  ADMIN: "مدير",
  TEACHER: "معلم",
  STUDENT: "طالب",
  MODERATOR: "مشرف",
  USER: "مستخدم"
};

export const statusColors: Record<UserStatus, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  SUSPENDED: "bg-warning/10 text-warning border-warning/20",
  BANNED: "bg-danger/10 text-danger border-danger/20",
  INACTIVE: "bg-muted text-muted-foreground border-border/20",
  DELETED: "bg-muted text-muted-foreground border-border/20",
  PENDING_VERIFICATION: "bg-info/10 text-info border-info/20"
};

export const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "نشط",
  SUSPENDED: "موقوف",
  BANNED: "محظور",
  INACTIVE: "غير نشط",
  DELETED: "محذوف",
  PENDING_VERIFICATION: "قيد التحقق"
};

export const gradeLabels: Record<string, string> = {
  "GRADE_1": "الصف الأول",
  "GRADE_2": "الصف الثاني",
  "GRADE_3": "الصف الثالث",
  "GRADE_4": "الصف الرابع",
  "GRADE_5": "الصف الخامس",
  "GRADE_6": "الصف السادس",
  "PREP_1": "الأول الإعدادي",
  "PREP_2": "الثاني الإعدادي",
  "PREP_3": "الثالث الإعدادي",
  "SEC_1": "الأول الثانوي",
  "SEC_2": "الثاني الثانوي",
  "SEC_3": "الثالث الثانوي"
};

export const educationTypeOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: "عام", label: "عام" },
  { value: "أزهري", label: "أزهري" },
  { value: "دولي", label: "دولي" },
  { value: "IG", label: "IG" },
  { value: "American", label: "American" },
  { value: "أخرى", label: "أخرى" },
];

export const genderOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "آخر" },
];

export const roleOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: UserRole.STUDENT, label: "طالب" },
  { value: UserRole.TEACHER, label: "معلم" },
  { value: UserRole.ADMIN, label: "مدير" },
  { value: UserRole.SUPER_ADMIN, label: "مدير عام" },
  { value: UserRole.SUPPORT, label: "دعم فني" },
  { value: UserRole.MODERATOR, label: "مشرف" },
  { value: UserRole.PARENT, label: "ولي أمر" },
];

export const gradeLevelOptions: ReadonlyArray<{ value: string; label: string }> = Object.entries(gradeLabels).map(
  ([value, label]) => ({ value, label }),
);

export function resolveGradeLabel(value: string | null | undefined): string {
  if (!value) return "غير محدد";
  return gradeLabels[value] || value;
}

export function resolveEducationTypeLabel(value: string | null | undefined): string {
  if (!value) return "عام";
  return educationTypeOptions.find((option) => option.value === value)?.label || value;
}

export const EDITABLE_USER_FIELDS = [
  "name",
  "username",
  "email",
  "phone",
  "role",
  "bio",
  "gradeLevel",
  "educationType",
  "section",
  "school",
  "country",
  "dateOfBirth",
  "gender",
  "studyGoal",
] as const;

export type EditableUserField = (typeof EDITABLE_USER_FIELDS)[number];

export function pickEditableUserFields(
  source: Partial<UserDetails>,
): Partial<Pick<UserDetails, EditableUserField>> {
  const result: Record<string, unknown> = {};
  for (const field of EDITABLE_USER_FIELDS) {
    if (field in source) {
      result[field] = source[field];
    }
  }
  return result as Partial<Pick<UserDetails, EditableUserField>>;
}

const XP_PER_LEVEL = 1000;

export interface LevelProgress {
  level: number;
  totalXP: number;
  levelProgress: number;
  xpToNextLevel: number;
}

export function computeLevelProgress(user: Pick<UserDetails, "totalXP">): LevelProgress {
  const totalXP = Math.max(0, user.totalXP ?? 0);
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const levelProgress = (currentLevelXP / XP_PER_LEVEL) * 100;
  const xpToNextLevel = Math.max(0, XP_PER_LEVEL - currentLevelXP);
  return { level, totalXP, levelProgress, xpToNextLevel };
}
