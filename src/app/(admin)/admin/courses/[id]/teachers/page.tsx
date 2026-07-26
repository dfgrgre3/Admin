"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Mail,
  Calendar,
  Shield,
  X,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface CourseTeacher {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface TeachersResponse {
  data: {
    teachers: CourseTeacher[];
  };
}

interface AvailableTeachersResponse {
  data: {
    teachers: Teacher[];
  };
}

export default function CourseTeachersPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManageCourses = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);
  const canViewCourses = hasPermission(PERMISSIONS.SUBJECTS_VIEW);
  const [search, setSearch] = React.useState("");
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("INSTRUCTOR");

  const { data: teachersData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "courses", courseId, "teachers"],
    queryFn: async (): Promise<TeachersResponse> => {
      const response = await adminFetch(apiRoutes.admin.courseTeachers(courseId));
      if (!response.ok) throw new Error("فشل تحميل المعلمين");
      return response.json();
    },
    staleTime: 30_000,
  });

  const { data: availableTeachersData } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: async (): Promise<AvailableTeachersResponse> => {
      const response = await adminFetch(apiRoutes.admin.teachers);
      if (!response.ok) throw new Error("فشل تحميل المعلمين المتاحين");
      return response.json();
    },
    staleTime: 60_000,
  });

  const assignTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await adminFetch(
        apiRoutes.admin.courseTeachers(courseId),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, role: selectedRole }),
        }
      );
      if (!response.ok) throw new Error("فشل تعيين المعلم");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تعيين المعلم بنجاح");
      setAssignDialogOpen(false);
      setSelectedTeacherId("");
      setSelectedRole("INSTRUCTOR");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId, "teachers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    },
  });

  const removeTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await adminFetch(
        `${apiRoutes.admin.courseTeachers(courseId)}/${teacherId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("فشل إزالة المعلم");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم إزالة المعلم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId, "teachers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    },
  });

  const teachers = React.useMemo(() => teachersData?.data?.teachers ?? [], [teachersData]);
  const availableTeachers = React.useMemo(() => availableTeachersData?.data?.teachers ?? [], [availableTeachersData]);

  const filteredTeachers = React.useMemo(() => {
    if (!search) return teachers;
    const searchLower = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.email.toLowerCase().includes(searchLower)
    );
  }, [teachers, search]);

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-64 bg-muted/30 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted/30 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
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

  const roleLabels: Record<string, string> = {
    INSTRUCTOR: "المحاضر الرئيسي",
    ASSISTANT: "مساعد",
    CO_INSTRUCTOR: "محاضر مشارك",
  };

  const handleAssignTeacher = () => {
    if (!selectedTeacherId) {
      toast.error("يرجى اختيار معلم");
      return;
    }
    assignTeacherMutation.mutate(selectedTeacherId);
  };

  const handleRemoveTeacher = (teacherId: string) => {
    removeTeacherMutation.mutate(teacherId);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">المعلمين</h2>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            إدارة المعلمين المسؤولين عن هذه الدورة
          </p>
        </div>
        <AdminButton
          className="gap-2 rounded-xl h-11 px-6 font-black"
          onClick={() => setAssignDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          تعيين معلم
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي المعلمين",
            value: teachers.length,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/15",
          },
          {
            label: "محاضرين رئيسيين",
            value: teachers.filter((t) => t.role === "INSTRUCTOR").length,
            icon: Shield,
            color: "text-emerald-500",
            bg: "bg-emerald-500/15",
          },
          {
            label: "مساعدين",
            value: teachers.filter((t) => t.role === "ASSISTANT").length,
            icon: Users,
            color: "text-violet-500",
            bg: "bg-violet-500/15",
          },
          {
            label: "محاضرين مشاركين",
            value: teachers.filter((t) => t.role === "CO_INSTRUCTOR").length,
            icon: Users,
            color: "text-amber-500",
            bg: "bg-amber-500/15",
          },
        ].map((stat, i) => (
          <AdminCard key={i} className="p-5 relative overflow-hidden group border-border/40">
            <div
              className={cn(
                "absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-20",
                stat.bg
              )}
            />
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
          </AdminCard>
        ))}
      </div>

      {/* Search */}
      <AdminCard className="p-4 border-border/40">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن معلم بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pr-10 rounded-xl text-sm font-bold"
          />
        </div>
      </AdminCard>

      {/* Teachers List */}
      <AdminCard className="border-border/40 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary" />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center p-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-muted-foreground">
              {search ? "لا توجد نتائج للبحث" : "لا يوجد معلمين معينين لهذه الدورة"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-lg">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{teacher.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    className={cn(
                      "font-black text-[10px] px-3 rounded-lg",
                      teacher.role === "INSTRUCTOR"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : teacher.role === "ASSISTANT"
                        ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}
                  >
                    {roleLabels[teacher.role] || teacher.role}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(teacher.assignedAt).toLocaleDateString("ar-EG")}
                  </div>
                  <AdminButton
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleRemoveTeacher(teacher.id)}
                    disabled={removeTeacherMutation.isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Assign Teacher Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">تعيين معلم جديد</DialogTitle>
            <DialogDescription className="text-sm font-bold text-muted-foreground">
              اختر المعلم ودوره في هذه الدورة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">المعلم</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger className="h-11 rounded-xl font-bold">
                  <SelectValue placeholder="اختر معلم" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">الدور</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-11 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTRUCTOR">المحاضر الرئيسي</SelectItem>
                  <SelectItem value="ASSISTANT">مساعد</SelectItem>
                  <SelectItem value="CO_INSTRUCTOR">محاضر مشارك</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <AdminButton
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className="rounded-xl font-bold"
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </AdminButton>
            <AdminButton
              onClick={handleAssignTeacher}
              disabled={!selectedTeacherId || assignTeacherMutation.isPending}
              className="rounded-xl font-black"
            >
              <UserPlus className="h-4 w-4 ml-2" />
              تعيين
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
