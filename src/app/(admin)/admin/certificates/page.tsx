"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Award, Pencil, Plus, RefreshCw, Trash2, Send } from "lucide-react";
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

interface Certificate {
  id: string;
  subjectId?: string | null;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  status: string;
  issuerName?: string | null;
  validityDays: number;
  requiresQuiz: boolean;
  minScore: number;
  backgroundColor?: string | null;
  subject?: { id: string; name: string } | null;
  _count?: { awards?: number };
}

const certificateSchema = z.object({
  title: z.string().min(1, "عنوان الشهادة مطلوب"),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  issuerName: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  validityDays: z.coerce.number().int().min(0),
  requiresQuiz: z.boolean(),
  minScore: z.coerce.number().min(0).max(100),
  backgroundColor: z.string().optional().nullable(),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

const defaultValues: CertificateFormValues = {
  title: "",
  titleAr: "",
  description: "",
  subjectId: "",
  issuerName: "",
  status: "ACTIVE",
  validityDays: 0,
  requiresQuiz: false,
  minScore: 0,
  backgroundColor: "#0f172a",
};

export default function AdminCertificatesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Certificate | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const { data: certificates = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "certificates"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.certificates);
      const result = await response.json();
      return (result.data?.certificates || []) as Certificate[];
    },
  });

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues,
  });

  const openDialog = (cert?: Certificate) => {
    if (cert) {
      setEditing(cert);
      form.reset({
        title: cert.title,
        titleAr: cert.titleAr || "",
        description: cert.description || "",
        subjectId: cert.subjectId || "",
        issuerName: cert.issuerName || "",
        status: cert.status,
        validityDays: cert.validityDays,
        requiresQuiz: cert.requiresQuiz,
        minScore: cert.minScore,
        backgroundColor: cert.backgroundColor || "#0f172a",
      });
    } else {
      setEditing(null);
      form.reset(defaultValues);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (values: CertificateFormValues) => {
    try {
      const payload = {
        ...values,
        subjectId: values.subjectId || null,
      };
      const method = editing ? "PATCH" : "POST";
      const url = editing ? apiRoutes.admin.certificateById(editing.id) : apiRoutes.admin.certificates;
      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result?.error || result?.message || "تعذر حفظ الشهادة");
        return;
      }
      toast.success(editing ? "تم تحديث الشهادة بنجاح" : "تم إنشاء الشهادة بنجاح");
      setDialogOpen(false);
      setEditing(null);
      form.reset(defaultValues);
      await refetch();
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminFetch(apiRoutes.admin.certificateById(deleteDialog.id), {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result?.error || "تعذر حذف الشهادة");
        return;
      }
      toast.success("تم حذف الشهادة بنجاح");
      await refetch();
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const columns: ColumnDef<Certificate>[] = [
    {
      accessorKey: "title",
      header: "الشهادة",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-bold">{row.original.title}</p>
          {row.original.titleAr && (
            <p className="text-xs text-muted-foreground">{row.original.titleAr}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "الدورة المرتبطة",
      cell: ({ row }) =>
        row.original.subject ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-bold">
            {row.original.subject.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const active = row.original.status === "ACTIVE";
        return (
          <Badge
            variant={active ? "default" : "secondary"}
            className={active ? "bg-emerald-500/15 text-emerald-600" : ""}
          >
            {active ? "نشطة" : "غير نشطة"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "requiresQuiz",
      header: "شرط الاختبار",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.requiresQuiz ? `نعم (${row.original.minScore}%)` : "لا"}</span>
      ),
    },
    {
      accessorKey: "awards",
      header: "الشهادات المُصدرة",
      cell: ({ row }) => <span className="font-bold">{row.original._count?.awards ?? 0}</span>,
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onView={openDialog}
          onEdit={openDialog}
          onDelete={(cert) => setDeleteDialog({ open: true, id: cert.id })}
        />
      ),
    },
  ];

  const activeCount = certificates.filter((c) => c.status === "ACTIVE").length;
  const totalAwards = certificates.reduce((sum, c) => sum + (c._count?.awards ?? 0), 0);

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="شهادات الدورات"
        description="أنشئ شهادات الإكمال التي تُمنح للطلاب بعد إنهاء الدورات بنجاح."
        badge={`${certificates.length} شهادة`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()}>
            تحديث
          </AdminButton>
          <AdminButton icon={Plus} onClick={() => openDialog()}>
            شهادة جديدة
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">إجمالي الشهادات</span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-black">{certificates.length}</p>
        </AdminCard>
        <AdminCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">الشهادات النشطة</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black">{activeCount}</p>
        </AdminCard>
        <AdminCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">الشهادات المُصدرة</span>
            <Send className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="text-3xl font-black">{totalAwards}</p>
        </AdminCard>
      </div>

      <AdminDataTable
        columns={columns}
        data={certificates}
        loading={isLoading}
        emptyMessage={{
          title: "لا توجد شهادات بعد",
          description: "ابدأ بإنشاء قالب شهادة جديد لربطه بالدورات.",
        }}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
            form.reset(defaultValues);
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-[2rem] p-0">
          <div className="p-6 sm:p-8" dir="rtl">
            <DialogHeader className="space-y-2 text-right">
              <DialogTitle className="text-2xl font-black">
                {editing ? "تعديل شهادة" : "إضافة شهادة جديدة"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان (بالإنجليزية)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Completion Certificate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="titleAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان (بالعربية)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="شهادة إتمام" />
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
                          placeholder="وصف الشهادة المعروض للطلاب."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرّف الدورة (اختياري)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="UUID الدورة" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="issuerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الجهة المانحة</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Thanawy Academy" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="validityDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة الصلاحية (يوم)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>أدنى درجة (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لون الخلفية</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} value={field.value || "#0f172a"} className="h-10 p-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requiresQuiz"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">يتطلب اجتياز اختبار</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          لا تُمنح الشهادة إلا بعد تجاوز الدورة بدرجة كافية.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2 sm:justify-start">
                  <AdminButton type="submit" icon={editing ? Pencil : Plus}>
                    {editing ? "حفظ التعديلات" : "إنشاء الشهادة"}
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
        title="حذف الشهادة"
        description="سيتم حذف قالب الشهادة نهائيًا. الشهادات المُصدرة مسبقاً ستبقى مسجلة."
        confirmText="حذف الشهادة"
        variant="destructive"
      />
    </div>
  );
}
