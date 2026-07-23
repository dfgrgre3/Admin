"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield, CreditCard, BookOpen, Award, Star, FileText, Activity, Monitor, Flag, Settings, Eye, EyeOff, Lock, Unlock, CheckCircle, XCircle, Clock, TrendingUp, Users, Building2, GraduationCap, UserCheck, UserX, Globe, DollarSign, BarChart3, FileCheck, AlertTriangle, Edit, Trash2, Download, Upload, Plus, Save, X } from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { InstructorDocumentsTab } from "@/app/(admin)/admin/instructors/_components/instructor-documents-tab";
import { InstructorContractTab } from "@/app/(admin)/admin/instructors/_components/instructor-contract-tab";
import { InstructorPayoutsTab } from "@/app/(admin)/admin/instructors/_components/instructor-payouts-tab";
import { InstructorPerformanceTab } from "@/app/(admin)/admin/instructors/_components/instructor-performance-tab";
import { InstructorViolationsTab } from "@/app/(admin)/admin/instructors/_components/instructor-violations-tab";
import { useInstructor } from "@/hooks/use-instructors";
import { toast } from "sonner";

interface Instructor {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  phone?: string;
  country?: string;
  status: string;
  role: string;
  specialties: string[];
  languages: string[];
  commissionRate: number;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  bio?: string;
  experience?: number;
  isVerified: boolean;
  documents?: {
    id: string;
    type: string;
    status: string;
    url: string;
  }[];
}

export default function InstructorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const instructorId = params.id as string;

  const { data, isLoading, error, refetch } = useInstructor(instructorId);
  const instructor = data?.instructor as Instructor | undefined;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: "قيد الانتظار", variant: "secondary" },
      UNDER_REVIEW: { label: "قيد المراجعة", variant: "default" },
      APPROVED: { label: "موافق عليه", variant: "default" },
      REJECTED: { label: "مرفوض", variant: "destructive" },
      SUSPENDED: { label: "موقوف", variant: "outline" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/admin/instructors/${instructorId}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        toast.success("تم قبول المدرّس بنجاح");
        await refetch();
      } else {
        toast.error("فشل في قبول المدرّس");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/admin/instructors/${instructorId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "لم يستوفِ الشروط المطلوبة" }),
      });
      if (response.ok) {
        toast.success("تم رفض المدرّس بنجاح");
        await refetch();
      } else {
        toast.error("فشل في رفض المدرّس");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleSuspend = async () => {
    try {
      const response = await fetch(`/api/admin/instructors/${instructorId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "مخالفة السياسات", duration: 30 }),
      });
      if (response.ok) {
        toast.success("تم إيقاف المدرّس بنجاح");
        await refetch();
      } else {
        toast.error("فشل في إيقاف المدرّس");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20" dir="rtl">
        <PageHeader title="جاري التحميل..." description="يرجى الانتظار" />
        <AdminCard variant="glass" className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="space-y-6 pb-20" dir="rtl">
        <PageHeader title="غير موجود" description="المدرّس غير موجود أو حدث خطأ" />
        <AdminCard variant="glass" className="p-6 text-center">
          <p className="text-muted-foreground">تعذر تحميل بيانات المدرّس</p>
          <AdminButton variant="outline" icon={ArrowLeft} onClick={() => router.push("/admin/instructors")} className="mt-4">
            العودة للقائمة
          </AdminButton>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title={`المدرّس: ${instructor.name || instructor.username}`}
        description={`الحالة: ${instructor.status} • العمولة: ${instructor.commissionRate}% • التقييم: ${instructor.rating}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton variant="outline" icon={ArrowLeft} onClick={() => router.push("/admin/instructors")} className="rounded-xl border-white/10">
            العودة
          </AdminButton>
          <AdminButton variant="outline" icon={Edit} onClick={() => router.push(`/admin/instructors/${instructorId}/edit`)} className="rounded-xl border-white/10">
            تعديل
          </AdminButton>
          {instructor.status === "PENDING" && (
            <AdminButton variant="premium" icon={CheckCircle} onClick={handleApprove} className="rounded-xl shadow-xl">
              قبول
            </AdminButton>
          )}
          {instructor.status === "PENDING" && (
            <AdminButton variant="destructive" icon={XCircle} onClick={handleReject} className="rounded-xl">
              رفض
            </AdminButton>
          )}
          {instructor.status === "APPROVED" && (
            <AdminButton variant="outline" icon={UserX} onClick={handleSuspend} className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10">
              إيقاف
            </AdminButton>
          )}
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">الطلاب</p>
              <p className="text-2xl font-black">{formatNumber(instructor.totalStudents)}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">الكورسات</p>
              <p className="text-2xl font-black">{instructor.totalCourses}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">التقييم</p>
              <p className="text-2xl font-black">{instructor.rating.toFixed(1)}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">الإيرادات</p>
              <p className="text-2xl font-black">{formatCurrency(instructor.totalRevenue)}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => router.push(`/admin/instructors/${instructorId}`)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground"
          >
            نظرة عامة
          </button>
          <button
            onClick={() => router.push(`/admin/instructors/${instructorId}/documents`)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            المستندات
          </button>
          <button
            onClick={() => router.push(`/admin/instructors/${instructorId}/contract`)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            العقد
          </button>
          <button
            onClick={() => router.push(`/admin/instructors/${instructorId}/payouts`)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            المدفوعات
          </button>
          <button
            onClick={() => router.push(`/admin/instructors/${instructorId}/performance`)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            الأداء
          </button>
          <button
            onClick={() => router.push(`/admin/instructors/${instructorId}/violations`)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            المخالفات
          </button>
        </div>

        {/* Overview Tab Content */}
        <div className="space-y-6">
          {/* Profile Info */}
          <AdminCard variant="glass" className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-bold">الاسم الكامل</p>
                <p className="font-bold">{instructor.name || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">البريد الإلكتروني</p>
                <p className="font-bold flex items-center gap-2">
                  {instructor.email}
                  {instructor.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الهاتف</p>
                <p className="font-bold">{instructor.phone || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الدولة</p>
                <p className="font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {instructor.country || "غير محدد"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">تاريخ الانضمام</p>
                <p className="font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(instructor.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">آخر نشاط</p>
                <p className="font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {instructor.lastActive ? formatDate(instructor.lastActive) : "لم يسجل دخول بعد"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الحالة</p>
                <p className="font-bold">{getStatusBadge(instructor.status)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">نسبة العمولة</p>
                <p className="font-bold text-primary">{instructor.commissionRate}%</p>
              </div>
            </div>
          </AdminCard>

          {/* Bio & Specialties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminCard variant="glass" className="p-6">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                النبذة الشخصية
              </h3>
              <p className="text-white/80 whitespace-pre-wrap">{instructor.bio || "لا توجد نبذة"}</p>
            </AdminCard>

            <AdminCard variant="glass" className="p-6">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                التخصصات
              </h3>
              <div className="flex flex-wrap gap-2">
                {instructor.specialties.length > 0 ? (
                  instructor.specialties.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {spec}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">عام</Badge>
                )}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  اللغات
                </h4>
                <div className="flex flex-wrap gap-2">
                  {instructor.languages.length > 0 ? (
                    instructor.languages.map((lang, idx) => (
                      <Badge key={idx} variant="default" className="text-sm">
                        {lang}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">العربية</Badge>
                  )}
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      </div>
    </div>
  );
}