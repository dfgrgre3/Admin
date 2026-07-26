"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import {
  Award,
  Users,
  Calendar,
  Download,
  Search,
  FileText,
  CheckCircle2,
  Shield,
  XCircle,
} from "lucide-react";

interface CourseCertificate {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  issuedAt: string;
  certificateUrl: string;
  status: "issued" | "revoked";
}

interface CertificatesResponse {
  data: {
    certificates: CourseCertificate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function CourseCertificatesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { hasPermission } = usePermission();
  const canViewCourses = hasPermission(PERMISSIONS.SUBJECTS_VIEW);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);

  const deferredSearch = React.useDeferredValue(search);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "admin",
      "courses",
      courseId,
      "certificates",
      page,
      limit,
      deferredSearch,
    ],
    queryFn: async (): Promise<CertificatesResponse> => {
      const params = new URLSearchParams({
        offset: String((page - 1) * limit),
        limit: limit.toString(),
      });

      if (deferredSearch) params.set("search", deferredSearch);

      const response = await adminFetch(
        `${apiRoutes.admin.courses}/${courseId}/certificates?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل تحميل الشهادات");
      return (await response.json()) as CertificatesResponse;
    },
    staleTime: 30_000,
  });

  const certificates = React.useMemo(() => data?.data?.certificates ?? [], [data]);
  const statsData = React.useMemo(() => ({
    total: certificates.length,
    issued: certificates.filter((certificate) => certificate.status === "issued").length,
    revoked: certificates.filter((certificate) => certificate.status === "revoked").length,
  }), [certificates]);
  const pagination = data?.data?.pagination;
  const totalPages = React.useMemo(() => {
    if (!pagination) return 1;
    return pagination.totalPages || 1;
  }, [pagination]);

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-64 bg-muted/30 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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

  const handleDownload = (certificateUrl: string) => {
    window.open(certificateUrl, "_blank");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">الشهادات</h2>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            إدارة الشهادات المصدرة للطلاب الذين أكملوا الدورة
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "إجمالي الشهادات",
            value: statsData.total,
            icon: Award,
            color: "text-blue-500",
            bg: "bg-blue-500/15",
          },
          {
            label: "صادرة",
            value: statsData.issued,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/15",
          },
          {
            label: "ملغاة",
            value: statsData.revoked,
            icon: FileText,
            color: "text-red-500",
            bg: "bg-red-500/15",
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
            placeholder="البحث عن طالب بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pr-10 rounded-xl text-sm font-bold"
          />
        </div>
      </AdminCard>

      {/* Certificates Table */}
      <AdminCard className="border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  الطالب
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  الحالة
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  تاريخ الإصدار
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary" />
                    </div>
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">
                      {search ? "لا توجد نتائج للبحث" : "لا توجد شهادات صادرة بعد"}
                    </p>
                  </td>
                </tr>
              ) : (
                certificates.map((certificate) => (
                  <tr
                    key={certificate.id}
                    className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                          {certificate.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{certificate.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{certificate.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          "font-black text-[10px] px-3 rounded-lg",
                          certificate.status === "issued"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}
                      >
                        {certificate.status === "issued" ? "صادرة" : "ملغاة"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(certificate.issuedAt).toLocaleDateString("ar-EG")}
                      </div>
                    </td>
                    <td className="p-4">
                      {certificate.status === "issued" && (
                        <AdminButton
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-[10px] font-black gap-1"
                          onClick={() => handleDownload(certificate.certificateUrl)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          تحميل
                        </AdminButton>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <div className="text-xs font-bold text-muted-foreground">
              صفحة {page} من {totalPages}
            </div>
            <div className="flex gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-[10px] font-black"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </AdminButton>
              <AdminButton
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-[10px] font-black"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                التالي
              </AdminButton>
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
