import { z } from 'zod';

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'الرمز مطلوب'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
    .max(128, 'كلمة المرور طويلة جداً')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم على الأقل'
    ),
  passwordConfirmation: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'كلمات المرور غير متطابقة',
  path: ['passwordConfirmation'],
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;