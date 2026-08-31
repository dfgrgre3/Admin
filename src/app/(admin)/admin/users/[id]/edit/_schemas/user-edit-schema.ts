"use client";

import { z } from "zod";

export const userEditSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").optional().or(z.literal("")),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "MODERATOR", "USER"]),
  bio: z.string().optional().or(z.literal("")),
  gradeLevel: z.string().optional().or(z.literal("")),
  educationType: z.string().optional().or(z.literal("")),
  section: z.string().optional().or(z.literal("")),
  school: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  studyGoal: z.string().optional().or(z.literal("")),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
});

export type UserEditFormValues = z.infer<typeof userEditSchema>;

export const defaultEditValues: UserEditFormValues = {
  name: "",
  username: "",
  email: "",
  phone: "",
  role: "STUDENT",
  bio: "",
  gradeLevel: "",
  educationType: "",
  section: "",
  school: "",
  country: "",
  gender: "",
  studyGoal: "",
  emailVerified: false,
  phoneVerified: false,
  twoFactorEnabled: false,
};