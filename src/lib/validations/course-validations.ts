/**
 * Runtime validation for the educational course-management surface.
 *
 * These schemas cover the payloads sent through `course-api.ts` (the admin
 * client library) *before* they hit the network. They guard every write path
 * (create / update / section / lesson / enrollment / pricing) so malformed
 * data is rejected on the client instead of producing opaque 4xx/5xx errors
 * from the upstream Go service.
 *
 * Only depends on `zod` — no UI layer — so it is safe to import from server
 * components, route handlers, or the client bundle.
 */
import { z } from "zod";

// ─── Shared enums ───────────────────────────────────────────────────────────

export const courseLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const courseStatusSchema = z.enum([
  "DRAFT",
  "UNDER_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
  "REJECTED",
]);

export const lessonTypeSchema = z.enum([
  "VIDEO",
  "TEXT",
  "AUDIO",
  "FILE",
  "EXTERNAL_LINK",
  "INTERACTIVE_QUIZ",
]);

export const availabilityTypeSchema = z.enum(["CALENDAR_DATE", "ENROLLMENT_RELATIVE"]);

export const pricingTypeSchema = z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION", "BUNDLE"]);

export type CourseLevel = z.infer<typeof courseLevelSchema>;
export type CourseStatus = z.infer<typeof courseStatusSchema>;
export type LessonType = z.infer<typeof lessonTypeSchema>;
export type AvailabilityType = z.infer<typeof availabilityTypeSchema>;
export type PricingType = z.infer<typeof pricingTypeSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

const nonEmptyString = (msg: string) => z.string().min(1, msg).max(500, `${msg} (≤ 500 chars)`);

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const urlString = (msg: string) =>
  z.string().url(msg).max(2048, `${msg} (≤ 2048 chars)`);

// ─── Course create / update ────────────────────────────────────────────────

const courseCoreSchema = {
  title: nonEmptyString("عنوان الدورة مطلوب"),
  slug: z
    .string()
    .min(3, "الرابط المختصر يجب أن يكون 3 أحرف على الأقل على الأقل")
    .max(200, "الرابط المختصر طويل جداً")
    .regex(slugRegex, "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  shortDescription: z.string().max(500, "الوصف المختصر لا يتجاوز 500 حرف").optional(),
  longDescription: z.string().max(20000, "الوصف الطويل لا يتجاوز 20000 حرف").optional(),
  coverImageUrl: urlString("رابط صورة الغلاف غير صالح").optional(),
  promoVideoUrl: urlString("رابط الفيديو الترويجي غير صالح").optional(),
  level: courseLevelSchema,
  language: z.string().min(2, "يرجى اختيار اللغة").max(10, "رمز اللغة غير صالح"),
  estimatedDurationMins: z
    .number()
    .int("المدة يجب أن تكون عدد صحيح بالدقائق")
    .min(0, "المدة لا يمكن أن تكون سلبية")
    .optional(),
  hasCertificate: z.boolean().optional(),
  certificateTemplate: z.string().max(500, "قالب الشهادة طويل جداً").optional(),
  maxStudents: z.number().int().min(0, "الحد الأقصى للطلاب لا يمكن أن يكون سلبياً").optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  seoTitle: z.string().max(70, "عنوان SEO يجب ألا يتجاوز 70 حرفاً").optional(),
  seoDescription: z.string().max(160, "وصف SEO يجب ألا يتجاوز 160 حرفاً").optional(),
  seoKeywords: z
    .array(z.string().max(100, "كلمة مفتاحية طويلة جداً"))
    .max(50, "عدد الكلمات المفتاحية لا يتجاوز 50")
    .optional(),
  prerequisitesText: z.string().max(2000, "نص المتطلبات السابقة طويل جداً").optional(),
  targetAudience: z.string().max(2000, "وصف الجمهور المستهدف طويل جداً").optional(),
  learningOutcomes: z
    .array(z.string().max(500, "هدف تعلم طويل جداً"))
    .max(50, "عدد الأهداف لا يتجاوز 50")
    .optional(),
  primaryInstructorId: nonEmptyString("معرف المدرب الرئيسي مطلوب"),
};

export const createCourseSchema = z.object({
  ...courseCoreSchema,
  categoryIds: z.array(z.string().uuid("معرف التصنيف غير صالح")).optional(),
});

export const updateCourseSchema = z.object({
  title: courseCoreSchema.title.optional(),
  slug: courseCoreSchema.slug.optional(),
  shortDescription: courseCoreSchema.shortDescription,
  longDescription: courseCoreSchema.longDescription,
  coverImageUrl: courseCoreSchema.coverImageUrl,
  promoVideoUrl: courseCoreSchema.promoVideoUrl,
  level: courseLevelSchema.optional(),
  language: courseCoreSchema.language.optional(),
  estimatedDurationMins: courseCoreSchema.estimatedDurationMins,
  hasCertificate: courseCoreSchema.hasCertificate,
  certificateTemplate: courseCoreSchema.certificateTemplate,
  maxStudents: courseCoreSchema.maxStudents,
  isFeatured: courseCoreSchema.isFeatured,
  isTrending: courseCoreSchema.isTrending,
  isNew: courseCoreSchema.isNew,
  seoTitle: courseCoreSchema.seoTitle,
  seoDescription: courseCoreSchema.seoDescription,
  seoKeywords: courseCoreSchema.seoKeywords,
  prerequisitesText: courseCoreSchema.prerequisitesText,
  targetAudience: courseCoreSchema.targetAudience,
  learningOutcomes: courseCoreSchema.learningOutcomes,
  primaryInstructorId: z
    .string()
    .uuid("معرف المدرب الرئيسي غير صالح")
    .optional(),
  categoryIds: z.array(z.string().uuid("معرف التصنيف غير صالح")).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ─── Course list filters ────────────────────────────────────────────────────

export const courseListFiltersSchema = z.object({
  status: courseStatusSchema.optional(),
  level: courseLevelSchema.optional(),
  language: z.string().optional(),
  categoryId: z.string().optional(),
  instructorId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  search: z.string().max(200, "نص البحث طويل جداً").optional(),
  page: z.number().int().min(1, "رقم الصفحة يجب أن يكون 1 أو أكثر").optional(),
  limit: z.number().int().min(1, "الحد الأدنى للصفحة هو 1").max(200, "الحد الأقصى للصفحة هو 200").optional(),
  sort: z.enum(["newest", "oldest", "popular", "price_asc", "price_desc"]).optional(),
});

export type CourseListFilters = z.infer<typeof courseListFiltersSchema>;

// ─── Sections ───────────────────────────────────────────────────────────────

export const sectionInputSchema = z.object({
  title: nonEmptyString("عنوان القسم مطلوب"),
  orderIndex: z
    .number()
    .int("ترتيب القسم يجب أن يكون عدداً صحيحاً")
    .min(0, "ترتيب القسم لا يمكن أن يكون سلبياً")
    .optional(),
  availableFrom: z
    .number()
    .int("availableFrom يجب أن يكون إشارة زمنية بالملي ثانية")
    .min(0, "availableFrom لا يمكن أن يكون سلبياً")
    .optional(),
  dripDelayDays: z
    .number()
    .int("dripDelayDays يجب أن يكون عدداً صحيحاً")
    .min(0, "dripDelayDays لا يمكن أن يكون سلبياً")
    .optional(),
});

export const sectionUpdateSchema = sectionInputSchema.partial();

export const reorderSectionsSchema = z.object({
  sectionIds: z
    .array(z.string().uuid("معرف القسم غير صالح"))
    .min(1, "يجب توفير معرف قسم واحد على الأقل"),
});

// ─── Lessons ────────────────────────────────────────────────────────────────

export const lessonInputSchema = z.object({
  title: nonEmptyString("عنوان الدرس مطلوب"),
  type: lessonTypeSchema,
  content: z.string().max(100000, "محتوى الدرس طويل جداً").optional(),
  mediaUrl: urlString("رابط الوسائط غير صالح").optional(),
  durationSeconds: z
    .number()
    .int("مدة الدرس يجب أن تكون عدداً صحيحاً بالثواني")
    .min(0, "مدة الدرس لا يمكن أن تكون سلبية")
    .optional(),
  isFreePreview: z.boolean().optional(),
  orderIndex: z
    .number()
    .int("ترتيب الدرس يجب أن يكون عدداً صحيحاً")
    .min(0, "ترتيب الدرس لا يمكن أن يكون سلبياً")
    .optional(),
  availabilityType: availabilityTypeSchema.optional(),
  availableFrom: z.string().optional(),
  dripDelayDays: z
    .number()
    .int("dripDelayDays يجب أن يكون عدداً صحيحاً")
    .min(0, "dripDelayDays لا يمكن أن يكون سلبياً")
    .optional(),
});

export const lessonUpdateSchema = lessonInputSchema.partial();

export const lessonIdentifierSchema = z.object({
  courseId: z.string().uuid("معرف الدورة غير صالح"),
  sectionId: z.string().uuid("معرف القسم غير صالح"),
  lessonId: z.string().uuid("معرف الدرس غير صالح"),
});

export const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid("معرف الدرس غير صالح")).min(1, "يجب توفير معرف درس واحد على الأقل"),
});

// ─── Enrollments ────────────────────────────────────────────────────────────

export const enrollmentUpdateSchema = z.object({
  progress: z
    .number()
    .min(0, "التقدم لا يمكن أن يكون سلبياً")
    .max(100, "التقدم لا يتجاوز 100%"),
});

// ─── Pricing ────────────────────────────────────────────────────────────────

export const pricingInputSchema = z
  .object({
    type: pricingTypeSchema,
    amount: z
      .number()
      .min(0, "السعر لا يمكن أن يكون سلبياً")
      .refine(
        (v) => Number.isFinite(v),
        "السعر يجب أن يكون عدداً صالحاً",
      ),
    currencyCode: z
      .string()
      .length(3, "رمز العملة يجب أن يكون 3 أحرف (مثال: SAR)")
      .regex(/^[A-Z]{3}$/, "رمز العملة يجب أن يكون 3 أحرف كبيرة"),
    subscriptionDurationDays: z
      .number()
      .int("مدة الاشتراك يجب أن تكون عدداً صحيحاً")
      .min(1, "مدة الاشتراك يجب أن تكون يوم واحد على الأقل")
      .optional(),
    discountPrice: z.number().min(0, "سعر الخصم لا يمكن أن يكون سلبياً").optional(),
    discountStartAt: z
      .number()
      .int("تاريخ بداية الخصم يجب أن يكون إشارة زمنية بالملي ثانية")
      .min(0, "تاريخ بداية الخصم لا يمكن أن يكون سلبياً")
      .optional(),
    discountEndAt: z
      .number()
      .int("تاريخ نهاية الخصم يجب أن يكون إشارة زمنية بالملي ثانية")
      .min(0, "تاريخ نهاية الخصم لا يمكن أن يكون سلبياً")
      .optional(),
    subscriptionPlanId: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (d) => {
      // discountStartAt / discountEndAt must be present together and ordered
      if (d.discountStartAt && d.discountEndAt) {
        return new Date(d.discountStartAt) <= new Date(d.discountEndAt);
      }
      return true;
    },
    {
      message: "يجب أن يكون تاريخ بداية الخصم قبل أو يساوي تاريخ نهايته",
      path: ["discountEndAt"],
    },
  )
  .refine(
    (d) => {
      if (d.discountPrice !== undefined && d.discountPrice >= d.amount) {
        return false;
      }
      return true;
    },
    {
      message: "سعر الخصم يجب أن يكون أقل من السعر الأصلي",
      path: ["discountPrice"],
    },
  );

export type PricingInput = z.infer<typeof pricingInputSchema>;
