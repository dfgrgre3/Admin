"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Image, Code } from "lucide-react";
import { SectionHeader, ColorInput } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

const FONT_FAMILIES = ["Cairo, sans-serif", "Tajawal, sans-serif", "Noto Sans Arabic, sans-serif", "Inter, sans-serif"];
const FONT_SIZES = ["14px", "15px", "16px", "18px"];
const BORDER_RADII = ["4px", "8px", "12px", "16px", "24px"];

export function ThemeTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Palette} title="المظهر والتصميم" description="ألوان المنصة والخطوط والهوية البصرية" color="violet" />

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Palette className="w-4 h-4" /> الألوان
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "theme.primaryColor" as const, label: "اللون الرئيسي" },
            { name: "theme.secondaryColor" as const, label: "اللون الثانوي" },
            { name: "theme.accentColor" as const, label: "لون التمييز" },
            { name: "theme.backgroundColor" as const, label: "لون الخلفية" },
            { name: "theme.surfaceColor" as const, label: "لون السطح" },
            { name: "theme.textColor" as const, label: "لون النص" },
          ].map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-3 block">{label}</FormLabel>
                  <FormControl>
                    <ColorInput value={field.value as string} onChange={field.onChange} label={label} />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Code className="w-4 h-4" /> الطباعة والتخطيط
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField control={form.control} name="theme.fontFamily" render={({ field }) => (
            <FormItem>
              <AdminCard variant="glass" className="p-5">
                <FormLabel className="font-black text-xs mb-2 block">نوع الخط</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold">
                    {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                  </select>
                </FormControl>
              </AdminCard>
            </FormItem>
          )} />
          <FormField control={form.control} name="theme.fontSize" render={({ field }) => (
            <FormItem>
              <AdminCard variant="glass" className="p-5">
                <FormLabel className="font-black text-xs mb-2 block">حجم الخط الأساسي</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold">
                    {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormControl>
              </AdminCard>
            </FormItem>
          )} />
          <FormField control={form.control} name="theme.borderRadius" render={({ field }) => (
            <FormItem>
              <AdminCard variant="glass" className="p-5">
                <FormLabel className="font-black text-xs mb-2 block">نصف قطر الزوايا</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold">
                    {BORDER_RADII.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FormControl>
              </AdminCard>
            </FormItem>
          )} />
        </div>
      </div>

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Image className="w-4 h-4" /> الهوية البصرية
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "theme.logoUrl" as const, label: "رابط الشعار (Logo)", placeholder: "https://..." },
            { name: "theme.faviconUrl" as const, label: "رابط أيقونة المتصفح", placeholder: "https://..." },
            { name: "theme.ogImageUrl" as const, label: "صورة المشاركة الاجتماعية", placeholder: "https://..." },
          ].map(({ name, label, placeholder }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={placeholder} className="h-10 rounded-xl border-white/10 bg-white/5 text-sm" />
                  </FormControl>
                  {field.value && (
                    <div className="mt-2 h-12 w-24 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={field.value as string} alt={label} className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </AdminCard>
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <FormField control={form.control} name="theme.customCSS" render={({ field }) => (
        <FormItem>
          <AdminCard variant="glass" className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-violet-500" />
              <FormLabel className="font-black text-sm">CSS مخصص</FormLabel>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              أضف أكواد CSS مخصصة لتعديل مظهر المنصة. تُطبق على جميع الصفحات.
            </p>
            <FormControl>
              <Textarea
                {...field}
                rows={8}
                placeholder=":root { --custom-color: #ff6b6b; }"
                className="rounded-xl border-white/10 bg-white/5 font-mono text-xs resize-none"
                dir="ltr"
              />
            </FormControl>
          </AdminCard>
        </FormItem>
      )} />
    </div>
  );
}
