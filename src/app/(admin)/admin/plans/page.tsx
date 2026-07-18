"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Package,
  Search,
  DollarSign,
  Activity,
  TrendingUp,
  Calendar,
  Sparkles,
  Hammer,
  Check,
  X,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { m } from "framer-motion";

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  currency: string;
  interval: "MONTHLY" | "YEARLY" | "FOREVER";
  isActive: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

const planSchema = z.object({
  name: z.string().min(2, "الاسم بالإنجليزية مطلوب"),
  nameAr: z.string().min(2, "الاسم بالعربية مطلوب"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  currency: z.string(),
  interval: z.enum(["MONTHLY", "YEARLY", "FOREVER"]),
  isActive: z.boolean(),
  features: z.string().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

const intervalLabels: Record<string, string> = {
  MONTHLY: "شهري",
  YEARLY: "سنوي",
  FOREVER: "مدى الحياة",
};

const intervalColors: Record<string, string> = {
  MONTHLY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  YEARLY: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  FOREVER: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<SubscriptionPlan | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.plans);
      if (!res.ok) throw new Error("Failed to fetch plans");
      const json = await res.json();
      if (Array.isArray(json)) return json as SubscriptionPlan[];
      const data = json.data || json;
      if (Array.isArray(data)) return data as SubscriptionPlan[];
      if (data && typeof data === 'object') {
        if (Array.isArray(data.plans)) return data.plans;
        if (Array.isArray(data.items)) return data.items;
      }
      return [] as SubscriptionPlan[];
    },
  });

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      price: 0,
      currency: "EGP",
      interval: "MONTHLY",
      isActive: true,
      features: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: PlanFormValues) => {
      const method = editingPlan ? "PATCH" : "POST";
      const url = editingPlan
        ? apiRoutes.admin.planById(editingPlan.id)
        : apiRoutes.admin.plans;
      const body: Record<string, unknown> = {
        name: values.name,
        nameAr: values.nameAr,
        description: values.description || "",
        price: values.price,
        currency: values.currency,
        interval: values.interval,
        isActive: values.isActive,
        features: values.features
          ? values.features.split("\n").map((f) => f.trim()).filter(Boolean)
          : [],
      };
      if (editingPlan) {
        body.id = editingPlan.id;
      }
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل في حفظ الخطة");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(editingPlan ? "تم تحديث الخطة بنجاح" : "تم إنشاء الخطة بنجاح");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(apiRoutes.admin.planById(id), { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
    },
    onSuccess: () => {
      toast.success("تم حذف الخطة");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: () => {
      toast.error("فشل في حذف الخطة");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await adminFetch(apiRoutes.admin.planById(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة الخطة");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      form.reset({
        name: plan.name,
        nameAr: plan.nameAr,
        description: plan.description || "",
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        isActive: plan.isActive,
        features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      });
    } else {
      setEditingPlan(null);
      form.reset({
        name: "",
        nameAr: "",
        description: "",
        price: 0,
        currency: "EGP",
        interval: "MONTHLY",
        isActive: true,
        features: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (values: PlanFormValues) => {
    createMutation.mutate(values);
  };

  const handleDelete = () => {
    if (!deleteDialog.id) return;
    deleteMutation.mutate(deleteDialog.id);
    setDeleteDialog({ open: false, id: null });
  };

  const plansList = Array.isArray(plans) ? plans : [];
  const filteredPlans = plansList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.includes(search);
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "active" ? p.isActive : !p.isActive);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: plansList.length,
    active: plansList.filter((p) => p.isActive).length,
    minPrice: plansList.length > 0 ? Math.min(...plansList.map((p) => p.price)) : 0,
    maxPrice: plansList.length > 0 ? Math.max(...plansList.map((p) => p.price)) : 0,
  };

  const columns: ColumnDef<SubscriptionPlan>[] = [
    {
      accessorKey: "nameAr",
      header: "الخطة",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-transform hover:scale-105">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-sm">{plan.nameAr}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60 mt-0.5">
                {plan.name}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="font-black text-lg">
              {plan.price.toLocaleString("ar-EG")}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {plan.currency}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "interval",
      header: "المدة",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <Badge
            variant="outline"
            className={`font-black text-xs px-3 py-1 rounded-lg ${
              intervalColors[plan.interval] || "bg-gray-500/10 text-gray-500"
            }`}
          >
            {intervalLabels[plan.interval] || plan.interval}
          </Badge>
        );
      },
    },
    {
      accessorKey: "features",
      header: "المميزات",
      cell: ({ row }) => {
        const features = row.original.features;
        const displayFeatures = Array.isArray(features) ? features.slice(0, 2) : [];
        const remaining = Array.isArray(features) ? features.length - 2 : 0;
        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{f}</span>
              </div>
            ))}
            {remaining > 0 && (
              <span className="text-[10px] font-bold text-primary">+{remaining} مميزات أخرى</span>
            )}
            {displayFeatures.length === 0 && (
              <span className="text-[10px] text-muted-foreground italic">لا توجد مميزات</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <button
            onClick={() => toggleMutation.mutate({ id: plan.id, isActive: !plan.isActive })}
            className="group"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  plan.isActive
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-red-500/30"
                }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-widest group-hover:underline ${
                  plan.isActive ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {plan.isActive ? "مفعّلة" : "معطّلة"}
              </span>
            </div>
          </button>
        );
      },
    },
    {
      id: "actions",
      header: "التحكم",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onEdit={handleOpenDialog}
          onDelete={(p) => setDeleteDialog({ open: true, id: p.id })}
        />
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة الخطط والاشتراكات 📦"
        description="إنشاء وإدارة خطط الاشتراك، تحديد الأسعار والمدة والمميزات لكل خطة."
      >
        <AdminButton icon={Plus} onClick={() => handleOpenDialog()}>
          إنشاء خطة جديدة
        </AdminButton>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          title="إجمالي الخطط"
          value={stats.total}
          icon={Package}
          color="blue"
          description="خطة في النظام"
        />
        <AdminStatsCard
          title="خطط مفعّلة"
          value={stats.active}
          icon={Activity}
          color="green"
          description="متاحة للاشتراك حالياً"
        />
        <AdminStatsCard
          title="أقل سعر"
          value={stats.minPrice}
          icon={TrendingUp}
          color="purple"
          description="أقل سعر بين الخطط"
        />
        <AdminStatsCard
          title="أعلى سعر"
          value={stats.maxPrice}
          icon={DollarSign}
          color="amber"
          description="أعلى سعر بين الخطط"
        />
      </div>

      {/* Table */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-glass-light dark:rpg-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
      >
        <AdminDataTable
          columns={columns}
          data={filteredPlans}
          loading={isLoading}
          searchKey="nameAr"
          searchPlaceholder="ابحث بالاسم..."
          actions={{ onRefresh: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }) }}
          toolbar={
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم الخطة..."
                  className="h-10 w-64 rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold"
                />
              </div>
              <div className="flex bg-accent/10 p-1 rounded-xl border border-border gap-1">
                {(["all", "active", "inactive"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      statusFilter === filter
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "all" ? "الكل" : filter === "active" ? "مفعّلة" : "معطّلة"}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </m.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                {editingPlan ? (
                  <>
                    <Hammer className="w-7 h-7 text-indigo-500" />
                    تعديل الخطة
                  </>
                ) : (
                  <>
                    <Sparkles className="w-7 h-7 text-orange-500" />
                    إنشاء خطة جديدة
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                حدد بيانات الخطة بدقة. يمكنك إضافة المميزات التي ستحصل عليها عند الاشتراك.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                          الاسم (إنجليزي)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Premium Monthly"
                            dir="ltr"
                            className="rounded-xl border-white/10 bg-white/5 h-12 px-4 font-mono font-black text-center"
                          />
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
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                          الاسم (عربي)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثلاً: البريميوم الشهري"
                            className="rounded-xl border-white/10 bg-white/5 h-12 px-4 font-black text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                          السعر
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            step={0.01}
                            className="rounded-xl border-white/10 bg-white/5 h-12 text-center font-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                          العملة
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-xl border-white/10 bg-white/5 h-12 text-center font-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                          المدة
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-white/10">
                            <SelectItem value="MONTHLY" className="font-bold cursor-pointer">
                              شهري
                            </SelectItem>
                            <SelectItem value="YEARLY" className="font-bold cursor-pointer">
                              سنوي
                            </SelectItem>
                            <SelectItem value="FOREVER" className="font-bold cursor-pointer">
                              مدى الحياة
                            </SelectItem>
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
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                        الوصف (اختياري)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="وصف مختصر للخطة..."
                          className="rounded-2xl border-white/10 bg-white/5 p-4 min-h-[80px] font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                        المميزات (ميزة واحدة في كل سطر)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={`دروس غير محدودة\nامتحانات تجريبية\nدعم فني على مدار الساعة`}
                          className="rounded-2xl border-white/10 bg-white/5 p-4 min-h-[120px] font-medium font-mono text-sm"
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border p-4">
                      <FormLabel className="font-black">تفعيل الخطة فوراً</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <AdminButton
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    إلغاء
                  </AdminButton>
                  <AdminButton type="submit" icon={Package} loading={createMutation.isPending}>
                    {editingPlan ? "تحديث الخطة" : "إنشاء الخطة"}
                  </AdminButton>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title="حذف الخطة"
        description="هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}