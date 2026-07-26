"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Tag,
  Percent,
  Calendar,
  CheckCircle2,
  Save,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";

const pricingSchema = z.object({
  price: z.coerce.number().min(0, "السعر يجب أن يكون 0 أو أكبر"),
  currency: z.string().min(1, "العملة مطلوبة"),
  discount: z.coerce.number().min(0, "الخصم يجب أن يكون 0 أو أكبر").max(100, "الخصم لا يمكن أن يتجاوز 100%"),
  discountValidUntil: z.string().optional(),
  subscriptionAvailable: z.boolean(),
  subscriptionPrice: z.coerce.number().optional(),
});

type PricingFormValues = z.infer<typeof pricingSchema>;

interface CoursePricingData {
  price: number;
  currency: string;
  discount: number;
  discountValidUntil: string | null;
  subscriptionAvailable: boolean;
  subscriptionPrice: number | null;
  finalPrice: number;
}

export default function CoursePricingPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManageCourses = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);
  const canViewCourses = hasPermission(PERMISSIONS.SUBJECTS_VIEW);

  const { data: pricingData, isLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "pricing"],
    queryFn: async (): Promise<CoursePricingData> => {
      const response = await adminFetch(apiRoutes.admin.coursePricing(courseId));
      if (!response.ok) throw new Error("فشل تحميل التسعير");
      const result = await response.json();
      return result.data?.pricing || result.data || result;
    },
    staleTime: 30_000,
  });

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      price: 0,
      currency: "EGP",
      discount: 0,
      discountValidUntil: "",
      subscriptionAvailable: false,
      subscriptionPrice: 0,
    },
  });

  React.useEffect(() => {
    if (pricingData) {
      form.reset({
        price: pricingData.price,
        currency: pricingData.currency,
        discount: pricingData.discount,
        discountValidUntil: pricingData.discountValidUntil || "",
        subscriptionAvailable: pricingData.subscriptionAvailable,
        subscriptionPrice: pricingData.subscriptionPrice || 0,
      });
    }
  }, [pricingData, form]);

  const updatePricingMutation = useMutation({
    mutationFn: async (values: PricingFormValues) => {
      const response = await adminFetch(apiRoutes.admin.coursePricing(courseId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("فشل تحديث التسعير");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث التسعير بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId, "pricing"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    },
  });

  const onSubmit = (values: PricingFormValues) => {
    updatePricingMutation.mutate(values);
  };

  const { watch } = form;
  const price = watch("price");
  const discount = watch("discount");
  const subscriptionAvailable = watch("subscriptionAvailable");

  const finalPrice = React.useMemo(() => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  }, [price, discount]);

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-64 bg-muted/30 rounded-xl animate-pulse" />
        <div className="h-48 bg-muted/30 rounded-2xl animate-pulse" />
        <div className="h-96 bg-muted/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!canViewCourses) {
    return (
      <div className="flex h-[60vh] items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
          <p className="text-lg font-bold text-muted-foreground">ليس لديك صلاحية لعرض هذه الصفحة</p>
          <p className="text-sm text-muted-foreground/60 mt-2">يرجى التواصل مع المسؤول للحصول على الصلاحيات المطلوبة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-3xl font-black tracking-tight">التسعير</h2>
        <p className="text-sm font-bold text-muted-foreground mt-1">
          إدارة سعر الدورة والخصومات والاشتراكات
        </p>
      </div>

      {/* Current Pricing Summary */}
      <AdminCard className="border-border/40 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">ملخص التسعير الحالي</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "السعر الأساسي",
              value: formatPrice(price),
              icon: Tag,
              color: "text-blue-400",
              bg: "bg-blue-500/15",
            },
            {
              label: "الخصم",
              value: `${discount}%`,
              icon: Percent,
              color: discount > 0 ? "text-emerald-400" : "text-slate-400",
              bg: discount > 0 ? "bg-emerald-500/15" : "bg-slate-500/15",
            },
            {
              label: "السعر النهائي",
              value: formatPrice(finalPrice),
              icon: DollarSign,
              color: "text-amber-400",
              bg: "bg-amber-500/15",
            },
            {
              label: "العملة",
              value: watch("currency"),
              icon: DollarSign,
              color: "text-violet-400",
              bg: "bg-violet-500/15",
            },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-4">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Pricing Form */}
      <AdminCard className="border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-black">تعديل التسعير</h3>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">السعر الأساسي</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  {...form.register("price")}
                  className="h-11 pr-10 rounded-xl text-sm font-bold"
                  placeholder="0.00"
                />
              </div>
              {form.formState.errors.price && (
                <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">العملة</Label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => form.setValue("currency", value)}
              >
                <SelectTrigger className="h-11 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">نسبة الخصم (%)</Label>
              <div className="relative">
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  {...form.register("discount")}
                  className="h-11 pr-10 rounded-xl text-sm font-bold"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              {form.formState.errors.discount && (
                <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.discount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase">صلاحية الخصم</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  {...form.register("discountValidUntil")}
                  className="h-11 pr-10 rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">الاشتراك الشهري متاح</p>
                <p className="text-[10px] text-muted-foreground">السماح للطلاب بالاشتراك الشهري في الدورة</p>
              </div>
            </div>
            <Switch
              checked={subscriptionAvailable}
              onCheckedChange={(checked) => form.setValue("subscriptionAvailable", checked)}
            />
          </div>

          {subscriptionAvailable && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label className="text-[10px] font-black uppercase">سعر الاشتراك الشهري</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  {...form.register("subscriptionPrice")}
                  className="h-11 pr-10 rounded-xl text-sm font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <AdminButton
              type="submit"
              disabled={updatePricingMutation.isPending}
              className="gap-2 rounded-xl h-11 px-6 font-black"
            >
              {updatePricingMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التغييرات
            </AdminButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
