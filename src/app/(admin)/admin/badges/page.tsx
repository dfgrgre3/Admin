"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Award, Search, Download, RefreshCw, Plus, Edit, Trash2, Star, Users, CheckCircle, Image,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface BadgeRecord {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: "ACHIEVEMENT" | "MILESTONE" | "SPECIAL" | "SEASONAL";
  criteria: Record<string, unknown>;
  points: number;
  isActive: boolean;
  awardedCount: number;
  createdAt: string;
}

interface BadgesResponse {
  data: { badges: BadgeRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalBadges: number; activeBadges: number; totalAwarded: number } };
}

const badgeTypeConfig: Record<string, { label: string; color: string }> = {
  ACHIEVEMENT: { label: "إنجاز", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  MILESTONE: { label: "مرحلة", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  SPECIAL: { label: "خاص", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  SEASONAL: { label: "موسمي", color: "text-green-500 bg-green-500/10 border-green-500/20" },
};

export default function AdminBadgesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.ACHIEVEMENTS_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "badges", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/badges?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch badges");
      return (await response.json()) as BadgesResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const badges = data?.data?.badges || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalBadges: 0, activeBadges: 0, totalAwarded: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/badges/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف الشارة"); queryClient.invalidateQueries({ queryKey: ["admin", "badges"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const columns: ColumnDef<BadgeRecord>[] = [
    { accessorKey: "name", header: "الشارة", cell: ({ row }) => ( <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"><Award className="h-5 w-5 text-amber-500" /></div> <div><p className="font-black text-xs">{row.original.name}</p><p className="text-[10px] text-muted-foreground">{row.original.description || ""}</p></div> </div> ) },
    { accessorKey: "type", header: "النوع", cell: ({ row }) => { const c = badgeTypeConfig[row.original.type]; return c ? <Badge variant="outline" className={`font-black text-xs ${c.color}`}>{c.label}</Badge> : <span>{row.original.type}</span>; } },
    { accessorKey: "points", header: "النقاط", cell: ({ row }) => <span className="font-black text-xs">{row.original.points}</span> },
    { accessorKey: "awardedCount", header: "الممنوحة", cell: ({ row }) => <span className="font-black text-xs">{row.original.awardedCount.toLocaleString()}</span> },
    { accessorKey: "isActive", header: "الحالة", cell: ({ row }) => row.original.isActive ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge> : <Badge variant="secondary" className="font-black text-xs">غير نشط</Badge> },
    { accessorKey: "createdAt", header: "تاريخ الإنشاء", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("ar-EG")}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && ( <> <button onClick={() => router.push(`/admin/badges/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل"><Edit className="h-3.5 w-3.5" /></button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة الشارات 🏅" description="إدارة شارات الإنجاز والتكريم الممنوحة للطلاب." eyebrow="التحفيز" badge={summary.totalBadges.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/badges/create")}>إضافة شارة</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="إجمالي الشارات" value={summary.totalBadges} icon={Award} color="amber" description="شارة" />
        <AdminStatsCard title="شارات نشطة" value={summary.activeBadges} icon={CheckCircle} color="green" description="شارة نشطة" />
        <AdminStatsCard title="تم منحها" value={summary.totalAwarded.toLocaleString()} icon={Users} color="blue" description="مرة" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={badges} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد شارات", description: "لم يتم إضافة أي شارات بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الشارة" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}