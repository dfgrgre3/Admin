"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Tag,
  Globe,
  Clock,
  DollarSign,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface CourseGeneralData {
  id: string;
  name: string;
  nameAr: string | null;
  code: string | null;
  slug: string | null;
  description: string | null;
  shortDescription: string | null;
  level: string;
  language: string;
  status: string;
  visibility: string;
  isPublished: boolean;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  currency: string;
  categoryId: string | null;
  categoryName: string | null;
  instructorId: string | null;
  instructorName: string | null;
  durationHours: number | null;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function CourseGeneralPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { hasPermission } = usePermission();
  const canViewCourses = hasPermission(PERMISSIONS.SUBJECTS_VIEW);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "general"],
    queryFn: async (): Promise<CourseGeneralData> => {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`);
      if (!response.ok) throw new Error("فشل تحميل بيانات الدورة");
      const result = await response.json();
      return result.data?.course || result.data || result;
    },
    staleTime: 60_000,
  });

  const course = courseData;

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-64 bg-muted/30 rounded-xl animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
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
          <p className="text-sm text-muted-foreground/60 mt-2">يرجى المحاولة مرة أخرى أو التحقق من صلاحياتك</p>
        </div>
      </div>
    );
  }

  if (!canViewCourses) {
    return (
      <div className="flex h-[60vh] items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
          <p className="text-lg font-bold text-muted-foreground">ليس لديك صلاحية لعرض هذه الصفحة</p>
          <p className="text-sm text-muted-foreground/60 mt-2">يرجى التواصل مع المسؤول للحصول على الصلاحيات المطلوبة</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const levelLabels: Record<string, string> = {
    BEGINNER: "مبتدئ",
    INTERMEDIATE: "متوسط",
    ADVANCED: "متقدم",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "مسودة",
    PUBLISHED: "منشورة",
    ARCHIVED: "مؤرشفة",
  };

  const visibilityLabels: Record<string, string> = {
    PUBLIC: "عامة",
    PRIVATE: "خاصة",
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-3xl font-black tracking-tight">المعلومات العامة</h2>
        <p className="text-sm font-bold text-muted-foreground mt-1">
          عرض وتفاصيل المعلومات الأساسية للدورة
        </p>
      </div>

      {/* Basic Information */}
      <AdminCard className="border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">المعلومات الأساسية</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { label: "معرف الدورة", value: course.id, icon: Tag },
            { label: "كود الدورة", value: course.code || "—", icon: Tag },
            { label: "العنوان (عربي)", value: course.nameAr || "—", icon: BookOpen },
            { label: "العنوان (إنجليزي)", value: course.name || "—", icon: BookOpen },
            { label: "Slug", value: course.slug || "—", icon: Globe },
            { label: "الوصف المختصر", value: course.shortDescription || "—", icon: BookOpen },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
              <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl">{item.value}</p>
            </div>
          ))}
        </div>

        {course.description && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              الوصف الكامل
            </div>
            <p className="text-sm font-bold bg-muted/30 p-4 rounded-xl leading-relaxed">
              {course.description}
            </p>
          </div>
        )}
      </AdminCard>

      {/* Course Details */}
      <AdminCard className="border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">تفاصيل الدورة</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "المستوى", value: levelLabels[course.level] || course.level, icon: Tag },
            { label: "اللغة", value: course.language === "ar" ? "العربية" : "إنجليزية", icon: Globe },
            { label: "مدة الدورة", value: course.durationHours ? `${course.durationHours} ساعة` : "—", icon: Clock },
            { label: "التصنيف", value: course.categoryName || "—", icon: Tag },
            { label: "السعر", value: course.price === 0 ? "مجانية" : `${course.price} ${course.currency}`, icon: DollarSign },
            { label: "المعلم", value: course.instructorName || "—", icon: User },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
              <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl">{item.value}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Status & Visibility */}
      <AdminCard className="border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">الحالة والظهور</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                {course.isPublished ? (
                  <Eye className="h-5 w-5 text-emerald-500" />
                ) : (
                  <EyeOff className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-bold">حالة النشر</p>
                  <p className="text-[10px] text-muted-foreground">منشورة للطلاب</p>
                </div>
              </div>
              <Badge
                className={cn(
                  "font-black text-[10px] px-3",
                  course.isPublished
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}
              >
                {course.isPublished ? "منشورة" : "مسودة"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                {course.isActive ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-bold">حالة التفعيل</p>
                  <p className="text-[10px] text-muted-foreground">متاحة للتسجيل</p>
                </div>
              </div>
              <Badge
                className={cn(
                  "font-black text-[10px] px-3",
                  course.isActive
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}
              >
                {course.isActive ? "مفعلة" : "موقوفة"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">الظهور</p>
                  <p className="text-[10px] text-muted-foreground">قابلية الاكتشاف</p>
                </div>
              </div>
              <Badge
                className={cn(
                  "font-black text-[10px] px-3",
                  course.visibility === "PUBLIC"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                )}
              >
                {visibilityLabels[course.visibility] || course.visibility}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold">مميزة</p>
                  <p className="text-[10px] text-muted-foreground">معروضة في البانر</p>
                </div>
              </div>
              <Badge
                className={cn(
                  "font-black text-[10px] px-3",
                  course.isFeatured
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-muted text-muted-foreground border-border/50"
                )}
              >
                {course.isFeatured ? "مميزة" : "عادية"}
              </Badge>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* SEO Information */}
      <AdminCard className="border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">معلومات SEO</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
              <Globe className="h-3 w-3" />
              عنوان SEO
            </div>
            <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl">{course.seoTitle || "—"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
              <Globe className="h-3 w-3" />
              وصف SEO
            </div>
            <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl">{course.seoDescription || "—"}</p>
          </div>
        </div>
      </AdminCard>

      {/* Timeline */}
      <AdminCard className="border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">التسلسل الزمني</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "تاريخ الإنشاء", value: formatDate(course.createdAt), icon: Calendar },
            { label: "آخر تحديث", value: formatDate(course.updatedAt), icon: Calendar },
            { label: "تاريخ النشر", value: formatDate(course.publishedAt), icon: CheckCircle2 },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
              <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl">{item.value}</p>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
