/**
 * Real Backend Types for Course Management System
 * Strict contract definitions without mock data or local assumptions.
 */

export type CourseStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';
export type CourseVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED' | 'PASSWORD_PROTECTED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type CoursePriceType = 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'ONE_TIME';
export type LessonType = 'VIDEO' | 'TEXT' | 'AUDIO' | 'FILE' | 'EXTERNAL_LINK' | 'INTERACTIVE_QUIZ';
export type DripType = 'IMMEDIATE' | 'DAYS_AFTER_ENROLLMENT' | 'FIXED_DATE';

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string | null;
  status: CourseStatus;
  visibility: CourseVisibility;
  category_name?: string | null;
  primary_instructor_name?: string | null;
  price_type: CoursePriceType;
  price?: number | null;
  compare_at_price?: number | null;
  currency?: string | null;
  enrollments_count: number;
  lessons_count: number;
  modules_count: number;
  average_rating: number;
  reviews_count: number;
  revenue: number;
  completion_rate: number;
  total_duration_seconds: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  can_delete: boolean;
  can_publish: boolean;
  can_unpublish: boolean;
  can_archive: boolean;
  can_duplicate: boolean;
  can_manage_curriculum: boolean;
}

export interface CoursePagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CourseFilters {
  page?: number;
  per_page?: number;
  q?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  status?: CourseStatus | 'ALL';
  visibility?: CourseVisibility | 'ALL';
  category_id?: string;
  include_subcategories?: boolean;
  instructor_id?: string;
  price_type?: CoursePriceType | 'ALL';
  min_price?: number;
  max_price?: number;
  level?: CourseLevel | 'ALL';
  language?: string;
  tags?: string[];
  created_from?: string;
  created_to?: string;
  published_from?: string;
  published_to?: string;
  has_discount?: boolean;
  min_enrollments?: number;
  max_enrollments?: number;
  min_rating?: number;
  min_duration?: number;
  max_duration?: number;
  is_featured?: boolean;
  include_archived?: boolean;
}

export interface CoursesListResponse {
  items: CourseListItem[];
  pagination: CoursePagination;
  filters_used: Record<string, any>;
  request_id?: string;
}

export interface OptionItem {
  id: string;
  name: string;
  code?: string;
}

export interface CourseMetaResponse {
  statuses: OptionItem[];
  visibilities: OptionItem[];
  levels: OptionItem[];
  languages: OptionItem[];
  price_types: OptionItem[];
  categories: OptionItem[];
  instructors: OptionItem[];
  tags: OptionItem[];
  sort_options: OptionItem[];
  feature_flags?: Record<string, boolean>;
}

export interface PublishChecklistItem {
  key: string;
  title: string;
  is_fulfilled: boolean;
  message?: string;
}

export interface CourseDetails {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  short_description?: string | null;
  description?: string | null;
  status: CourseStatus;
  visibility: CourseVisibility;
  level: CourseLevel;
  language: string;
  category_id: string;
  subcategory_ids?: string[];
  primary_instructor_id: string;
  co_instructor_ids?: string[];
  tag_ids?: string[];
  thumbnail_id?: string | null;
  thumbnail_url?: string | null;
  promo_video_id?: string | null;
  promo_video_url?: string | null;
  promo_video_provider?: string | null;
  price_type: CoursePriceType;
  price?: number | null;
  compare_at_price?: number | null;
  currency?: string | null;
  discount_starts_at?: string | null;
  discount_ends_at?: string | null;
  enrollment_capacity?: number | null;
  allow_enrollment_after_full?: boolean;
  requires_login?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
  enrollment_password?: string | null;
  drip_content_enabled?: boolean;
  require_previous_completion?: boolean;
  allow_certificate_download?: boolean;
  auto_complete_on_last_lesson?: boolean;
  show_student_count?: boolean;
  allow_reviews?: boolean;
  allow_discussion?: boolean;
  max_certificate_attempts?: number;
  certificate_passing_score?: number;
  published_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  prerequisites_course_ids?: string[];
  learning_outcomes?: string[];
  requirements?: string[];
  target_audience?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  modules_count: number;
  lessons_count: number;
  total_duration_seconds: number;
  enrollments_count: number;
  active_enrollments_count: number;
  completed_count: number;
  completion_rate: number;
  average_rating: number;
  reviews_count: number;
  revenue: number;
  can_edit: boolean;
  can_delete: boolean;
  can_publish: boolean;
  can_unpublish: boolean;
  can_archive: boolean;
  can_restore: boolean;
  can_duplicate: boolean;
  can_manage_curriculum: boolean;
  missing_publish_requirements?: string[];
  publish_checklist?: PublishChecklistItem[];
}

export interface CourseFormValues {
  title: string;
  slug: string;
  subtitle?: string;
  short_description?: string;
  description?: string;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  level?: CourseLevel;
  language?: string;
  category_id: string;
  subcategory_ids?: string[];
  primary_instructor_id: string;
  co_instructor_ids?: string[];
  tag_ids?: string[];
  thumbnail_id?: string;
  promo_video_provider?: string;
  promo_video_url?: string;
  promo_video_id?: string;
  price_type?: CoursePriceType;
  price?: number;
  compare_at_price?: number;
  currency?: string;
  discount_starts_at?: string;
  discount_ends_at?: string;
  enrollment_capacity?: number;
  allow_enrollment_after_full?: boolean;
  requires_login?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
  enrollment_password?: string;
  drip_content_enabled?: boolean;
  require_previous_completion?: boolean;
  allow_certificate_download?: boolean;
  auto_complete_on_last_lesson?: boolean;
  show_student_count?: boolean;
  allow_reviews?: boolean;
  allow_discussion?: boolean;
  max_certificate_attempts?: number;
  certificate_passing_score?: number;
  prerequisites_course_ids?: string[];
  learning_outcomes?: string[];
  requirements?: string[];
  target_audience?: string[];
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  type: LessonType;
  status: 'DRAFT' | 'PUBLISHED';
  order: number;
  duration_seconds: number;
  is_free_preview: boolean;
  video_provider?: string | null;
  video_external_url?: string | null;
  video_asset_id?: string | null;
  content_html?: string | null;
  attachment_ids?: string[];
  quiz_id?: string | null;
  assignment_id?: string | null;
  transcript_url?: string | null;
  subtitle_urls?: string[];
  prerequisites_lesson_ids?: string[];
  drip_type?: DripType;
  drip_days?: number | null;
  available_at?: string | null;
}

export interface Module {
  id: string;
  title: string;
  description?: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  order: number;
  drip_type?: DripType;
  drip_days?: number | null;
  available_at?: string | null;
  require_previous_completion?: boolean;
  lessons_count: number;
  duration_seconds: number;
  lessons: Lesson[];
}

export interface CourseCurriculum {
  course_id: string;
  modules: Module[];
  total_modules: number;
  total_lessons: number;
  total_duration_seconds: number;
}

export interface AssetUploadRequest {
  filename: string;
  mime_type: string;
  size: number;
  purpose: 'course_thumbnail' | 'course_promo_video' | 'lesson_attachment' | 'lesson_subtitle' | 'seo_image';
  related_entity_type?: 'course' | 'lesson' | 'module';
  related_entity_id?: string;
}

export interface AssetUploadResponse {
  upload_id: string;
  upload_url: string;
  public_url?: string;
  expires_at: string;
}

export interface BulkActionPayload {
  action: 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete' | 'change_category' | 'change_instructor' | 'change_visibility' | 'add_tags' | 'remove_tags';
  course_ids: string[];
  payload?: Record<string, any>;
}

export interface BulkActionResponse {
  total_requested: number;
  succeeded_count: number;
  failed_count: number;
  failed_items?: { id: string; error: string }[];
}

export interface CheckSlugResponse {
  is_available: boolean;
  message_code?: string;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorPayload {
  error_code: string;
  message_code: string;
  details?: ApiErrorDetail[];
  request_id?: string;
}

export interface CourseOverviewStats {
  total_enrollments: number;
  active_enrollments: number;
  active_students: number;
  completed_count: number;
  completion_rate: number;
  dropoff_rate: number;
  average_watch_time_seconds: number;
  average_time_spent_seconds: number;
  total_revenue: number;
  net_revenue: number;
  refunds_count: number;
  refund_amount: number;
  new_students: number;
  conversion_rate: number;
  bounce_rate: number;
  average_rating: number;
  reviews_count: number;
  free_preview_completions: number;
  free_preview_completion_rate: number;
}

export interface CourseOverviewSeries {
  name: string;
  enrollments: number;
  revenue: number;
  active: number;
  completed: number;
}

export interface CourseOverviewDevice {
  name: string;
  value: number;
  color: string;
}

export interface CourseOverviewDemographic {
  name: string;
  value: number;
  color: string;
}

export interface CourseOverviewRecentReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
}

export interface CourseOverviewCurriculumStats {
  chapters_count: number;
  lessons_count: number;
  free_lessons_count: number;
  total_duration_seconds: number;
  total_duration_minutes: number;
  total_duration_hours: number;
  video_duration_seconds: number;
}

export interface CourseOverviewData {
  course: {
    id: string;
    name: string;
    name_ar?: string | null;
    description?: string | null;
    short_description?: string | null;
    price: number;
    currency?: string | null;
    level: string;
    language?: string;
    status: CourseStatus;
    visibility: CourseVisibility;
    is_published: boolean;
    is_active: boolean;
    is_featured?: boolean;
    thumbnail_url?: string | null;
    promo_video_url?: string | null;
    category_name?: string | null;
    primary_instructor_name?: string | null;
    primary_instructor_avatar_url?: string | null;
    slug?: string | null;
    enrollments_count: number;
    lessons_count: number;
    modules_count: number;
    average_rating: number;
    reviews_count: number;
    revenue: number;
    completion_rate: number;
    total_duration_seconds: number;
    published_at?: string | null;
    created_at: string;
    updated_at: string;
    price_type: CoursePriceType;
    can_edit: boolean;
    can_publish: boolean;
    can_archive: boolean;
  };
  stats: CourseOverviewStats;
  curriculum_stats: CourseOverviewCurriculumStats;
  engagement_series: CourseOverviewSeries[];
  enrollment_series: CourseOverviewSeries[];
  revenue_series: CourseOverviewSeries[];
  device_breakdown: CourseOverviewDevice[];
  demographic_breakdown: CourseOverviewDemographic[];
  recent_reviews: CourseOverviewRecentReview[];
  publish_checklist?: PublishChecklistItem[];
  missing_publish_requirements?: string[];
  request_id?: string;
}

export interface CourseOverviewResponse {
  data?: CourseOverviewData;
  stats?: CourseOverviewStats;
  curriculum_stats?: CourseOverviewCurriculumStats;
  engagement_series?: CourseOverviewSeries[];
  enrollment_series?: CourseOverviewSeries[];
  revenue_series?: CourseOverviewSeries[];
  device_breakdown?: CourseOverviewDevice[];
  demographic_breakdown?: CourseOverviewDemographic[];
  recent_reviews?: CourseOverviewRecentReview[];
  publish_checklist?: PublishChecklistItem[];
  missing_publish_requirements?: string[];
  request_id?: string;
  success?: boolean;
  message?: string;
}

export type CourseOverview = CourseOverviewResponse;
