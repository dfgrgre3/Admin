import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .trim()
    .email('يرجى إدخال بريد إلكتروني صحيح')
    .max(190, 'البريد الإلكتروني طويل جداً'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;