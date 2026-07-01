"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField } from "@/components/ui/form";
import { Users, Lock, Star, MessageCircle, Layout, Sparkles } from "lucide-react";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn, Path } from "react-hook-form";

const FEATURES_LIST = [
  { key: "registration", label: "تسجيل المستخدمين", icon: Users, desc: "السماح بانضمام مستخدمين جدد للمنصة" },
  { key: "emailVerification", label: "التحقق من البريد", icon: Lock, desc: "طلب التأكد من هوية المستخدم عبر البريد" },
  { key: "engagement", label: "نظام التحفيز والتقدير", icon: Star, desc: "تفعيل نظام النقاط والمستويات للطلاب" },
  { key: "forum", label: "منتدى النقاش العلمي", icon: MessageCircle, desc: "تفعيل ساحات الحوار والتبادل المعرفي" },
  { key: "blog", label: "المدونة الأكاديمية", icon: Layout, desc: "تفعيل التدوينات والمقالات التعليمية" },
  { key: "aiAssistant", label: "المساعد التعليمي (AI)", icon: Sparkles, desc: "تفعيل الذكاء الاصطناعي لمساعدة الطلاب" },
] as const;

export function FeaturesTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {FEATURES_LIST.map((feature) => (
        <FormField
          key={feature.key}
          control={form.control}
          name={`features.${feature.key}` as Path<SettingsFormValues>}
          render={({ field }) => (
            <AdminCard variant="glass" className="p-6 transition-all hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="p-3 rounded-2xl bg-white/5 text-primary border border-white/10">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm tracking-tight">{feature.label}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
                <Switch checked={field.value as boolean} onCheckedChange={field.onChange} className="bg-white/10" />
              </div>
            </AdminCard>
          )}
        />
      ))}
    </div>
  );
}