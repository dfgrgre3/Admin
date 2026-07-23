"use client";

import * as React from "react";
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
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useForm } from "react-hook-form";
import { Check, UserPlus, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { billingApi } from "@/lib/api/billing-api";
import { statusOptions, tierOptions, Affiliate } from "./types";

const affiliateSchema = z.object({
  userId: z.string().min(1, "معرف المستخدم مطلوب"),
  code: z.string().optional(),
  commissionRate: z.number().min(0).max(100, "النسبة يجب أن تكون 0-100"),
  tier: z.string().min(1, "الفئة مطلوبة"),
  status: z.string().min(1, "الحالة مطلوبة"),
});

type AffiliateFormValues = z.infer<typeof affiliateSchema>;

interface AffiliateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAffiliate: Affiliate | null;
  onSuccess: () => void;
}

export function AffiliateFormDialog({
  open,
  onOpenChange,
  editingAffiliate,
  onSuccess,
}: AffiliateFormDialogProps) {
  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      userId: "",
      code: "",
      commissionRate: 10,
      tier: "BRONZE",
      status: "ACTIVE",
    },
  });

  React.useEffect(() => {
    if (editingAffiliate) {
      form.reset({
        userId: editingAffiliate.userId,
        code: editingAffiliate.code,
        commissionRate: editingAffiliate.commissionRate,
        tier: editingAffiliate.tier,
        status: editingAffiliate.status,
      });
    } else {
      form.reset({
        userId: "",
        code: "",
        commissionRate: 10,
        tier: "BRONZE",
        status: "ACTIVE",
      });
    }
  }, [editingAffiliate, form]);

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (values: AffiliateFormValues) => {
    setSubmitting(true);
    try {
      if (editingAffiliate) {
        await billingApi.updateAffiliate(editingAffiliate.id, {
          code: values.code || undefined,
          commissionRate: values.commissionRate,
          tier: values.tier,
          status: values.status,
        });
        toast.success("تم تحديث بيانات المسوق بنجاح");
      } else {
        await billingApi.createAffiliate({
          userId: values.userId,
          code: values.code || undefined,
          commissionRate: values.commissionRate,
          tier: values.tier,
          status: values.status,
        });
        toast.success("تم إنشاء حساب المسوق بنجاح");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black">
              {editingAffiliate ? "تعديل بيانات المسوق" : "إضافة مسوق جديد"}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              {editingAffiliate
                ? "حدّث بيانات حساب المسوق بالعمولة."
                : "أنشئ حساب مسوق جديد واربطه بمستخدم موجود."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                معرف المستخدم (UUID)
              </label>
              <Input
                {...form.register("userId")}
                dir="ltr"
                placeholder="00000000-0000-0000-0000-000000000000"
                disabled={!!editingAffiliate}
                className="rounded-xl border-white/10 bg-white/5 h-11"
              />
              {form.formState.errors.userId && (
                <p className="text-xs text-red-500">{form.formState.errors.userId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                كود الإحالة (اختياري - يُولّد تلقائياً)
              </label>
              <Input
                {...form.register("code")}
                dir="ltr"
                placeholder="AFF1234"
                className="rounded-xl border-white/10 bg-white/5 h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                  نسبة العمولة (%)
                </label>
                <Input
                  {...form.register("commissionRate", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  className="rounded-xl border-white/10 bg-white/5 h-11 text-center font-black"
                />
                {form.formState.errors.commissionRate && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.commissionRate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                  الفئة (Tier)
                </label>
                <Select
                  onValueChange={(v) => form.setValue("tier", v)}
                  value={form.watch("tier")}
                >
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                الحالة
              </label>
              <Select
                onValueChange={(v) => form.setValue("status", v)}
                value={form.watch("status")}
              >
                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <AdminButton
                type="submit"
                icon={editingAffiliate ? Sparkles : Check}
                loading={submitting}
                className="w-full h-14 text-md font-black shadow-xl rounded-2xl"
              >
                {editingAffiliate ? "تحديث بيانات المسوق" : "حفظ المسوق الجديد"}
              </AdminButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
