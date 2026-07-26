"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, BookOpen, Download, Star, Eye, Users, Search, Trash2
} from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { LIBRARY_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { usePermission } from "@/components/auth/PermissionGuard";
import { exportToCSV, ExportColumn } from '@/lib/export-utils';
import { logAdminAction } from "@/lib/admin-audit";
import { PERMISSIONS } from "@/lib/permissions";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  downloadUrl: string;
  rating: number;
  views: number;
  downloads: number;
  tags: string[];
  createdAt: string;
  subject?: {
    id: string;
    name: string;
    nameAr: string | null;
  };
}

interface Subject {
  id: string;
  name: string;
  nameAr: string | null;
}

interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SubjectsListResponse {
  data: {
    subjects: Subject[];
  };
}

const EMPTY_BOOKS: Book[] = [];

const bookSchema = z.object({
  title: z.string().min(1, "عنوان الكتاب مطلوب"),
  author: z.string().min(1, "اسم المؤلف مطلوب"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "المادة مطلوبة"),
  coverUrl: z.string().trim().optional(),
  downloadUrl: z.string().trim().min(1, "رابط التحميل مطلوب"),
  tags: z.array(z.string()).optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function AdminBooksPage() {
  const { hasPermission } = usePermission();
  const canManageBooks = hasPermission(PERMISSIONS.BOOKS_MANAGE);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBook, setEditingBook] = React.useState<Book | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "books", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (deferredSearch) {
        params.set("search", deferredSearch);
      }

      const response = await adminFetch(`${apiRoutes.admin.books}?${params.toString()}`);
      const json = await response.json();
      return (json.data || json) as BooksResponse;
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["admin", "subjects-list"],
    queryFn: async () => {
      const response = await adminFetch(`${apiRoutes.admin.subjects}?limit=100`);
      const result = (await response.json()) as SubjectsListResponse;
      return result.data?.subjects || [];
    },
  });

  const books = data?.books ?? EMPTY_BOOKS;
  const pagination = data?.pagination;

  const stats = React.useMemo(() => ({
    totalBooks: pagination?.total ?? 0,
    views: books.reduce((total, book) => total + (book.views || 0), 0),
    downloads: books.reduce((total, book) => total + (book.downloads || 0), 0),
    averageRating: books.length
      ? books.reduce((total, book) => total + (book.rating || 0), 0) / books.length
      : 0,
  }), [books, pagination?.total]);

  React.useEffect(() => {
    if (isError) toast.error("تعذر تحميل الكتب، حاول التحديث مرة أخرى");
  }, [isError]);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      subjectId: "",
      coverUrl: "",
      downloadUrl: "",
      tags: [],
    },
  });

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      form.reset({
        title: book.title,
        author: book.author,
        description: book.description || "",
        subjectId: book.subject?.id || "",
        coverUrl: book.coverUrl || "",
        downloadUrl: book.downloadUrl,
        tags: book.tags,
      });
    } else {
      setEditingBook(null);
      form.reset({
        title: "",
        author: "",
        description: "",
        subjectId: "",
        coverUrl: "",
        downloadUrl: "",
        tags: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (values: BookFormValues) => {
    try {
      const method = editingBook ? "PATCH" : "POST";
      const body = editingBook ? { ...values, id: editingBook.id } : values;
      const response = await adminFetch(apiRoutes.admin.books, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(editingBook ? "تم تحديث الكتاب بنجاح" : "تمت إضافة الكتاب إلى المكتبة");
        setDialogOpen(false);
        await requestPublicCacheRevalidation(LIBRARY_PUBLIC_CACHE_PATHS);
        refetch();
      } else {
        const result = await response.json().catch(() => null);
        toast.error(result?.error || "فشل في حفظ الكتاب");
      }
    } catch (err: unknown) {
      toast.error("خطأ في الاتصال");
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminFetch(apiRoutes.admin.books, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteDialog.id }),
      });

      if (response.ok) {
        toast.success("تم حذف الكتاب بنجاح");
        await requestPublicCacheRevalidation(LIBRARY_PUBLIC_CACHE_PATHS);
        refetch();
      } else {
        const result = await response.json().catch(() => null);
        toast.error(result?.error || "فشل في حذف الكتاب");
      }
    } catch (err: unknown) {
      toast.error("خطأ في الاتصال");
      console.error(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const columns: ColumnDef<Book>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="تحديد الكل"
          className="translate-y-[2px] border-white/20"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="تحديد الصف"
          className="translate-y-[2px] border-white/20"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "المجلد العلمي",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex h-14 w-10 items-center justify-center rounded-sm bg-background border border-white/10 overflow-hidden shadow-2xl">
                {book.coverUrl ? (
                  <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                ) : (
                  <BookOpen className="h-5 w-5 text-amber-500" />
                )}
              </div>
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">{book.title}</p>
              <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                <Users className="w-3 h-3" />
                بواسطة: {book.author}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "subject",
      header: "المجال",
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-lg bg-white/5 border-white/10 text-muted-foreground font-black text-[10px] uppercase">
          {row.original.subject?.nameAr || row.original.subject?.name || "غير محدد"}
        </Badge>
      ),
    },
    {
      accessorKey: "stats",
      header: "إحصائيات القراءة",
      cell: ({ row }) => (
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{(row.original.rating || 0).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
            <Download className="w-3.5 h-3.5" />
            <span>{(row.original.downloads || 0).toLocaleString("ar-EG")}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ التدوين",
      cell: ({ row }) => (
        <span className="text-xs font-bold opacity-60">
          {new Date(row.original.createdAt).toLocaleDateString("ar-EG")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "التحكم",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onEdit={canManageBooks ? handleOpenDialog : undefined}
          onDelete={canManageBooks ? (b) => setDeleteDialog({ open: true, id: b.id }) : undefined}
          extraActions={[
            { icon: Eye, label: "فتح الكتاب", onClick: (b) => window.open(b.downloadUrl, "_blank", "noopener,noreferrer") },
            { icon: Download, label: "تنزيل الكتاب", onClick: (b) => window.open(b.downloadUrl, "_blank", "noopener,noreferrer") },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة الكتب 📚"
        description="أضف المراجع والكتب الدراسية، وتابع القراءة والتنزيلات من مكان واحد."
      >
        {canManageBooks && (
          <AdminButton icon={Plus} onClick={() => handleOpenDialog()}>
            إضافة كتاب جديد
          </AdminButton>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard title="إجمالي الكتب" value={stats.totalBooks} icon={BookOpen} color="amber" description="نتائج البحث الحالية" />
        <AdminStatsCard title="المشاهدات" value={stats.views} icon={Eye} color="blue" description="ضمن الصفحة المعروضة" />
        <AdminStatsCard title="التنزيلات" value={stats.downloads} icon={Download} color="green" description="ضمن الصفحة المعروضة" />
        <AdminStatsCard title="متوسط التقييم" value={stats.averageRating.toFixed(1)} icon={Star} color="purple" description="ضمن الصفحة المعروضة" />
      </div>

      <AdminDataTable
        columns={columns}
        data={books}
        loading={isLoading}
        serverSide
        selectable
        totalRows={pagination?.total || 0}
        pageCount={pagination?.totalPages || 1}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        pageSize={limit}
        bulkActions={[
          {
            label: "تصدير CSV",
            icon: Download,
            onClick: (rows) => {
              const exportColumns: ExportColumn<Book>[] = [
                { header: 'العنوان', accessor: 'title' },
                { header: 'المؤلف', accessor: 'author' },
                { header: 'التقييم', accessor: (b) => b.rating },
                { header: 'المشاهدات', accessor: (b) => b.views },
                { header: 'التحميلات', accessor: (b) => b.downloads },
                { header: 'تاريخ الإضافة', accessor: (b) => new Date(b.createdAt).toLocaleDateString('ar-EG') },
              ];
              exportToCSV(rows, exportColumns, 'books');
              toast.success('تم تصدير الكتب بنجاح');
            },
          },
          ...(canManageBooks ? [{
            label: "حذف المحدد",
            icon: Trash2,
            variant: "destructive" as const,
            onClick: async (rows: Book[]) => {
              const ids = rows.map((r: Book) => r.id);
              const response = await adminFetch(apiRoutes.admin.books, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
              });
              if (response.ok) {
                toast.success(`تم حذف ${ids.length} كتاب`);
                logAdminAction("DELETE", "book", { details: { count: ids.length } });
                refetch();
                void requestPublicCacheRevalidation(LIBRARY_PUBLIC_CACHE_PATHS).catch(() => {});
              } else {
                toast.error("فشل في حذف الكتب");
              }
            },
          }] : []),
        ]}
        actions={{ onRefresh: () => refetch() }}
        emptyMessage={{
          title: deferredSearch ? "لا توجد كتب مطابقة" : "لا توجد كتب حتى الآن",
          description: deferredSearch ? "جرّب عبارة بحث أخرى." : "أضف أول كتاب لبدء بناء مكتبتك.",
        }}
        toolbar={
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث بالعنوان أو المؤلف أو المادة..."
              className="h-10 w-72 rounded-xl border border-border bg-accent/20 px-10 text-sm outline-none ring-primary transition focus:ring-1"
            />
          </div>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card/80 backdrop-blur-xl border-white/10 rounded-[2rem]">
          <DialogHeader>
              <DialogTitle className="text-2xl font-black">
              {editingBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              أدخل بيانات الكتاب وروابط الغلاف والتنزيل.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">عنوان الكتاب</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">المؤلف / القائد</FormLabel>
                      <FormControl><Input {...field} className="rounded-xl border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">العلم التابع له</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-white/10">
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-white/10">
                          {subjects.map((subject: Subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.nameAr || subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">وصف الكتاب</FormLabel>
                    <FormControl><Textarea {...field} className="rounded-xl border-white/10 min-h-[80px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">رابط الغلاف (URL)</FormLabel>
                      <FormControl><Input {...field} className="rounded-xl border-white/10 text-xs" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">رابط التحميل (PDF)</FormLabel>
                      <FormControl><Input {...field} className="rounded-xl border-white/10 text-xs" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">الوسوم</FormLabel>
                    <FormControl>
                      <Input
                        value={(field.value || []).join("، ")}
                        onChange={(event) => field.onChange(event.target.value.split(/[,،]/).map((tag) => tag.trim()).filter(Boolean))}
                        placeholder="مثال: مراجعة، فيزياء، الصف الثالث"
                        className="rounded-xl border-white/10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <AdminButton type="submit" className="w-full h-12 text-md font-black">
                  {editingBook ? "حفظ التغييرات" : "إضافة الكتاب"}
                </AdminButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الكتاب نهائياً؟"
        description="سيتم حذف الكتاب وبياناته المرتبطة. هل أنت متأكد؟"
        confirmText="نعم، احذف الكتاب"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
