"use client";

export const roleColors: Record<string, string> = {
  ADMIN: "bg-danger shadow-danger/20 text-white",
  TEACHER: "bg-primary shadow-primary/20 text-white",
  STUDENT: "bg-success shadow-success/20 text-white",
  MODERATOR: "bg-warning shadow-warning/20 text-white",
  USER: "bg-secondary shadow-secondary/20 text-white",
};

export const roleLabels: Record<string, string> = {
  ADMIN: "مدير",
  TEACHER: "معلم",
  STUDENT: "طالب",
  MODERATOR: "مشرف",
  USER: "مستخدم",
};