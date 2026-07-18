"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Route, Pencil, Plus, RefreshCw, Layers, Clock, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";

interface LearningPathItem {
  id?: string;
  subjectId: string;
  order: number;
  isRequired: boolean;
  subject?: { id: string; name: string } | null;
}

interface LearningPath {
  id: string;
  name: string;
  nameAr?: string | null;
  slug?: string | null;
  description?: string | null;
  level: string;
  price: number;
  isActive: boolean;
  isPublished: boolean;
  estimatedHours: number;
  certificateId?: string | null;
  items: LearningPathItem[];
}

const pathSchema = z.object({
  name: z.string().min(1, "اسم المسار مطلوب"),
  nameAr: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  estimatedHours: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  isPublished: z.boolean(),
  certificateId: z.string().optional().nullable(),
});

type PathFormValues = z.infer<typeof pathSchema>;

const defaultValues: PathFormValues = {
  name: "",
  nameAr: "",
  slug: "",
  description: "",
  level: "INTERMEDIATE",
  price: 0,
  estimatedHours: 0,
  isActive: true,
  isPublished: false,
  certificateId: "",
};

export default function AdminLearningPathsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LearningPath | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [items, setItems] = React.useState<LearningPathItem[]>([]);
  const [subjectIdInput, setSubjectIdInput] = React.useState("");

  const { data: paths = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "learning-paths"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.learningPaths);
      const result = await response.json();
      return (result.data?.learningPaths || []) as LearningPath[];
    },
  });

  const form = useForm<PathFormValues>({
    resolver: zodResolver(pathSchema),
    defaultValues,
  });

  const openDialog = (path?: LearningPath) => {
    if (path) {
      setEditing(path);
      setItems(
        (path.items || []).map((i) => ({
          subjectId: i.subjectId,
          order: i.order,
          isRequired: i.isRequired,
          subject: i.subject,
        }))
      );
      form.reset({
        name: path.name,
        nameAr: path.nameAr || "",
        slug: path.slug || "",
        description: path.description || "",
        level: path.level,
        price: path.price,
        estimatedHours: path.estimatedHours,
        isActive: path.isActive,
        isPublished: path.isPublished,
        certificateId: path.certificateId || "",
      });
    } else {
      setEditing(null);
      setItems([]);
      form.reset(defaultValues);
    }
    setDialogOpen(true);
  };

  const addItem = () => {
    const id = subjectIdInput.trim();
    if (!id) {
      toast.error("أدخل معرّف الدورة");
      return;
    }
    if (items.some((i) => i.subjectId === id)) {
      toast.error("الدورة مضافة بالفعل");
      return;
    }
    setItems((prev) => [
      ...prev,
      { subjectId: id, order: prev.length + 1, isRequired: true },
    ]);
    setSubjectIdInput("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.subjectId !== id));
  };

  const toggleRequired = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.subjectId === id ? { ...i, isRequired: !i.isRequired } : i))
    );
  };

  const handleSubmit = async (values: PathFormValues) => {
    try {
      const payload = {
        ...values,
        certificateId: values.certificateId || null,
        items: items.map((i) => ({
          subjectId: i.subjectId,
          order: i.order,
          isRequired: i.isRequired,
        })),
      };
      const method = editing ? "PATCH" : "POST";
      const url = editing
        ? apiRoutes.admin.learningPathById(editing.id)
        : apiRoutes.admin.learningPaths;
      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result?.error || result?.message || "تعذر حفظ المسار");
        return;
      }
      toast.success(editing ? "تم تحديث المسار بنجاح" : "تم إنشاء المسار بنجاح");
      setDialogOpen(false);
      setEditing(null);
      setItems([]);
      form.reset(defaultValues);
      await refetch();
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminFetch(apiRoutes.admin.learningPathById(deleteDialog.id), {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result?.error || "تعذر حذف المسار");
        return;
      }
      toast.success("تم حذف المسار بنجاح");
      await refetch();
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const columns: ColumnDef<LearningPath>[] = [
    {
      accessorKey: "name",
      header: "المسار",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-bold">{row.original.name}</p>
          {row.original.nameAr && (
            <p className="text-xs text-muted-foreground">{row.original.nameAr}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "الدورات",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.items?.length ?? 0} دورة</span>
      ),
    },
    {
      accessorKey: "estimatedHours",
      header: "المدة المقدرة",
      cell: ({ row }) => `${row.original.estimatedHours} ساعة`,
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.price} ج.م</span>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "الحالة",
      cell: ({ row }) => {
        const published = row.original.isPublished;
        return (
          <Badge
            variant={published ? "default" : "secondary"}
            className={published ? "bg-emerald-500/15 text-emerald-600" : ""}
          >
            {published ? "منشور" : "مسودة"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <AdminButton
            type="button"
            variant="ghost"
            size="icon-sm"
            icon={Eye}
            onClick={() => router.push(`/admin/learning-paths/${row.original.id}/preview`)}
            aria-label="معاينة"
          />
          <AdminButton
            type="button"
            variant="ghost"
            size="icon-sm"
            icon={Pencil}
            onClick={() => openDialog(row.original)}
            aria-label="تعديل"
          />
          <AdminButton
            type="button"
            variant="ghost"
            size="icon-sm"
            icon={Trash2}
            className="text-destructive"
            onClick={() => setDeleteDialog({ open: true, id: row.original.id })}
            aria-label="حذف"
          />
        </div>
      ),
    },
  ];

  const publishedCount = paths.filter((p) => p.isPublished).length;
  const totalCourses = paths.reduce((sum, p) => sum + (p.items?.length ?? 0), 0);

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="مسارات التعلّم"
        description="اربط عدة دورات في مسار متسلسل موجّه، مع شهادة إتمام اختيارية في النهاية."
        badge={`${paths.length} مسار`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()}>
            تحديث
          </AdminButton>
          <AdminButton icon={Plus} onClick={() => openDialog()}>
            مسار جديد
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">إجمالي المسارات</span>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-black">{paths.length}</p>
        </AdminCard>
        <AdminCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">المسارات المنشورة</span>
            <Layers className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black">{publishedCount}</p>
        </AdminCard>
        <AdminCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">الدورات المرتبطة</span>
            <Clock className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="text-3xl font-black">{totalCourses}</p>
        </AdminCard>
      </div>

      <AdminDataTable
        columns={columns}
        data={paths}
        loading={isLoading}
        emptyMessage={{
          title: "لا توجد مسارات بعد",
          description: "ابدأ بإنشاء مسار تعلّم يربط عدة دورات بترتيب محدد.",
        }}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
            setItems([]);
            form.reset(defaultValues);
          }
        }}
      >
        <DialogContent className="max-w-3xl rounded-[2rem] p-0">
          <div className="p-6 sm:p-8" dir="rtl">
            <DialogHeader className="space-y-2 text-right">
              <DialogTitle className="text-2xl font-black">
                {editing ? "تعديل مسار تعلّم" : "إضافة مسار تعلّم"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم (بالإنجليزية)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Full Stack Path" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم (بالعربية)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="مسار تطوير الويب" />
                        </FormControl>
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
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          className="min-h-[100px]"
                          placeholder="وصف المسار التعليمي."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المستوى</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="INTERMEDIATE" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر (ج.م)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الساعات المقدرة</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرابط المختصر</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="full-stack-path" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="certificateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرّف شهادة الإتمام (اختياري)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="UUID الشهادة" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">نشط</FormLabel>
                          <p className="text-xs text-muted-foreground">إمكانية رؤية المسار للطلاب.</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">منشور</FormLabel>
                          <p className="text-xs text-muted-foreground">نشر المسار في الواجهة العامة.</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-border/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">دورات المسار</span>
                    <span className="text-xs text-muted-foreground">{items.length} دورة</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={subjectIdInput}
                      onChange={(e) => setSubjectIdInput(e.target.value)}
                      placeholder="أدخل معرّف الدورة (UUID) ثم أضف"
                      className="flex-1"
                    />
                    <AdminButton type="button" variant="outline" icon={Plus} onClick={addItem}>
                      إضافة
                    </AdminButton>
                  </div>
                  {items.length > 0 ? (
                    <ul className="space-y-2">
                      {items.map((item, idx) => (
                        <li
                          key={item.subjectId}
                          className="flex items-center justify-between rounded-xl bg-background/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                              {idx + 1}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.subject?.name || item.subjectId}
                            </span>
                            {item.isRequired ? (
                              <Badge variant="outline" className="text-[10px]">مطلوبة</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">اختيارية</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <AdminButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRequired(item.subjectId)}
                            >
                              {item.isRequired ? "جعلها اختيارية" : "جعلها مطلوبة"}
                            </AdminButton>
                            <AdminButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              icon={Trash2}
                              className="text-destructive"
                              onClick={() => removeItem(item.subjectId)}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      لم تتم إضافة دورات بعد.
                    </p>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:justify-start">
                  <AdminButton type="submit" icon={editing ? Pencil : Plus}>
                    {editing ? "حفظ التعديلات" : "إنشاء المسار"}
                  </AdminButton>
                  <AdminButton type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </AdminButton>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
        onConfirm={handleDelete}
        title="حذف المسار"
        description="سيتم حذف مسار التعلّم وجميع الدورات المرتبطة به نهائيًا."
        confirmText="حذف المسار"
        variant="destructive"
      />
    </div>
  );
}
