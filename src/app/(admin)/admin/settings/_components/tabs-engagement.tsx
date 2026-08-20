"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Star, Zap, Target, Trophy } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function EngagementTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Star} title="نظام التحفيز والتقدير" description="إعداد نقاط المكافآت ومحفزات التعلم" color="purple" />
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { name: "engagement.pointsPerTask" as const, label: "نقاط إتمام المهمة", icon: Target, desc: "عدد النقاط الممنوحة عند إكمال مهمة تعليمية" },
          { name: "engagement.pointsPerStudySession" as const, label: "نقاط جلسة الدراسة", icon: Zap, desc: "نقاط لكل جلسة دراسة فعّالة" },
          { name: "engagement.pointsPerExam" as const, label: "نقاط الامتحان", icon: Trophy, desc: "نقاط ممنوحة عند اجتياز الامتحان" },
          { name: "engagement.streakBonus" as const, label: "مضاعف الاستمرارية", icon: Star, desc: "معامل مضاعفة النقاط عند الدراسة المتواصلة" },
        ].map(({ name, label, icon: Icon, desc }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-6 hover:border-purple-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormLabel className="font-black text-sm">{label}</FormLabel>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-10 rounded-xl border-white/10 bg-white/5 font-bold"
                        />
                      </FormControl>
                    </div>
                  </div>
                </AdminCard>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}
