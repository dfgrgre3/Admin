"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Puzzle, Search, RefreshCw, Plus, Edit, Trash2, CheckCircle, XCircle, ExternalLink, Key, Webhook,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: "PAYMENT" | "EMAIL" | "SMS" | "STORAGE" | "ANALYTICS" | "AI" | "SOCIAL" | "OTHER";
  isActive: boolean;
  config: Record<string, unknown>;
  lastTestedAt: string | null;
  lastTestStatus: "SUCCESS" | "FAILED" | null;
  createdAt: string;
}

export default function AdminIntegrationsPage() {
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "integrations"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/integrations");
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return (await response.json()) as { data: { integrations: Integration[] } };
    },
  });

  const integrations = data?.data?.integrations || [];

  const handleTest = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/integrations/${id}/test`, { method: "POST" });
      if (response.ok) { toast.success("تم اختبار الاتصال بنجاح"); queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] }); }
      else { toast.error("فشل اختبار الاتصال"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const response = await adminApi.fetch(`/api/admin/integrations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: active }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) { toast.success(active ? "تم التفعيل" : "تم التعطيل"); queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] }); }
      else { toast.error("فشل التحديث"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="التكاملات 🔌" description="إدارة التكاملات مع الخدمات الخارجية: الدفع، البريد، التخزين، والتحليلات." eyebrow="الإعدادات" badge={String(integrations.length)}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isLoading}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => {}}>إضافة تكامل</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="admin-glass p-6 rounded-[2rem] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{integration.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">{integration.provider}</p>
                </div>
              </div>
              {integration.isActive ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge>
              ) : (
                <Badge variant="secondary" className="font-black text-xs">غير نشط</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-black text-xs">{integration.type}</Badge>
              {integration.lastTestStatus === "SUCCESS" && <Badge className="bg-green-500/10 text-green-500 font-black text-xs">آخر اختبار: ناجح</Badge>}
              {integration.lastTestStatus === "FAILED" && <Badge className="bg-red-500/10 text-red-500 font-black text-xs">آخر اختبار: فاشل</Badge>}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <AdminButton variant="outline" size="sm" icon={ExternalLink} onClick={() => handleTest(integration.id)}>اختبار</AdminButton>
              {canManage && (
                <>
                  <AdminButton variant="outline" size="sm" icon={integration.isActive ? XCircle : CheckCircle}
                    onClick={() => handleToggle(integration.id, !integration.isActive)}>
                    {integration.isActive ? "تعطيل" : "تفعيل"}
                  </AdminButton>
                  <AdminButton variant="outline" size="sm" icon={Edit} onClick={() => {}}>تعديل</AdminButton>
                </>
              )}
            </div>
          </div>
        ))}
        {integrations.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <Puzzle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">لا توجد تكاملات مضافة</p>
          </div>
        )}
      </div>
    </div>
  );
}