"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench, RefreshCw, AlertTriangle, CheckCircle, Clock, Globe,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface MaintenanceMode {
  isEnabled: boolean;
  message: string;
  allowedIPs: string[];
  startTime: string | null;
  endTime: string | null;
  updatedAt: string;
}

export default function AdminMaintenanceModePage() {
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "maintenance"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/maintenance");
      if (!response.ok) throw new Error("Failed to fetch maintenance mode");
      return (await response.json()) as { data: MaintenanceMode };
    },
  });

  const maintenance = data?.data || {
    isEnabled: false,
    message: "",
    allowedIPs: [],
    startTime: null,
    endTime: null,
    updatedAt: "",
  };

  const handleToggle = async () => {
    try {
      const response = await adminApi.fetch("/api/admin/maintenance", {
        method: "PATCH",
        body: JSON.stringify({ isEnabled: !maintenance.isEnabled }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) { toast.success(!maintenance.isEnabled ? "تم تفعيل وضع الصيانة" : "تم تعطيل وضع الصيانة"); queryClient.invalidateQueries({ queryKey: ["admin", "maintenance"] }); }
      else { toast.error("فشل في التحديث"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="وضع الصيانة 🔧" description="التحكم في وضع صيانة الموقع." eyebrow="النظام" badge={maintenance.isEnabled ? "نشط" : "معطل"}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isLoading}>تحديث</AdminButton>
          {canManage && (
            <AdminButton variant={maintenance.isEnabled ? "destructive" : "default"} icon={Wrench} onClick={handleToggle}>
              {maintenance.isEnabled ? "تعطيل الصيانة" : "تفعيل الصيانة"}
            </AdminButton>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-glass p-6 rounded-[2rem] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${maintenance.isEnabled ? "bg-red-500/10 border border-red-500/20" : "bg-green-500/10 border border-green-500/20"}`}>
              <Wrench className={`h-6 w-6 ${maintenance.isEnabled ? "text-red-500" : "text-green-500"}`} />
            </div>
            <div>
              <h3 className="font-black text-sm">الحالة الحالية</h3>
              <p className="text-[10px] text-muted-foreground">{maintenance.isEnabled ? "الموقع في وضع الصيانة" : "الموقع يعمل بشكل طبيعي"}</p>
            </div>
          </div>
          <Badge variant={maintenance.isEnabled ? "destructive" : "default"} className="font-black text-xs">
            {maintenance.isEnabled ? "قيد الصيانة" : "نشط"}
          </Badge>
        </div>

        <div className="admin-glass p-6 rounded-[2rem] border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-sm">عناوين IP المسموحة</h3>
              <p className="text-[10px] text-muted-foreground">{maintenance.allowedIPs.length} عنوان</p>
            </div>
          </div>
          <div className="space-y-1">
            {maintenance.allowedIPs.map((ip, i) => (
              <Badge key={i} variant="outline" className="font-mono text-xs">{ip}</Badge>
            ))}
          </div>
        </div>
      </div>

      {maintenance.isEnabled && (
        <div className="admin-glass p-6 rounded-[2rem] border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-black text-sm text-red-500">تنبيه: وضع الصيانة مفعل</h3>
              <p className="text-xs text-muted-foreground mt-1">{maintenance.message || "الموقع غير متاح للزوار حالياً."}</p>
              {maintenance.startTime && (
                <p className="text-xs text-muted-foreground mt-2">بداية الصيانة: {new Date(maintenance.startTime).toLocaleString("ar-EG")}</p>
              )}
              {maintenance.endTime && (
                <p className="text-xs text-muted-foreground mt-1">النهاية المتوقعة: {new Date(maintenance.endTime).toLocaleString("ar-EG")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}