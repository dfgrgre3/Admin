import { z } from 'zod';

export const twoFactorSchema = z.object({
  code: z
    .string()
    .min(1, 'رمز التحقق مطلوب')
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على 6 أرقام فقط'),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;