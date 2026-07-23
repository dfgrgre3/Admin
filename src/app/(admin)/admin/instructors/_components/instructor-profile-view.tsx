"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  BookOpen,
  Award,
  Star,
  FileText,
  Activity,
  Monitor,
  Flag,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  UserX,
  Globe,
  DollarSign,
  BarChart3,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { InstructorDocumentsTab } from "./instructor-documents-tab";
import { InstructorContractTab } from "./instructor-contract-tab";
import { InstructorPayoutsTab } from "./instructor-payouts-tab";
import { InstructorPerformanceTab } from "./instructor-performance-tab";
import { InstructorViolationsTab } from "./instructor-violations-tab";

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

interface InstructorProfileViewProps {
  instructor: Instructor;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function InstructorProfileView({
  instructor,
  onClose,
  onEdit,
  onDelete,
}: InstructorProfileViewProps) {
  const [activeTab, setActiveTab] = React.useState("overview");

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: "قيد الانتظار", variant: "secondary" },
      UNDER_REVIEW: { label: "قيد المراجعة", variant: "default" },
      APPROVED: { label: "موافق عليه", variant: "default" },
      REJECTED: { label: "مرفوض", variant: "destructive" },
      SUSPENDED: { label: "موقوف", variant: "outline" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    if (!config) {
      return <Badge variant="secondary">قيد الانتظار</Badge>;
    }
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={instructor.avatar || ""} />
            <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
              {instructor.name?.charAt(0) || "I"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-black">{instructor.name || instructor.username || "بدون اسم"}</h2>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(instructor.status)}
              {instructor.isVerified && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  موثق
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            تعديل
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-all"
          >
            حذف
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-card rounded-xl transition-all"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10">
          <TabsTrigger value="overview" className="rounded-xl">نظرة عامة</TabsTrigger>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="courses">الكورسات</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
          <TabsTrigger value="contract">العقد</TabsTrigger>
          <TabsTrigger value="payouts">المدفوعات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="violations">المخالفات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                  {instructor.lastActive ? formatDate(instructor.lastActive) : "لم يسجل نشاط"}
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard variant="glass" className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              الإحصائيات المالية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-muted-foreground font-bold">نسبة العمولة</p>
                <p className="text-2xl font-black text-primary">{instructor.commissionRate}%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-muted-foreground font-bold">إجمالي الإيرادات</p>
                <p className="text-2xl font-black text-green-500">{formatCurrency(instructor.totalRevenue)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-muted-foreground font-bold">عدد الطلاب</p>
                <p className="text-2xl font-black">{formatNumber(instructor.totalStudents)}</p>
              </div>
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <AdminCard variant="glass" className="p-6">
            <h3 className="text-xl font-black mb-4">الملف الشخصي</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-bold">النبذة</p>
                <p className="font-bold">{instructor.bio || "لا توجد نبذة"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">التخصصات</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {instructor.specialties.map((spec, idx) => (
                    <Badge key={idx} variant="outline">{spec}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">اللغات</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {instructor.languages.map((lang, idx) => (
                    <Badge key={idx} variant="secondary">{lang}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">سنوات الخبرة</p>
                <p className="font-bold">{instructor.experience || 0} سنة</p>
              </div>
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <AdminCard variant="glass" className="p-6">
            <h3 className="text-xl font-black mb-4">الكورسات</h3>
            <p className="text-muted-foreground">سيتم عرض قائمة الكورسات هنا</p>
          </AdminCard>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <InstructorDocumentsTab instructorId={instructor.id} />
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <InstructorContractTab instructorId={instructor.id} />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <InstructorPayoutsTab instructorId={instructor.id} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <InstructorPerformanceTab instructorId={instructor.id} />
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <InstructorViolationsTab instructorId={instructor.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}