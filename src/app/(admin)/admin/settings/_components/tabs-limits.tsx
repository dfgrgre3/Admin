"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Wrench, Upload, Clock, Timer } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function LimitsTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Wrench} title="حدود النظام" description="ضبط الحدود القصوى لعمليات المنصة" color="emerald" />
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { name: "limits.maxUploadSize" as const, label: "حجم الرفع الأقصى (ميجابايت)", icon: Upload, desc: "الحد الأقصى لحجم الملف المرفوع من المستخدم" },
          { name: "limits.maxStudySessionDuration" as const, label: "مدة الجلسة القصوى (دقائق)", icon: Clock, desc: "الحد الأقصى لمدة جلسة الدراسة الواحدة" },
          { name: "limits.examTimeLimit" as const, label: "وقت الامتحان الافتراضي (دقائق)", icon: Timer, desc: "المدة الافتراضية لأي امتحان لم يُحدد وقته" },
        ].map(({ name, label, icon: Icon, desc }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-6 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormLabel className="font-black text-sm">{label}</FormLabel>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
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
