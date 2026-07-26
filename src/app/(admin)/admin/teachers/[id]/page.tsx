"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, BookOpen, Star, Calendar, Mail, Phone, Globe, 
  Edit, ArrowRight, Users, Trophy, TrendingUp, Clock, CheckCircle2, 
  XCircle, AlertCircle, Video, FileText, DollarSign, History, ShieldCheck,
  Monitor, MapPin, Languages, Award, Target, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { ColumnDef } from "@tanstack/react-table";


interface TeacherDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  subjectId: string;
  onlineUrl?: string;
  rating: number;
  notes?: string;
  bio?: string;
  status?: string;
  country?: string;
  city?: string;
  specialties?: string[];
  languages?: string[];
  commissionRate?: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  subject?: {
    id: string;
    name: string;
    nameAr?: string;
    color?: string;
  };
  stats?: {
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
    totalHours: number;
    totalRevenue?: number;
    completedLessons?: number;
    activeCourses?: number;
  };
}

interface Course {
  id: string;
  title: string;
  status: string;
  studentsCount: number;
  lessonsCount: number;
  completionRate: number;
  revenue: number;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  chapter: string;
  course: string;
  published: boolean;
  views: number;
  duration: number;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  progress: number;
  attendance: number;
  lastActivity: string;
  enrolledAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

export default function AdminTeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "teachers", teacherId],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.instructorById(teacherId));
      if (!response.ok) throw new Error("Failed to fetch teacher details");
      return response.json();
    },
    enabled: !!teacherId,
  });

  const { data: performance } = useQuery({
    queryKey: ["admin", "instructor-performance", teacherId],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.instructorPerformance(teacherId));
      if (!response.ok) throw new Error("Failed to fetch performance data");
      return response.json();
    },
    enabled: !!teacherId,
  });

  const teacher: TeacherDetail | undefined = data?.instructor || data?.teacher || data;

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
      APPROVED: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "نشط" },
      ACTIVE: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "نشط" },
      PENDING: { icon: Clock, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "قيد المراجعة" },
      UNDER_REVIEW: { icon: Clock, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "قيد المراجعة" },
      SUSPENDED: { icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", label: "موقوف" },
      REJECTED: { icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", label: "مرفوض" },
    };

    const config = statusConfig[status || ""] || statusConfig.PENDING;
    if (!config) return null;
    
    const Icon = config.icon;

    return (
      <Badge className={`gap-1.5 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20" dir="rtl">
        <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-bold">لم يتم العثور على المعلم</p>
          <AdminButton 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push("/admin/teachers")}
          >
            العودة لقائمة المعلمين
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title={`المعلم: ${teacher.name}`}
        description="عرض وتعديل بيانات المعلم وربطه بالمواد الدراسية."
      >
        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            icon={Edit}
            onClick={() => router.push(`/admin/teachers/${teacherId}/edit`)}
          >
            تعديل البيانات
          </AdminButton>
          <AdminButton
            variant="outline"
            icon={ArrowRight}
            onClick={() => router.push("/admin/teachers")}
          >
            العودة للقائمة
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStatsCard
          title="إجمالي الطلاب"
          value={teacher.stats?.totalStudents || 0}
          icon={Users}
          color="blue"
          description="طالب مسجل"
        />
        <AdminStatsCard
          title="إجمالي الدورات"
          value={teacher.stats?.totalCourses || 0}
          icon={BookOpen}
          color="green"
          description="دورة دراسية"
        />
        <AdminStatsCard
          title="الدروس المكتملة"
          value={teacher.stats?.completedLessons || 0}
          icon={FileText}
          color="purple"
          description="درس منشور"
        />
        <AdminStatsCard
          title="ساعات التدريس"
          value={teacher.stats?.totalHours || 0}
          icon={Clock}
          color="amber"
          description="ساعة تدريس"
        />
        <AdminStatsCard
          title="متوسط التقييم"
          value={teacher.rating || 0}
          icon={Star}
          color="yellow"
          description="من 5 نجوم"
        />
        <AdminStatsCard
          title="إجمالي الإيرادات"
          value={teacher.stats?.totalRevenue || 0}
          icon={DollarSign}
          color="green"
          description="ريال"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Info Card */}
        <div className="lg:col-span-1">
          <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20 mb-4">
                <AvatarImage src={teacher.avatar || ""} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {teacher.name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-black">{teacher.name}</h3>
              <p className="text-sm text-muted-foreground">{teacher.email}</p>
              {teacher.subject && (
                <Badge className="mt-2" style={{ backgroundColor: teacher.subject.color + '20', color: teacher.subject.color }}>
                  {teacher.subject.nameAr || teacher.subject.name}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الحالة</span>
                {getStatusBadge(teacher.status)}
              </div>
              {teacher.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teacher.phone}</span>
                </div>
              )}
              {teacher.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teacher.country}{teacher.city && `, ${teacher.city}`}</span>
                </div>
              )}
              {teacher.onlineUrl && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={teacher.onlineUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    الرابط الشخصي
                  </a>
                </div>
              )}
              {teacher.commissionRate && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">نسبة العمولة: {teacher.commissionRate}%</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  انضم في {new Date(teacher.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
              {teacher.lastLogin && (
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    آخر تسجيل دخول: {new Date(teacher.lastLogin).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full bg-background/50 h-14 p-1 border-border rounded-xl mb-6 overflow-x-auto">
              <TabsTrigger value="overview" className="flex-shrink-0 h-full text-base font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex-shrink-0 h-full text-base font-bold rounded-lg data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500">
                الدورات
              </TabsTrigger>
              <TabsTrigger value="students" className="flex-shrink-0 h-full text-base font-bold rounded-lg data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
                الطلاب
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex-shrink-0 h-full text-base font-bold rounded-lg data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500">
                الأداء
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex-shrink-0 h-full text-base font-bold rounded-lg data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500">
                الإيرادات
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-shrink-0 h-full text-base font-bold rounded-lg data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500">
                النشاط
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  إحصائيات الأداء
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-accent/20 rounded-xl">
                    <p className="text-2xl font-black text-primary">{teacher.stats?.totalHours || 0}</p>
                    <p className="text-xs text-muted-foreground font-bold">ساعة تدريس</p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-xl">
                    <p className="text-2xl font-black text-green-500">{teacher.stats?.averageRating || teacher.rating || 0}</p>
                    <p className="text-xs text-muted-foreground font-bold">تقييم الطلاب</p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-xl">
                    <p className="text-2xl font-black text-blue-500">{teacher.stats?.completedLessons || 0}</p>
                    <p className="text-xs text-muted-foreground font-bold">درس مكتمل</p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-xl">
                    <p className="text-2xl font-black text-emerald-500">{teacher.stats?.activeCourses || 0}</p>
                    <p className="text-xs text-muted-foreground font-bold">دورة نشطة</p>
                  </div>
                </div>
              </div>

              {(teacher.bio || teacher.notes) && (
                <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    نبذة تعريفية
                  </h3>
                  <p className="text-sm text-muted-foreground">{teacher.bio || teacher.notes}</p>
                </div>
              )}

              {teacher.specialties && teacher.specialties.length > 0 && (
                <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    التخصصات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specialties.map((spec, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {teacher.languages && teacher.languages.length > 0 && (
                <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    اللغات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.languages.map((lang, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    الدورات المسندة
                  </h3>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/courses?action=new&teacherId=${teacherId}`)}
                  >
                    إضافة دورة
                  </AdminButton>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم إضافة دورات بعد</p>
                  <p className="text-xs mt-2">سيتم عرض الدورات المسندة للمعلم هنا</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    الطلاب المسجلين
                  </h3>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم تسجيل طلاب بعد</p>
                  <p className="text-xs mt-2">سيتم عرض الطلاب المسجلين في دورات المعلم هنا</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-yellow-500" />
                  تقييم الأداء
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl">
                    <span className="font-bold">تقييم عام</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${star <= (teacher.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/20 rounded-xl">
                      <p className="text-2xl font-black text-primary">{teacher.stats?.totalHours || 0}</p>
                      <p className="text-xs text-muted-foreground font-bold">ساعة تدريس</p>
                    </div>
                    <div className="p-4 bg-accent/20 rounded-xl">
                      <p className="text-2xl font-black text-green-500">{teacher.stats?.completedLessons || 0}</p>
                      <p className="text-xs text-muted-foreground font-bold">درس مكتمل</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  الإيرادات
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-accent/20 rounded-xl">
                    <p className="text-2xl font-black text-emerald-500">{teacher.stats?.totalRevenue || 0}</p>
                    <p className="text-xs text-muted-foreground font-bold">إجمالي الإيرادات</p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-xl">
                    <p className="text-2xl font-black text-blue-500">{teacher.commissionRate || 0}%</p>
                    <p className="text-xs text-muted-foreground font-bold">نسبة العمولة</p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground mt-4">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>سيتم عرض تفاصيل الإيرادات والمدفوعات هنا</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="admin-glass p-6 rounded-[2rem] border border-white/10">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-500" />
                  سجل النشاط
                </h3>
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>سيتم عرض سجل نشاط المعلم هنا</p>
                  <p className="text-xs mt-2">تسجيلات الدخول، التعديلات، والعمليات الأخرى</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}