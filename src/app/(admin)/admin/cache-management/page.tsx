"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Database, Search, RefreshCw, Trash2, CheckCircle, XCircle, Clock, HardDrive, AlertTriangle, Filter,
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

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"size" | "hits" | "lastAccessed">("lastAccessed");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

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

  // Filter and sort entries
  const filteredEntries = React.useMemo(() => {
    let result = [...entries];

    // Search filter
    if (searchTerm) {
      result = result.filter(entry => entry.key.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter(entry => entry.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "size":
          comparison = a.size - b.size;
          break;
        case "hits":
          comparison = a.hits - b.hits;
          break;
        case "lastAccessed":
          comparison = new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [entries, searchTerm, filterType, sortBy, sortOrder]);

  const cacheTypes = React.useMemo(() => {
    const types = new Set(entries.map(e => e.type));
    return ["all", ...Array.from(types)];
  }, [entries]);

  const handleClearCache = async (key?: string) => {
    try {
      const url = key ? `/api/admin/cache/${encodeURIComponent(key)}` : "/api/admin/cache";
      const response = await adminApi.fetch(url, { method: "DELETE" });
      if (response.ok) {
        toast.success(key ? "تم مسح العنصر من الذاكرة" : "تم مسح الذاكرة المؤقتة بالكامل");
        queryClient.invalidateQueries({ queryKey: ["admin", "cache"] });
      } else {
        toast.error(key ? "فشل في مسح العنصر" : "فشل في مسح الذاكرة");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `${minutes} دق`; // "minutes ago" in Arabic
    if (hours < 24) return `${hours} س`; // "hours ago" in Arabic
    return `${days} ي`; // "days ago" in Arabic
  };

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader title="إدارة التخزين المؤقت" description="مراقبة وإدارة ذاكرة التخزين المؤقت للنظام." eyebrow="النظام" badge={String(summary.totalEntries)}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isLoading}>تحديث</AdminButton>
          {canManage && (
            <AdminButton variant="destructive" icon={Trash2} onClick={() => handleClearCache()} aria-label="مسح كل المدخلات">
              مسح الكل
            </AdminButton>
          )}
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي المدخلات" value={summary.totalEntries} icon={Database} color="blue" description="عنصر" />
        <AdminStatsCard title="حجم الذاكرة" value={formatBytes(summary.totalSize)} icon={HardDrive} color="purple" description="إجمالي" />
        <AdminStatsCard title="معدل الإصابة" value={`${summary.hitRate}%`} icon={CheckCircle} color="green" description="نسبة" />
        <AdminStatsCard title="معدل الفشل" value={`${summary.missRate}%`} icon={XCircle} color="red" description="نسبة" />
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="admin-glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            المدخلات المخزنة
            <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{filteredEntries.length}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-48 transition-all"
                aria-label="بحث في المدخلات"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm rounded-xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer w-full md:w-40"
                aria-label="تصفية حسب النوع"
              >
                {cacheTypes.map(type => (
                  <option key={type} value={type}>
                    {type === "all" ? "كل الأنواع" : type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-sm rounded-xl border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="ترتيب حسب"
              >
                <option value="lastAccessed">آخر وصول</option>
                <option value="size">الحجم</option>
                <option value="hits">عدد الإصابات</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 rounded-xl border bg-background/50 hover:bg-muted/50 transition-colors"
                aria-label={`ترتيب ${sortOrder === "asc" ? "تصاعدي" : "تنازلي"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Entries List */}
      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center">
            <Database className="w-16 h-16 text-gray-700/50 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">لا توجد مدخلات مطابقة لبحثك</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-primary text-sm hover:underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted/30 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">المفتاح</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الحجم</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الإصابات</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">آخر وصول</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.map((entry) => (
                  <tr key={entry.key} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm truncate max-w-xs" title={entry.key}>{entry.key}</p>
                      {entry.expiresAt && (
                        <p className="text-[10px] text-red-400/70 mt-0.5">تنتهي: {new Date(entry.expiresAt).toLocaleDateString("ar-EG")}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px]">{entry.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatBytes(entry.size)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500/80 font-medium">{entry.hits}</span>
                        <span className="text-xs text-muted-foreground">hits</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatRelativeTime(entry.lastAccessed)}</td>
                    <td className="px-6 py-4">
                      {canManage && (
                        <button
                          onClick={() => handleClearCache(entry.key)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="حذف هذا العنصر"
                          aria-label={`حذف ${entry.key}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cache Health Warning */}
      {summary.missRate > 30 && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200" role="alert">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">تحذير: معدل الفشل مرتفع</p>
            <p className="text-xs text-amber-300/80 mt-0.5">معدل الفشل ({summary.missRate}%) أعلى من المثالي. قد تحتاج لمراجعة سياسة التخزين المؤقت.</p>
          </div>
        </div>
      )}
    </div>
  );
}