"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HardDrive, Image, Archive } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function StorageTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={HardDrive} title="إعدادات التخزين" description="إدارة الملفات والوسائط والضغط والـ CDN" color="cyan" />

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <HardDrive className="w-4 h-4" /> عام
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "storage.maxUploadSizeMB" as const, label: "حجم الرفع الأقصى (MB)", type: "number" as const, min: 1 },
            { name: "storage.cdnUrl" as const, label: "رابط CDN", type: "text" as const, placeholder: "https://cdn.example.com" },
            { name: "storage.cleanupTempFilesAfterHours" as const, label: "حذف الملفات المؤقتة بعد (ساعة)", type: "number" as const, min: 1 },
          ].map(({ name, label, type, min, placeholder }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input type={type} min={min} placeholder={placeholder} {...field} onChange={type === "number" ? (e) => field.onChange(Number(e.target.value)) : field.onChange} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
          {[
            { name: "storage.enableCDN" as const, label: "تفعيل CDN", desc: "توزيع الملفات عبر شبكة عالمية" },
            { name: "storage.enableCompression" as const, label: "ضغط الملفات", desc: "تقليل حجم الملفات تلقائياً" },
          ].map(({ name, label, desc }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <AdminCard variant="glass" className="p-5">
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
          <Image className="w-4 h-4" /> الصور والمصغرات
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "storage.imageQuality" as const, label: "جودة الصورة (1-100)", min: 1, max: 100 },
            { name: "storage.imageMaxWidth" as const, label: "أقصى عرض للصورة (px)", min: 100 },
            { name: "storage.imageMaxHeight" as const, label: "أقصى ارتفاع للصورة (px)", min: 100 },
            { name: "storage.thumbnailWidth" as const, label: "عرض المصغرة (px)", min: 50 },
            { name: "storage.thumbnailHeight" as const, label: "ارتفاع المصغرة (px)", min: 50 },
          ].map(({ name, label, min, max }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input type="number" min={min} max={max} {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
          <FormField control={form.control} name="storage.enableThumbnails" render={({ field }) => (
            <AdminCard variant="glass" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="font-black text-xs">إنشاء مصغرات تلقائياً</FormLabel>
                  <p className="text-[10px] text-muted-foreground">توليد صور مصغرة عند الرفع</p>
                </div>
                <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
              </div>
            </AdminCard>
          )} />
        </div>
      </div>
    </div>
  );
}
