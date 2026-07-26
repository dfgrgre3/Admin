"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Download, FileText, Database, CheckCircle, XCircle, Clock, RefreshCw,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface ImportExportJob {
  id: string;
  type: "IMPORT" | "EXPORT";
  entity: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function AdminDataImportExportPage() {
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "import-export"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/import-export");
      if (!response.ok) throw new Error("Failed to fetch import/export data");
      return (await response.json()) as { data: { jobs: ImportExportJob[]; summary: { totalJobs: number; pendingJobs: number; completedJobs: number; failedJobs: number } } };
    },
  });

  const jobs = data?.data?.jobs || [];
  const summary = data?.data?.summary || { totalJobs: 0, pendingJobs: 0, completedJobs: 0, failedJobs: 0 };

  const handleExport = async (entity: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/import-export/export/${entity}`, { method: "POST" });
      if (response.ok) { toast.success("تم بدء التصدير"); queryClient.invalidateQueries({ queryKey: ["admin", "import-export"] }); }
      else { toast.error("فشل في التصدير"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleImport = async (entity: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await adminApi.fetch(`/api/admin/import-export/import/${entity}`, { method: "POST", body: formData });
        if (response.ok) { toast.success("تم بدء الاستيراد"); queryClient.invalidateQueries({ queryKey: ["admin", "import-export"] }); }
        else { toast.error("فشل في الاستيراد"); }
      } catch { toast.error("خطأ في الاتصال"); }
    };
    input.click();
  };

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="استيراد/تصدير البيانات 📊" description="إدارة عمليات استيراد وتصدير البيانات." eyebrow="النظام" badge={String(summary.totalJobs)}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isLoading}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي العمليات" value={summary.totalJobs} icon={Database} color="blue" description="عملية" />
        <AdminStatsCard title="قيد المعالجة" value={summary.pendingJobs} icon={Clock} color="amber" description="عملية" />
        <AdminStatsCard title="مكتملة" value={summary.completedJobs} icon={CheckCircle} color="green" description="عملية" />
        <AdminStatsCard title="فاشلة" value={summary.failedJobs} icon={XCircle} color="red" description="عملية" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-glass p-6 rounded-[2rem] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
              <Download className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-black text-sm">تصدير البيانات</h3>
              <p className="text-[10px] text-muted-foreground">تصدير البيانات بصيغة CSV أو Excel</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["users", "courses", "enrollments", "payments"].map((entity) => (
              <button key={entity} onClick={() => handleExport(entity)} className="p-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-accent/10 transition-colors text-xs font-bold">
                {entity}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-glass p-6 rounded-[2rem] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-black text-sm">استيراد البيانات</h3>
              <p className="text-[10px] text-muted-foreground">استيراد البيانات من ملف CSV أو Excel</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["users", "courses", "enrollments", "payments"].map((entity) => (
              <button key={entity} onClick={() => handleImport(entity)} className="p-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-accent/10 transition-colors text-xs font-bold">
                {entity}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 space-y-4">
          <h3 className="font-black text-sm">العمليات الأخيرة</h3>
          {jobs.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-xs text-gray-500 font-bold">لا توجد عمليات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <p className="font-black text-xs">{job.entity} - {job.type === "IMPORT" ? "استيراد" : "تصدير"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(job.createdAt).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                    </div>
                    <Badge variant="outline" className="font-black text-xs">{job.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}