"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Database, Search, RefreshCw, Trash2, CheckCircle, XCircle, Clock, HardDrive,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface CacheEntry {
  key: string;
  type: string;
  size: number;
  hits: number;
  misses: number;
  lastAccessed: string;
  expiresAt: string | null;
}

export default function AdminCacheManagementPage() {
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "cache"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/cache");
      if (!response.ok) throw new Error("Failed to fetch cache stats");
      return (await response.json()) as { data: { entries: CacheEntry[]; summary: { totalEntries: number; totalSize: number; hitRate: number; missRate: number } } };
    },
  });

  const entries = data?.data?.entries || [];
  const summary = data?.data?.summary || { totalEntries: 0, totalSize: 0, hitRate: 0, missRate: 0 };

  const handleClearCache = async (key?: string) => {
    try {
      const url = key ? `/api/admin/cache/${encodeURIComponent(key)}` : "/api/admin/cache";
      const response = await adminApi.fetch(url, { method: "DELETE" });
      if (response.ok) { toast.success("تم مسح الذاكرة المؤقتة"); queryClient.invalidateQueries({ queryKey: ["admin", "cache"] }); }
      else { toast.error("فشل في المسح"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة التخزين المؤقت 🗄️" description="مراقبة وإدارة ذاكرة التخزين المؤقت للنظام." eyebrow="النظام" badge={String(summary.totalEntries)}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isLoading}>تحديث</AdminButton>
          {canManage && <AdminButton variant="destructive" icon={Trash2} onClick={() => handleClearCache()}>مسح الكل</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي المدخلات" value={summary.totalEntries} icon={Database} color="blue" description="عنصر" />
        <AdminStatsCard title="حجم الذاكرة" value={formatBytes(summary.totalSize)} icon={HardDrive} color="purple" description="إجمالي" />
        <AdminStatsCard title="معدل الإصابة" value={`${summary.hitRate}%`} icon={CheckCircle} color="green" description="نسبة" />
        <AdminStatsCard title="معدل الفشل" value={`${summary.missRate}%`} icon={XCircle} color="red" description="نسبة" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 space-y-4">
          <h3 className="font-black text-sm">الذاكرة المؤقتة النشطة</h3>
          {entries.length === 0 ? (
            <div className="py-12 text-center">
              <Database className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-xs text-gray-500 font-bold">الذاكرة المؤقتة فارغة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.key} className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex-1">
                    <p className="font-black text-xs">{entry.key}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.type} • {formatBytes(entry.size)} • آخر وصول: {new Date(entry.lastAccessed).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-black text-xs">hits: {entry.hits}</Badge>
                    {canManage && (
                      <button onClick={() => handleClearCache(entry.key)} className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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