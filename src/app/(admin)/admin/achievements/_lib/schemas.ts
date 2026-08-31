// Validation schemas for achievements using Zod
import { z } from "zod";
import { ACHIEVEMENT_LIMITS } from "./constants";

const keyRegex = /^[A-Z][A-Z0-9_]*$/;

export const achievementSchema = z.object({
  key: z
    .string()
    .min(ACHIEVEMENT_LIMITS.MIN_KEY_LENGTH, `المفتاح يجب أن يكون ${ACHIEVEMENT_LIMITS.MIN_KEY_LENGTH} أحرف على الأقل`)
    .max(ACHIEVEMENT_LIMITS.MAX_KEY_LENGTH, `المفتاح يجب ألا يتجاوز ${ACHIEVEMENT_LIMITS.MAX_KEY_LENGTH} حرفًا`)
    .regex(
      keyRegex,
      "المفتاح يجب أن يبدأ بحرف إنجليزي كبير ويحتوي على أحرف كبيرة وأرقام وشرطة سفلية فقط"
    ),
  title: z
    .string()
    .min(ACHIEVEMENT_LIMITS.MIN_TITLE_LENGTH, `العنوان يجب أن يكون ${ACHIEVEMENT_LIMITS.MIN_TITLE_LENGTH} أحرف على الأقل`)
    .max(ACHIEVEMENT_LIMITS.MAX_TITLE_LENGTH, `العنوان يجب ألا يتجاوز ${ACHIEVEMENT_LIMITS.MAX_TITLE_LENGTH} حرفًا`),
  description: z
    .string()
    .min(ACHIEVEMENT_LIMITS.MIN_DESCRIPTION_LENGTH, `الوصف يجب أن يكون ${ACHIEVEMENT_LIMITS.MIN_DESCRIPTION_LENGTH} أحرف على الأقل`)
    .max(ACHIEVEMENT_LIMITS.MAX_DESCRIPTION_LENGTH, `الوصف يجب ألا يتجاوز ${ACHIEVEMENT_LIMITS.MAX_DESCRIPTION_LENGTH} حرفًا`),
  icon: z.string().min(1, "الأيقونة مطلوبة"),
  rarity: z.string().min(1, "فئة التميز مطلوبة"),
  xpReward: z
    .number()
    .min(ACHIEVEMENT_LIMITS.MIN_XP, "مكافأة النقاط يجب أن تكون صفر أو أكثر")
    .max(ACHIEVEMENT_LIMITS.MAX_XP, `الحد الأقصى للمكافأة ${ACHIEVEMENT_LIMITS.MAX_XP} نقطة`),
  isSecret: z.boolean(),
  category: z.string().min(1, "التصنيف مطلوب"),
  difficulty: z.string().min(1, "مستوى الصعوبة مطلوب"),
  criteria: z
    .string()
    .min(1, "شرط الإنجاز مطلوب")
    .max(ACHIEVEMENT_LIMITS.MAX_CRITERIA_LENGTH, `الشرط يجب ألا يتجاوز ${ACHIEVEMENT_LIMITS.MAX_CRITERIA_LENGTH} حرفًا`),
});

export type AchievementSchemaValues = z.infer<typeof achievementSchema>;

export const grantAchievementSchema = z.object({
  userIds: z
    .array(z.string().min(1, "معرّف المستخدم مطلوب"))
    .min(1, "يجب اختيار مستخدم واحد على الأقل")
    .max(100, "لا يمكن المنح لأكثر من 100 مستخدم دفعة واحدة"),
  achievementId: z.string().min(1, "يجب اختيار الوسام"),
  reason: z
    .string()
    .max(500, "السبب يجب ألا يتجاوز 500 حرف")
    .optional(),
  notifyUser: z.boolean().default(true),
});

export type GrantAchievementFormValues = z.infer<typeof grantAchievementSchema>;