import { z } from 'zod';

export const courseBasicSchema = z.object({
  title: z.string().min(3, 'عنوان الدورة يجب أن يكون 3 أحرف على الأقل'),
  slug: z
    .string()
    .min(3, 'الرابط الدائم يجب أن يكون 3 أحرف على الأقل')
    .regex(/^[a-z0-9-]+$/, 'الرابط الدائم يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط'),
  subtitle: z.string().optional(),
  short_description: z.string().max(500, 'الوصف المختصر لا يتجاوز 500 حرف').optional(),
  description: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).default('BEGINNER'),
  language: z.string().min(1, 'يرجى اختيار اللغة'),
  category_id: z.string().min(1, 'يرجى اختيار التصنيف الرئيسي'),
  subcategory_ids: z.array(z.string()).optional(),
  primary_instructor_id: z.string().min(1, 'يرجى اختيار المدرب الرئيسي'),
  co_instructor_ids: z.array(z.string()).optional(),
  tag_ids: z.array(z.string()).optional(),
});

export const courseMediaSchema = z.object({
  thumbnail_id: z.string().optional(),
  promo_video_provider: z.string().optional(),
  promo_video_url: z.string().url('يرجى إدخال رابط فيديو صحيح').optional().or(z.literal('')),
  promo_video_id: z.string().optional(),
});

export const coursePricingSchema = z.object({
  price_type: z.enum(['FREE', 'PAID', 'SUBSCRIPTION', 'ONE_TIME']).default('FREE'),
  price: z.coerce.number().min(0, 'السعر لا يمكن أن يكون بالسالب').optional(),
  compare_at_price: z.coerce.number().min(0).optional(),
  currency: z.string().default('SAR'),
  discount_starts_at: z.string().optional(),
  discount_ends_at: z.string().optional(),
});

export const courseSettingsSchema = z.object({
  enrollment_capacity: z.coerce.number().min(0).optional(),
  allow_enrollment_after_full: z.boolean().default(false),
  requires_login: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
});

export const courseContentSchema = z.object({
  prerequisites_course_ids: z.array(z.string()).optional(),
  learning_outcomes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
});

export const courseSeoSchema = z.object({
  meta_title: z.string().max(70, 'عنوان SEO يجب ألا يتجاوز 70 حرفاً').optional(),
  meta_description: z.string().max(160, 'وصف SEO يجب ألا يتجاوز 160 حرفاً').optional(),
  canonical_url: z.string().url('يرجى إدخال رابط صحيح').optional().or(z.literal('')),
});

export const courseFullFormSchema = courseBasicSchema
  .merge(courseMediaSchema)
  .merge(coursePricingSchema)
  .merge(courseSettingsSchema)
  .merge(courseContentSchema)
  .merge(courseSeoSchema);

export type CourseFullFormValues = z.infer<typeof courseFullFormSchema>;

export const moduleFormSchema = z.object({
  title: z.string().min(2, 'عنوان الوحدة مطلوب'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  drip_type: z.enum(['IMMEDIATE', 'DAYS_AFTER_ENROLLMENT', 'FIXED_DATE']).default('IMMEDIATE'),
  drip_days: z.coerce.number().min(0).optional(),
  available_at: z.string().optional(),
  require_previous_completion: z.boolean().default(false),
});

export const lessonFormSchema = z.object({
  title: z.string().min(2, 'عنوان الدرس مطلوب'),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'TEXT', 'AUDIO', 'FILE', 'EXTERNAL_LINK', 'INTERACTIVE_QUIZ']).default('VIDEO'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  is_free_preview: z.boolean().default(false),
  duration_seconds: z.coerce.number().min(0).default(0),
  video_provider: z.string().optional(),
  video_external_url: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  video_asset_id: z.string().optional(),
  content_html: z.string().optional(),
  quiz_id: z.string().optional(),
  assignment_id: z.string().optional(),
  drip_type: z.enum(['IMMEDIATE', 'DAYS_AFTER_ENROLLMENT', 'FIXED_DATE']).default('IMMEDIATE'),
  drip_days: z.coerce.number().min(0).optional(),
  available_at: z.string().optional(),
});
