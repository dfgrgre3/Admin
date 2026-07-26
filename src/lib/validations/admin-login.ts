import { z } from 'zod';

export const adminLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'هذا الحقل مطلوب')
    .trim()
    .min(3, 'الطول يجب أن يكون بين 3 و 190 حرفاً')
    .max(190, 'الطول يجب أن يكون بين 3 و 190 حرفاً')
    .refine(
      (value) => {
        // Check if it's a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          return true;
        }
        // Check if it's a valid username (alphanumeric, underscores, hyphens, 3-30 chars)
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        return usernameRegex.test(value);
      },
      {
        message: 'أدخل بريداً إلكترونياً أو اسم مستخدم صحيح',
      }
    ),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
    .max(128, 'كلمة المرور طويلة جداً'),
  rememberMe: z.boolean().default(false),
  captchaToken: z.string().optional(),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;