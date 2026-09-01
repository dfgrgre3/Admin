"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Hammer, Package, Sparkles } from "lucide-react";
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
import { AdminButton } from "@/components/admin/ui/admin-button";
import type { PlanFormValues, SubscriptionPlan } from "../_lib/types";
import { planSchema } from "../_lib/schema";
import {
  CURRENCY_OPTIONS,
  DEFAULT_FORM_VALUES,
  INTERVAL_LABELS,
} from "../_lib/constants";
import { useCreatePlan, useUpdatePlan } from "../_hooks/use-plans";

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
}

export function PlanFormDialog({
  open,
  onOpenChange,
  editingPlan,
  plans,
}: PlanFormDialogProps) {
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // إعادة تعبئة النموذج عند فتح الحوار (إنشاء أو تعديل)
  React.useEffect(() => {
    if (!open) return;
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        nameAr: editingPlan.nameAr,
        description: editingPlan.description || "",
        price: editingPlan.price,
        currency: editingPlan.currency,
        interval: editingPlan.interval,
        isActive: editingPlan.isActive,
        features: Array.isArray(editingPlan.features)
          ? editingPlan.features.join("\n")
          : "",
        groupKey:
          editingPlan.groupKey && editingPlan.groupKey !== editingPlan.id
            ? editingPlan.groupKey
            : "",
      });
    } else {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [open, editingPlan, form]);

  // خطط قابلة للربط (خطة ممثلة واحدة لكل مجموعة، باستثناء الخطة قيد التعديل)
  const linkablePlans = React.useMemo(() => {
    const seen = new Set<string>();
    const result: SubscriptionPlan[] = [];
    for (const p of plans) {
      if (editingPlan && p.id === editingPlan.id) continue;
      const key = p.groupKey || p.id;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(p);
    }
    return result;
  }, [plans, editingPlan]);

  const handleSubmit = async (values: PlanFormValues) => {
    try {
      if (editingPlan) {
        await updateMutation.mutateAsync({ id: editingPlan.id, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // رسالة الخطأ معروضة داخل الـ hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] border-white/10 bg-card/80 p-0 shadow-2xl backdrop-blur-xl">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              {editingPlan ? (
                <>
                  <Hammer className="h-7 w-7 text-indigo-500" />
                  تعديل الخطة
                </>
              ) : (
                <>
                  <Sparkles className="h-7 w-7 text-orange-500" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        الاسم (إنجليزي)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Premium Monthly"
                          dir="ltr"
                          className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-center font-mono font-black"
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        الاسم (عربي)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="مثلاً: البريميوم الشهري"
                          className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-center font-black"
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        السعر
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step={0.01}
                          className="h-12 rounded-xl border-white/10 bg-white/5 text-center font-black"
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        العملة
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          list="plan-currencies"
                          className="h-12 rounded-xl border-white/10 bg-white/5 text-center font-black"
                        />
                      </FormControl>
                      <datalist id="plan-currencies">
                        {CURRENCY_OPTIONS.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        المدة
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-white/10">
                          {(["MONTHLY", "YEARLY", "FOREVER"] as const).map((interval) => (
                            <SelectItem key={interval} value={interval} className="font-bold cursor-pointer">
                              {INTERVAL_LABELS[interval]}
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
                name="groupKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      ربط بخطة أخرى (اختياري)
                    </FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5">
                          <SelectValue placeholder="بدون ربط" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-white/10">
                        <SelectItem value="__none__" className="font-bold cursor-pointer">
                          بدون ربط (خطة مستقلة)
                        </SelectItem>
                        {linkablePlans.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.groupKey || p.id}
                            className="font-bold cursor-pointer"
                          >
                            {p.nameAr} — {INTERVAL_LABELS[p.interval]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="px-1 text-[10px] font-medium text-muted-foreground">
                      اربط هذه الخطة بخطة أخرى بنفس الفئة (مثلاً: نفس الباقة بسعر شهري وآخر
                      سنوي) ليظهرا معاً كخيارَي دورة فوترة واحدة أمام المستخدم.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      الوصف (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="وصف مختصر للخطة..."
                        className="min-h-[80px] rounded-2xl border-white/10 bg-white/5 p-4 font-medium"
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      المميزات (ميزة واحدة في كل سطر)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={`دروس غير محدودة\nامتحانات تجريبية\nدعم فني على مدار الساعة`}
                        dir="ltr"
                        className="min-h-[120px] rounded-2xl border-white/10 bg-white/5 p-4 font-mono text-sm font-medium"
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
                <AdminButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  إلغاء
                </AdminButton>
                <AdminButton type="submit" icon={Package} loading={isPending}>
                  {editingPlan ? "تحديث الخطة" : "إنشاء الخطة"}
                </AdminButton>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
