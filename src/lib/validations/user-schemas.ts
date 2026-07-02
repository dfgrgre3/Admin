"use client";

import { z } from "zod";

/**
 * Schema للتحقق من صحة كلمة المرور عند إعادة تعيينها
 * يتطلب: 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم
 */
export const passwordResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .regex(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير (A-Z)")
      .regex(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير (a-z)")
      .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم (0-9)")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "يجب أن تحتوي كلمة المرور على رمز خاص (!@#$%^&*)"
      ),
    confirmPassword: z.string().min(1, "يرجى تأكيد كلمة المرور"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

/**
 * Schema للتحقق من صحة بيانات المستخدم القابلة للتعديل
 */
export const editableUserSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100, "الاسم طويل جداً").optional(),
  username: z
    .string()
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
    .max(30, "اسم المستخدم طويل جداً")
    .regex(/^[a-zA-Z0-9_]+$/, "اسم المستخدم يجب أن يحتوي فقط على أحرف وأرقام وشرطة سفلية")
    .optional()
    .or(z.literal("")),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "رقم الهاتف غير صالح")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "السيرة الذاتية طويلة جداً").optional(),
  gradeLevel: z.string().optional(),
  educationType: z.string().optional(),
  section: z.string().optional(),
  school: z.string().max(200, "اسم المدرسة طويل جداً").optional(),
  country: z.string().max(100, "اسم الدولة طويل جداً").optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  studyGoal: z.string().max(500, "الهدف الدراسي طويل جداً").optional(),
  role: z.string().optional(),
});

export type EditableUserFormData = z.infer<typeof editableUserSchema>;