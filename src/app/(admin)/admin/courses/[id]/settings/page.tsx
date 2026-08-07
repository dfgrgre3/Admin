"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Users,
  UserCheck,
  Globe,
  Star,
  Shield,
  Clock,
  FileCheck,
  Award,
  Copy,
  Archive,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  ChevronLeft,
  Sparkles,
  KeyRound,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Download,
  Zap,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

// ─── Validation Schema ────────────────────────────────────────────────────────
const settingsSchema = z.object({
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED", "PASSWORD_PROTECTED"]),
  is_featured: z.boolean(),
  requires_login: z.boolean(),
  allow_enrollment_after_full: z.boolean(),
  enrollment_capacity: z.number().min(0).optional(),
  enrollment_password: z.string().optional(),
  drip_content_enabled: z.boolean(),
  require_previous_completion: z.boolean(),
  allow_certificate_download: z.boolean(),
  auto_complete_on_last_lesson: z.boolean(),
  show_student_count: z.boolean(),
  allow_reviews: z.boolean(),
  allow_discussion: z.boolean(),
  max_certificate_attempts: z.number().min(0).max(10),
  certificate_passing_score: z.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseSettingsData {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  is_featured: boolean;
  requires_login: boolean;
  allow_enrollment_after_full: boolean;
  enrollment_capacity: number | null;
  enrollment_password: string | null;
  drip_content_enabled: boolean;
  require_previous_completion: boolean;
  allow_certificate_download: boolean;
  auto_complete_on_last_lesson: boolean;
  show_student_count: boolean;
  allow_reviews: boolean;
  allow_discussion: boolean;
  max_certificate_attempts: number;
  certificate_passing_score: number;
  enrollments_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Setting Row Component ────────────────────────────────────────────────────
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  iconColor = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  children: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CourseSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);

  // ─── Fetch Course Settings ────────────────────────────────────────────────
  const { data: course, isLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "settings"],
    queryFn: async (): Promise<CourseSettingsData> => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`);
      if (!response.ok) throw new Error("فشل تحميل إعدادات الدورة");
      const result = await response.json();
      return result.data?.course || result.data || result;
    },
    staleTime: 30_000,
  });

  // ─── Form Setup ───────────────────────────────────────────────────────────
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      visibility: "PUBLIC",
      is_featured: false,
      requires_login: true,
      allow_enrollment_after_full: false,
      enrollment_capacity: undefined,
      enrollment_password: "",
      drip_content_enabled: false,
      require_previous_completion: false,
      allow_certificate_download: true,
      auto_complete_on_last_lesson: false,
      show_student_count: true,
      allow_reviews: true,
      allow_discussion: true,
      max_certificate_attempts: 3,
      certificate_passing_score: 70,
    },
  });

  // Update form when course data loads
  React.useEffect(() => {
    if (course) {
      form.reset({
        visibility: (course.visibility as any) || "PUBLIC",
        is_featured: course.is_featured ?? false,
        requires_login: course.requires_login ?? true,
        allow_enrollment_after_full: course.allow_enrollment_after_full ?? false,
        enrollment_capacity: course.enrollment_capacity ?? undefined,
        enrollment_password: course.enrollment_password || "",
        drip_content_enabled: course.drip_content_enabled ?? false,
        require_previous_completion: course.require_previous_completion ?? false,
        allow_certificate_download: course.allow_certificate_download ?? true,
        auto_complete_on_last_lesson: course.auto_complete_on_last_lesson ?? false,
        show_student_count: course.show_student_count ?? true,
        allow_reviews: course.allow_reviews ?? true,
        allow_discussion: course.allow_discussion ?? true,
        max_certificate_attempts: course.max_certificate_attempts ?? 3,
        certificate_passing_score: course.certificate_passing_score ?? 70,
      });
    }
  }, [course, form]);

  // ─── Save Mutation ────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل حفظ الإعدادات");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId, "settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل حفظ الإعدادات");
    },
  });

  // ─── Duplicate Mutation ───────────────────────────────────────────────────
  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("فشل نسخ الدورة");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast.success("تم نسخ الدورة بنجاح");
      const newId = data?.data?.course?.id || data?.id;
      if (newId) {
        router.push(`/admin/courses/${newId}/settings`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل نسخ الدورة");
    },
  });

  // ─── Archive Mutation ─────────────────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: async () => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/archive`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("فشل أرشفة الدورة");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم أرشفة الدورة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      router.push("/admin/courses");
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل أرشفة الدورة");
    },
  });

  // ─── Delete Mutation ──────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل حذف الدورة");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم حذف الدورة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      router.push("/admin/courses");
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل حذف الدورة");
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const onSubmit = (data: SettingsFormValues) => {
    saveMutation.mutate(data);
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-48 bg-muted/30 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[60vh] items-center justify-center" dir="rtl">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-bold text-muted-foreground">فشل تحميل بيانات الدورة</p>
          <p className="text-sm text-muted-foreground/60 mt-2">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    );
  }

  const visibilityOptions = [
    { value: "PUBLIC", label: "عامة", icon: Globe, description: "ظاهرة للجميع في الموقع", color: "text-blue-500" },
    { value: "PRIVATE", label: "خاصة", icon: EyeOff, description: "مخفية عن الزوار", color: "text-slate-500" },
    { value: "UNLISTED", label: "غير مدرجة", icon: Lock, description: "متاحة بالرابط فقط", color: "text-amber-500" },
    { value: "PASSWORD_PROTECTED", label: "محمية بكلمة مرور", icon: KeyRound, description: "تتطلب كلمة مرور للدخول", color: "text-red-500" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/courses/${courseId}`)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </AdminButton>
            <h2 className="text-3xl font-black tracking-tight">إعدادات الدورة</h2>
          </div>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            إدارة إعدادات الوصول والظهور والمتطلبات للدورة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "px-4 py-1.5 font-black",
              course.status === "PUBLISHED"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            )}
          >
            {course.status === "PUBLISHED" ? "منشورة" : course.status === "DRAFT" ? "مسودة" : course.status}
          </Badge>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Section 1: Visibility & Appearance */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AdminCard className="border-border/40">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-4 w-4 text-blue-500" />
            <h3 className="text-lg font-black">الظهور والحالة</h3>
          </div>

          <div className="space-y-3">
            {/* Visibility Selector */}
            <div className="p-4 rounded-2xl bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-primary" />
                <Label className="text-sm font-bold">الظهور</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {visibilityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setValue("visibility", opt.value as any)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right",
                      form.watch("visibility") === opt.value
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50", opt.color)}>
                      <opt.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Toggle */}
            <SettingRow
              icon={Star}
              label="دورة مميزة"
              description="تظهر في قسم الدورات المميزة على الصفحة الرئيسية"
              iconColor="text-amber-500"
            >
              <Switch
                checked={form.watch("is_featured")}
                onCheckedChange={(checked) => form.setValue("is_featured", checked)}
              />
            </SettingRow>
          </div>
        </AdminCard>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Section 2: Enrollment Settings */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AdminCard className="border-border/40">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-4 w-4 text-violet-500" />
            <h3 className="text-lg font-black">إعدادات التسجيل</h3>
          </div>

          <div className="space-y-3">
            {/* Requires Login */}
            <SettingRow
              icon={UserCheck}
              label="يتطلب تسجيل الدخول"
              description="يجب على الطلاب تسجيل الدخول للوصول إلى الدورة"
              iconColor="text-blue-500"
            >
              <Switch
                checked={form.watch("requires_login")}
                onCheckedChange={(checked) => form.setValue("requires_login", checked)}
              />
            </SettingRow>

            {/* Enrollment Capacity */}
            <div className="p-4 rounded-2xl bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-violet-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">الحد الأقصى للتسجيل</p>
                    <p className="text-xs text-muted-foreground">
                      {course.enrollments_count} مسجل حالياً
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="بدون حد"
                    className="w-32 text-center font-bold"
                    {...form.register("enrollment_capacity", { valueAsNumber: true })}
                  />
                  <span className="text-xs text-muted-foreground">طالب</span>
                </div>
              </div>
            </div>

            {/* Allow Enrollment After Full */}
            <SettingRow
              icon={AlertTriangle}
              label="السماح بالتسجيل بعد امتلاء السعة"
              description="عند اكتمال العدد، يمكن للطلاب الجدد التسجيل في قائمة الانتظار"
              iconColor="text-amber-500"
            >
              <Switch
                checked={form.watch("allow_enrollment_after_full")}
                onCheckedChange={(checked) => form.setValue("allow_enrollment_after_full", checked)}
                disabled={!form.watch("enrollment_capacity")}
              />
            </SettingRow>

            {/* Enrollment Password */}
            <div className="p-4 rounded-2xl bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-red-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">كلمة مرور التسجيل</p>
                  <p className="text-xs text-muted-foreground">
                    اتركها فارغة إذا لم تكن محمية بكلمة مرور
                  </p>
                </div>
              </div>
              <div className="mt-3 mr-14">
                <Input
                  type="password"
                  placeholder="أدخل كلمة المرور (اختياري)"
                  className="max-w-sm"
                  {...form.register("enrollment_password")}
                  disabled={form.watch("visibility") !== "PASSWORD_PROTECTED"}
                />
              </div>
            </div>
          </div>
        </AdminCard>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Section 3: Content Settings */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AdminCard className="border-border/40">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <h3 className="text-lg font-black">إعدادات المحتوى</h3>
          </div>

          <div className="space-y-3">
            {/* Drip Content */}
            <SettingRow
              icon={Clock}
              label="إطلاق المحتوى تدريجياً"
              description="إطلاق الدروس والمحتوى بشكل تدريجي حسب جدول زمني"
              iconColor="text-blue-500"
            >
              <Switch
                checked={form.watch("drip_content_enabled")}
                onCheckedChange={(checked) => form.setValue("drip_content_enabled", checked)}
              />
            </SettingRow>

            {/* Require Previous Completion */}
            <SettingRow
              icon={CheckCircle2}
              label="إكمال الوحدة السابقة مطلوب"
              description="يجب على الطالب إكمال الوحدة السابقة قبل الانتقال للتالية"
              iconColor="text-emerald-500"
            >
              <Switch
                checked={form.watch("require_previous_completion")}
                onCheckedChange={(checked) => form.setValue("require_previous_completion", checked)}
              />
            </SettingRow>

            {/* Auto Complete */}
            <SettingRow
              icon={Zap}
              label="إكمال تلقائي عند مشاهدة آخر درس"
              description="تُحسب الدورة كمكتملة تلقائياً عند مشاهدة جميع الدروس"
              iconColor="text-amber-500"
            >
              <Switch
                checked={form.watch("auto_complete_on_last_lesson")}
                onCheckedChange={(checked) => form.setValue("auto_complete_on_last_lesson", checked)}
              />
            </SettingRow>
          </div>
        </AdminCard>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Section 4: Certificates */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AdminCard className="border-border/40">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-4 w-4 text-amber-500" />
            <h3 className="text-lg font-black">إعدادات الشهادات</h3>
          </div>

          <div className="space-y-3">
            {/* Allow Certificate Download */}
            <SettingRow
              icon={Download}
              label="السماح بتحميل الشهادة"
              description="يستطيع الطلاب تحميل الشهادة بعد إكمال الدورة"
              iconColor="text-emerald-500"
            >
              <Switch
                checked={form.watch("allow_certificate_download")}
                onCheckedChange={(checked) => form.setValue("allow_certificate_download", checked)}
              />
            </SettingRow>

            {/* Certificate Settings */}
            <div className="p-4 rounded-2xl bg-muted/20 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-amber-500">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">درجة النجاح للشهادة</p>
                  <p className="text-xs text-muted-foreground">النسبة المئوية المطلوبة للحصول على الشهادة</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 text-center font-bold"
                    {...form.register("certificate_passing_score", { valueAsNumber: true })}
                  />
                  <span className="text-sm font-bold text-muted-foreground">%</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-blue-500">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">عدد المحاولات للشهادة</p>
                  <p className="text-xs text-muted-foreground">عدد المحاولات المتاحة لاجتياز امتحان الشهادة</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    className="w-20 text-center font-bold"
                    {...form.register("max_certificate_attempts", { valueAsNumber: true })}
                  />
                  <span className="text-sm font-bold text-muted-foreground">محاولة</span>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Section 5: Community & Social */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AdminCard className="border-border/40">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <h3 className="text-lg font-black">ال community والتفاعل</h3>
          </div>

          <div className="space-y-3">
            {/* Show Student Count */}
            <SettingRow
              icon={Users}
              label="إظهار عدد الطلاب"
              description="يتم عرض عدد المسجلين في الدورة للزوار"
              iconColor="text-blue-500"
            >
              <Switch
                checked={form.watch("show_student_count")}
                onCheckedChange={(checked) => form.setValue("show_student_count", checked)}
              />
            </SettingRow>

            {/* Allow Reviews */}
            <SettingRow
              icon={Star}
              label="السماح بالتقييمات"
              description="يستطيع الطلاب تقييم الدورة وكتابة تعليقات"
              iconColor="text-amber-500"
            >
              <Switch
                checked={form.watch("allow_reviews")}
                onCheckedChange={(checked) => form.setValue("allow_reviews", checked)}
              />
            </SettingRow>

            {/* Allow Discussion */}
            <SettingRow
              icon={Sparkles}
              label="السماح بالمناقشة"
              description="يستطيع الطلاب المناقشة وطرح الأسئلة داخل الدورة"
              iconColor="text-emerald-500"
            >
              <Switch
                checked={form.watch("allow_discussion")}
                onCheckedChange={(checked) => form.setValue("allow_discussion", checked)}
              />
            </SettingRow>
          </div>
        </AdminCard>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Section 6: Danger Zone */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AdminCard className="border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-lg font-black text-red-600 dark:text-red-400">المنطقة الخطرة</h3>
          </div>

          <div className="space-y-3">
            {/* Duplicate Course */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Copy className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">نسخ الدورة</p>
                  <p className="text-xs text-muted-foreground">
                    إنشاء نسخة كاملة من الدورة مع جميع المحتوى
                  </p>
                </div>
              </div>
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => duplicateMutation.mutate()}
                loading={duplicateMutation.isPending}
                icon={Copy}
              >
                نسخ الدورة
              </AdminButton>
            </div>

            {/* Archive Course */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <Archive className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">أرشفة الدورة</p>
                  <p className="text-xs text-muted-foreground">
                    إخفاء الدورة من الموقع مع الحفاظ على بياناتها
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <AdminButton variant="outline" size="sm" icon={Archive} className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                    أرشفة
                  </AdminButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>أرشفة الدورة</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم إخفاء الدورة من الموقع ولن يمكن للطلاب الجدد الوصول إليها.
                      هل أنت متأكد من المتابعة؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={() => archiveMutation.mutate()}>
                      أرشفة
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Course */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">حذف الدورة</p>
                  <p className="text-xs text-red-500/80 font-bold">
                    حذف نهائي لا يمكن التراجع عنه
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <AdminButton variant="destructive" size="sm" icon={Trash2}>
                    حذف الدورة
                  </AdminButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">حذف الدورة نهائياً</AlertDialogTitle>
                    <AlertDialogDescription>
                      هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الدورة وجميع بياناتها نهائياً.
                      <br /><br />
                      <strong>عدد الطلاب المسجلين:</strong> {course.enrollments_count}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      حذف نهائياً
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </AdminCard>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Save Button */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/50 sticky bottom-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>يتم حفظ جميع التغييرات فوراً عند الضغط على حفظ</span>
          </div>
          <AdminButton
            type="submit"
            loading={saveMutation.isPending}
            icon={Save}
            className="px-8 font-black"
          >
            حفظ الإعدادات
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
