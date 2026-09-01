import { z } from "zod";

// مخطط التحقق من نموذج الخطة
export const planSchema = z.object({
  name: z.string().min(2, "الاسم بالإنجليزية مطلوب"),
  nameAr: z.string().min(2, "الاسم بالعربية مطلوب"),
  description: z.string(),
  price: z.coerce.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  currency: z.string().min(1, "العملة مطلوبة"),
  interval: z.enum(["MONTHLY", "YEARLY", "FOREVER"]),
  isActive: z.boolean(),
  features: z.string(),
  groupKey: z.string(),
});

export type PlanFormSchema = z.infer<typeof planSchema>;
