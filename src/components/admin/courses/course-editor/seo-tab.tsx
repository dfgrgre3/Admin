"use client";

import {
  ChevronRight,
  Globe,
  Rocket,
  Search,
  Trophy,
  Wand2,
} from "lucide-react";
import type { Control, UseFormWatch } from "react-hook-form";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import type { CourseFormValues } from "./types";
import { SubmitIcon } from "./shared-components";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface SeoTabProps {
  control: Control<CourseFormValues>;
  watch: UseFormWatch<CourseFormValues>;
  isSubmitting: boolean;
  onPrev: () => void;
}

export function SeoTab({
  control,
  watch,
  isSubmitting,
  onPrev,
}: SeoTabProps) {
  return (
    <TabsContent value="seo" className="mt-0 space-y-6">
      <AdminCard className="p-6">
        <div className="grid gap-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black">
              تهيئة محركات البحث والتسويق
            </h3>
          </div>

          <FormField
            control={control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="font-bold">
                    رابط الصفحة (Slug)
                  </FormLabel>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] gap-1.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg"
                    onClick={() => {
                      const source = watch("name") || watch("nameAr") || "";
                      const generated = slugify(source);
                      if (generated) {
                        field.onChange(generated);
                      } else {
                        toast.error("أدخل اسم الدورة أولاً لتوليد الرابط");
                      }
                    }}
                  >
                    <Wand2 className="h-3 w-3" />
                    توليد من الاسم
                  </AdminButton>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="mathematics-grade-3"
                      className="h-12 rounded-xl pl-32"
                      dir="ltr"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                      /courses/
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-[10px]">
                  اترك الحقل فارغاً سيتم إنتاجه من الاسم تلقائياً.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    عنوان الصفحة (Meta Title)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-12 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    وصف محركات البحث (Meta Description)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      className="min-h-[80px] rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="p-6 rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-muted-foreground flex items-center gap-2">
                <Search className="h-4.5 w-4.5 text-primary" />
                معاينة النتيجة على محرك بحث جوجل (Google Preview)
              </h4>
              <div className="flex bg-muted/60 p-1 rounded-xl text-[10px] font-bold">
                <span className="px-2.5 py-1 bg-background text-foreground rounded-lg shadow-sm">إصدار الجوال</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border/40 shadow-sm max-w-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20">
                  T
                </div>
                <div className="flex flex-col text-[11px] leading-tight">
                  <span className="font-bold text-foreground">منصة تولو التعليمية</span>
                  <span className="text-muted-foreground/80 font-mono text-[9px]">https://thanawy.com/courses/{watch("slug") || "course-url"}</span>
                </div>
              </div>

              <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[19px] font-medium leading-tight hover:underline cursor-pointer">
                {watch("seoTitle") || watch("nameAr") || "عنوان الدورة التعليمية يظهر هنا - منصة تولو"}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span>سعر الدورة: {watch("price") === 0 ? "مجانية" : `${watch("price")} ج.م`}</span>
              </div>

              <div className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                {watch("seoDescription") || watch("description") || "وصف الدورة التعريفي والـ SEO يظهر هنا بشكل منظم لجذب أنظار الطلاب الباحثين على محرك جوجل..."}
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-6 bg-slate-900 border-primary/20">
        <div className="flex items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-black text-white">
                حالة النشر والظهور
              </h3>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              عند تفعيل النشر، ستظهر الدورة لجميع الطلاب في المتجر التعليمي. تأكد من أن جميع الوحدات التعليمية جاهزة.
            </p>

            <div className="flex items-center gap-8">
              <FormField
                control={control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </FormControl>
                    <FormLabel className="text-white font-bold cursor-pointer">
                      نشر الدورة فوراً
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </FormControl>
                    <FormLabel className="text-white font-bold cursor-pointer">
                      تمييز الدورة
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-white font-bold cursor-pointer">
                      تفعيل الدورة (Active)
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="hidden md:block relative z-10">
            <div className="h-32 w-32 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-3xl shadow-2xl rotate-12">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="flex justify-between">
        <AdminButton
          type="button"
          variant="outline"
          onClick={onPrev}
          className="h-12 rounded-xl px-8 font-black gap-3"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </AdminButton>
        <AdminButton
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-xl px-12 font-black gap-3 text-lg"
        >
          <SubmitIcon isSubmitting={isSubmitting} size="5" />
          إكمال وحفظ الدورة
        </AdminButton>
      </div>
    </TabsContent>
  );
}
