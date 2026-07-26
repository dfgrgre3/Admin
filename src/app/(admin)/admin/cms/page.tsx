"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Layout, Search, Download, RefreshCw, Plus, Edit, Trash2, Eye, Globe, FileText, Image, Home,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  author: string;
  authorName: string | null;
  category: string;
  tags: string[];
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CMSResponse {
  data: { pages: CMSPage[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalPages: number; publishedCount: number; draftCount: number; archivedCount: number; totalViews: number } };
}

const pageStatusConfig: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "منشور", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  DRAFT: { label: "مسودة", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  ARCHIVED: { label: "مؤرشف", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

export default function AdminCMSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get("status") || "all");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "cms", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/cms/pages?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch CMS pages");
      return (await response.json()) as CMSResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const pages = data?.data?.pages || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalPages: 0, publishedCount: 0, draftCount: 0, archivedCount: 0, totalViews: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/cms/pages/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف الصفحة"); queryClient.invalidateQueries({ queryKey: ["admin", "cms"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const columns: ColumnDef<CMSPage>[] = [
    { accessorKey: "title", header: "الصفحة", cell: ({ row }) => ( <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"><FileText className="h-5 w-5 text-primary" /></div><div><p className="font-black text-xs">{row.original.title}</p><p className="text-[10px] text-muted-foreground">/{row.original.slug}</p></div></div> ) },
    { accessorKey: "category", header: "التصنيف", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.category}</Badge> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = pageStatusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "views", header: "المشاهدات", cell: ({ row }) => <span className="font-black text-xs">{row.original.views.toLocaleString()}</span> },
    { accessorKey: "authorName", header: "المؤلف", cell: ({ row }) => <span className="text-xs font-bold">{row.original.authorName || row.original.author}</span> },
    { accessorKey: "updatedAt", header: "آخر تحديث", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.updatedAt).toLocaleDateString("ar-EG")}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> <button onClick={() => window.open(`/${row.original.slug}`, "_blank")} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="عرض"><Eye className="h-3.5 w-3.5" /></button> {canManage && ( <> <button onClick={() => router.push(`/admin/cms/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل"><Edit className="h-3.5 w-3.5" /></button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة المحتوى CMS 📝" description="إدارة صفحات المحتوى الثابت، القوالب، والمكونات." eyebrow="المحتوى" badge={summary.totalPages.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/cms/create")}>إضافة صفحة</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي الصفحات" value={summary.totalPages} icon={Layout} color="blue" description="صفحة" />
        <AdminStatsCard title="منشورة" value={summary.publishedCount} icon={Globe} color="green" description="صفحة منشورة" />
        <AdminStatsCard title="مسودة" value={summary.draftCount} icon={FileText} color="amber" description="صفحة مسودة" />
        <AdminStatsCard title="إجمالي المشاهدات" value={summary.totalViews.toLocaleString()} icon={Eye} color="purple" description="مشاهدة" />
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary">الكل</TabsTrigger>
          <TabsTrigger value="PUBLISHED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white">منشور</TabsTrigger>
          <TabsTrigger value="DRAFT" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-amber-500 data-[state=active]:text-white">مسودة</TabsTrigger>
          <TabsTrigger value="ARCHIVED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-gray-500 data-[state=active]:text-white">مؤرشف</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={pages} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد صفحات", description: "لم يتم إنشاء أي صفحات بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الصفحة" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}