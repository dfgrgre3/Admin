"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Gauge, Database, Cpu } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function PerformanceTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Gauge} title="إعدادات الأداء" description="التخزين المؤقت والاستجابة وضغط البيانات" color="orange" />

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Cpu className="w-4 h-4" /> تحسينات الأداء
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "performance.enableCaching" as const, label: "التخزين المؤقت", desc: "تفعيل Cache لتسريع الاستجابة" },
            { name: "performance.enableRedis" as const, label: "Redis Cache", desc: "استخدام Redis للتخزين المؤقت" },
            { name: "performance.enableImageOptimization" as const, label: "تحسين الصور", desc: "ضغط وتحسين الصور تلقائياً" },
            { name: "performance.enableLazyLoading" as const, label: "التحميل الكسول", desc: "تحميل العناصر عند الحاجة فقط" },
            { name: "performance.enableGzipCompression" as const, label: "ضغط Gzip", desc: "تقليل حجم البيانات المنقولة" },
            { name: "performance.enableMinification" as const, label: "تصغير الكود", desc: "تقليل حجم ملفات JS و CSS" },
            { name: "performance.enableDbConnectionPooling" as const, label: "تجميع اتصالات DB", desc: "إدارة اتصالات قاعدة البيانات" },
          ].map(({ name, label, desc }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <AdminCard variant="glass" className="p-5 hover:border-orange-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel className="font-black text-xs">{label}</FormLabel>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                </div>
              </AdminCard>
            )} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Database className="w-4 h-4" /> حدود الأداء
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "performance.cacheTTLSeconds" as const, label: "مدة الـ Cache (ثانية)", min: 60 },
            { name: "performance.paginationDefaultLimit" as const, label: "عدد نتائج الصفحة الافتراضي", min: 5 },
            { name: "performance.paginationMaxLimit" as const, label: "أقصى نتائج في الصفحة", min: 10 },
            { name: "performance.queryTimeoutSeconds" as const, label: "مهلة الاستعلام (ثانية)", min: 5 },
            { name: "performance.maxConcurrentRequests" as const, label: "الطلبات المتزامنة القصوى", min: 10 },
            { name: "performance.dbPoolMaxOpenConns" as const, label: "أقصى اتصالات DB مفتوحة", min: 1 },
            { name: "performance.dbPoolMaxIdleConns" as const, label: "أقصى اتصالات DB خاملة", min: 1 },
            { name: "performance.dbPoolConnMaxLifetimeMinutes" as const, label: "عمر اتصال DB (دقيقة)", min: 1 },
          ].map(({ name, label, min }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input type="number" min={min} {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
        </div>
      </div>
    </div>
  );
}
