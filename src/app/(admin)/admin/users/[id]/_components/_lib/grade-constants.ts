"use client";

import { UserRole } from "@/types/enums";

export const gradeLabels: Record<string, string> = {
  GRADE_1: "الصف الأول",
  GRADE_2: "الصف الثاني",
  GRADE_3: "الصف الثالث",
  GRADE_4: "الصف الرابع",
  GRADE_5: "الصف الخامس",
  GRADE_6: "الصف السادس",
  PREP_1: "الأول الإعدادي",
  PREP_2: "الثاني الإعدادي",
  PREP_3: "الثالث الإعدادي",
  SEC_1: "الأول الثانوي",
  SEC_2: "الثاني الثانوي",
  SEC_3: "الثالث الثانوي",
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

export const gradeLevelOptions: ReadonlyArray<{ value: string; label: string }> =
  Object.entries(gradeLabels).map(([value, label]) => ({ value, label }));

export function resolveGradeLabel(value: string | null | undefined): string {
  if (!value) return "غير محدد";
  return gradeLabels[value] || value;
}

export function resolveEducationTypeLabel(value: string | null | undefined): string {
  if (!value) return "عام";
  return educationTypeOptions.find(option => option.value === value)?.label || value;
}