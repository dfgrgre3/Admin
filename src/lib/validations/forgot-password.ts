import { z } from "zod";

export const forgotPasswordSteps = [
  { id: 1, label: "البريد" },
  { id: 2, label: "التحقق" },
  { id: 3, label: "كلمة المرور" },
];

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

export const forgotPasswordNewPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
