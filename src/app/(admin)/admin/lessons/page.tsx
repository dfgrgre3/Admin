"use client";

import * as React from "react";
import { adminApi } from "@/lib/api/admin-api";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  PlaySquare,
  FileText,
  Video,
  BookOpen,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  LayoutList,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import { toast } from "sonner";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface Lesson {
  id: string;
  title: string;
  titleAr?: string | null;
  type: "VIDEO" | "TEXT" | "QUIZ" | "INTERACTIVE" | "AUDIO";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  duration?: number | null;
  order: number;
  isFree: boolean;
  course?: { id: string; title: string; titleAr?: string | null } | null;
  chapter?: { id: string; title: string; titleAr?: string | null } | null;
  viewsCount?: number;
  completionRate?: number;
  createdAt: string;
  updatedAt: string;
}

interface LessonsResponse {
  data: {
    lessons: Lesson[];
    summary: {
      totalLessons: number;
      publishedCount: number;
      draftCount: number;
      archivedCount: number;
      totalVideos: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const typeConfig: Record<Lesson["type"], { label: string; icon: React.ElementType; color: string }> = {
  VIDEO: { label: "فيديو", icon: Video, color: "text-blue-500" },
  TEXT: { label: "نصي", icon: FileText, color: "text-green-500" },
  QUIZ: { label: "اختبار", icon: HelpCircle, color: "text-purple-500" },
  INTERACTIVE: { label: "تفاعلي", icon: LayoutList, color: "text-orange-500" },
  AUDIO: { label: "صوتي", icon: PlaySquare, color: "text-pink-500" },
};

const statusConfig: Record<Lesson["status"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PUBLISHED: { label: "منشور", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  DRAFT: { label: "مسودة", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  ARCHIVED: { label: "مؤرشف", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
};

export default function AdminLessonsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null);
  const deferredSearch = React.useDeferredValue(search);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "lessons", page, limit, deferredSearch, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      const response = await adminApi.fetch(`/admin/lessons?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch lessons");
      return (await response.json()) as LessonsResponse;
    },
  });

  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter, typeFilter]);

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lesson["status"] }) => {
      const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const response = await adminApi.fetch(`/admin/lessons`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update lesson status");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة الدرس");
      queryClient.invalidateQueries({ queryKey: ["admin", "lessons"] });
    },
    onError: () => toast.error("فشل تحديث حالة الدرس"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.fetch(`/admin/lessons`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete lesson");
    },
    onSuccess: () => {
      toast.success("تم حذف الدرس");
      setDeleteDialogOpen(false);
      setSelectedLesson(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "lessons"] });
    },
    onError: () => toast.error("فشل حذف الدرس"),
  });

  const lessons = data?.data?.lessons || [];
  const summary = data?.data?.summary || {
    totalLessons: 0, publishedCount: 0, draftCount: 0, archivedCount: 0, totalVideos: 0,
  };
  const pagination = data?.data?.pagination;

  const handleExport = () => {
    if (!lessons.length) { toast.error("لا توجد بيانات للتصدير"); return; }
    const cols: ExportColumn<Lesson>[] = [
      { header: "العنوان", accessor: (l) => l.titleAr || l.title },
      { header: "النوع", accessor: (l) => typeConfig[l.type]?.label || l.type },
      { header: "الحالة", accessor: (l) => statusConfig[l.status]?.label || l.status },
      { header: "المدة (دقيقة)", accessor: (l) => l.duration ? Math.round(l.duration / 60).toString() : "-" },
      { header: "الدورة", accessor: (l) => l.course?.titleAr || l.course?.title || "-" },
      { header: "الفصل", accessor: (l) => l.chapter?.titleAr || l.chapter?.title || "-" },
      { header: "مجاني", accessor: (l) => l.isFree ? "نعم" : "لا" },
      { header: "المشاهدات", accessor: (l) => (l.viewsCount ?? 0).toString() },
      { header: "تاريخ الإنشاء", accessor: (l) => new Date(l.createdAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(lessons, cols, "lessons");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<Lesson>[] = [
    {
      accessorKey: "title",
      header: "الدرس",
      cell: ({ row }) => {
        const lesson = row.original;
        const typeInfo = typeConfig[lesson.type];
        const TypeIcon = typeInfo.icon;
        return (
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary/10 border border-primary/20 transition-transform hover:scale-105`}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            <div>
              <p className="font-black text-sm">{lesson.titleAr || lesson.title}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60">
                {lesson.course?.titleAr || lesson.course?.title || "بدون دورة"}
                {lesson.chapter && ` · ${lesson.chapter.titleAr || lesson.chapter.title}`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "النوع",
      cell: ({ row }) => {
        const info = typeConfig[row.original.type];
        const Icon = info.icon;
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 ${info.color}`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wide">{info.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status];
        const Icon = cfg.icon;
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "المدة",
      cell: ({ row }) => {
        const dur = row.original.duration;
        if (!dur) return <span className="text-xs text-muted-foreground">-</span>;
        const mins = Math.round(dur / 60);
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-bold">{mins} دق</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isFree",
      header: "مجاني",
      cell: ({ row }) => (
        <Badge variant={row.original.isFree ? "default" : "outline"} className="text-[10px] font-black">
          {row.original.isFree ? "مجاني" : "مدفوع"}
        </Badge>
      ),
    },
    {
      accessorKey: "viewsCount",
      header: "المشاهدات",
      cell: ({ row }) => (
        <span className="text-sm font-bold text-muted-foreground">
          {(row.original.viewsCount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const lesson = row.original;
        const isPublished = lesson.status === "PUBLISHED";
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleStatusMutation.mutate({ id: lesson.id, status: lesson.status })}
              disabled={toggleStatusMutation.isPending}
              className={`p-2 rounded-lg transition-colors ${isPublished ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
              title={isPublished ? "إخفاء الدرس" : "نشر الدرس"}
            >
              {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => { setSelectedLesson(lesson); setDeleteDialogOpen(true); }}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="حذف الدرس"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        eyebrow="المحتوى التعليمي"
        title="إدارة الدروس"
        description="عرض وإدارة جميع الدروس التعليمية على المنصة — نصية، فيديو، تفاعلية."
        badge={summary.totalLessons ? String(summary.totalLessons) : undefined}
      >
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>
            تصدير CSV
          </AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي الدروس" value={summary.totalLessons} icon={BookOpen} color="blue" description="درس مسجل" />
        <AdminStatsCard title="منشورة" value={summary.publishedCount} icon={CheckCircle} color="green" description="متاحة للطلاب" />
        <AdminStatsCard title="مسودات" value={summary.draftCount} icon={Clock} color="yellow" description="غير منشورة" />
        <AdminStatsCard title="مؤرشفة" value={summary.archivedCount} icon={XCircle} color="red" description="مخفية" />
        <AdminStatsCard title="دروس فيديو" value={summary.totalVideos} icon={Video} color="purple" description="محتوى مرئي" />
      </div>

      {/* Table */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-glass-light dark:rpg-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
      >
        <AdminDataTable
          columns={columns}
          data={lessons}
          loading={isLoading}
          serverSide
          virtualized
          totalRows={pagination?.total || 0}
          pageCount={pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بعنوان الدرس..."
                  className="h-10 w-56 rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-10 rounded-xl bg-accent/10 border-border text-xs font-black">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-bold">كل الحالات</SelectItem>
                  <SelectItem value="PUBLISHED" className="font-bold text-emerald-500">منشور</SelectItem>
                  <SelectItem value="DRAFT" className="font-bold text-amber-500">مسودة</SelectItem>
                  <SelectItem value="ARCHIVED" className="font-bold text-red-500">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-10 rounded-xl bg-accent/10 border-border text-xs font-black">
                  <SelectValue placeholder="كل الأنواع" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-bold">كل الأنواع</SelectItem>
                  <SelectItem value="VIDEO" className="font-bold">فيديو</SelectItem>
                  <SelectItem value="TEXT" className="font-bold">نصي</SelectItem>
                  <SelectItem value="QUIZ" className="font-bold">اختبار</SelectItem>
                  <SelectItem value="INTERACTIVE" className="font-bold">تفاعلي</SelectItem>
                  <SelectItem value="AUDIO" className="font-bold">صوتي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </m.div>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              حذف الدرس
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الدرس{" "}
              <strong>"{selectedLesson?.titleAr || selectedLesson?.title}"</strong>؟
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => { setDeleteDialogOpen(false); setSelectedLesson(null); }}
              className="px-4 py-2 text-sm font-bold rounded-xl border border-border hover:bg-accent transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={() => selectedLesson && deleteMutation.mutate(selectedLesson.id)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
