"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, ShieldAlert, BookOpen, Clock, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";

interface TeacherApplication {
  id: string;
  name: string;
  email: string;
  experience: string;
  bio: string;
  code: string;
  appliedAt: string;
}

export default function TeacherApplicationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading, refetch } = useQuery<TeacherApplication[]>({
    queryKey: ["admin", "teacher-applications"],
    queryFn: async () => {
      const response = await adminFetch("/api/admin/teachers/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      const res = await response.json();
      return res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, name, approved }: { id: string; name: string; approved: boolean }) => {
      const response = await adminFetch(`/api/admin/teachers/applications?id=${id}&approve=${approved}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to process application action");
      }
      return { name, approved };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teacher-applications"] });
      if (data.approved) {
        toast.success(`تمت الموافقة على طلب ${data.name} وتحديث رتبته إلى معلم بنجاح!`);
      } else {
        toast.error(`تم رفض طلب ${data.name} وإخطاره بالبريد الإلكتروني.`);
      }
    },
    onError: () => {
      toast.error("فشل في معالجة طلب المعلم");
    },
  });

  const handleApprove = (id: string, name: string) => {
    deleteMutation.mutate({ id, name, approved: true });
  };

  const handleReject = (id: string, name: string) => {
    deleteMutation.mutate({ id, name, approved: false });
  };

  const columns: ColumnDef<TeacherApplication>[] = [
    {
      accessorKey: "name",
      header: "المتقدم والبريد",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {app.name?.charAt(0) || "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-sm">{app.name}</p>
              <p className="text-[10px] text-muted-foreground">{app.email}</p>
              <p className="text-[9px] font-mono text-primary font-bold">{app.code}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "experience",
      header: "سنوات الخبرة",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.original.experience}</span>
        </div>
      ),
    },
    {
      accessorKey: "bio",
      header: "النبذة التعريفية",
      cell: ({ row }) => (
        <p className="text-xs text-muted-foreground max-w-sm line-clamp-2 leading-relaxed">
          {row.original.bio}
        </p>
      ),
    },
    {
      accessorKey: "appliedAt",
      header: "تاريخ التقديم",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(row.original.appliedAt).toLocaleDateString("ar-EG")}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApprove(app.id, app.name)}
              disabled={deleteMutation.isPending}
              className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors group"
              title="قبول الطلب"
            >
              <Check className="h-4.5 w-4.5 text-emerald-500 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => handleReject(app.id, app.name)}
              disabled={deleteMutation.isPending}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors group"
              title="رفض الطلب"
            >
              <X className="h-4.5 w-4.5 text-red-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20 text-right" dir="rtl">
      <PageHeader
        title="طلبات انضمام المعلمين 📝"
        description="مراجعة واعتماد طلبات الطلاب المتقدمين للتدريس على منصة TOLO."
      >
        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            icon={ArrowRight}
            onClick={() => router.push("/admin/teachers")}
            className="rounded-2xl border-white/20 text-xs"
          >
            العودة لقائمة المعلمين
          </AdminButton>
        </div>
      </PageHeader>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable
          columns={columns}
          data={applications}
          loading={isLoading || deleteMutation.isPending}
          searchKey="name"
          searchPlaceholder="ابحث عن متقدم باسمه..."
          serverSide={false}
        />
      </div>
    </div>
  );
}
