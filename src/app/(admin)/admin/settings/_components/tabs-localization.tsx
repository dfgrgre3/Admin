"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Languages, Globe, Clock } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

const LANGUAGES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
  { value: "fr", label: "الفرنسية" },
];

const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD-MM-YYYY"];
const TIME_FORMATS = ["HH:mm", "hh:mm A"];
const NUMBER_FORMATS = ["ar-EG", "ar-SA", "en-US", "en-GB"];

export function LocalizationTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Languages} title="اللغة والتوطين" description="ضبط اللغة الافتراضية والتنسيقات الإقليمية" color="teal" />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField control={form.control} name="localization.defaultLanguage" render={({ field }) => (
          <FormItem>
            <AdminCard variant="glass" className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <FormLabel className="font-black text-sm">اللغة الافتراضية</FormLabel>
                  <p className="text-[10px] text-muted-foreground">لغة واجهة المستخدم الرئيسية</p>
                  <FormControl>
                    <select {...field} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold">
                      {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </FormControl>
                </div>
              </div>
            </AdminCard>
          </FormItem>
        )} />

        <FormField control={form.control} name="localization.fallbackLanguage" render={({ field }) => (
          <FormItem>
            <AdminCard variant="glass" className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                  <Languages className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <FormLabel className="font-black text-sm">اللغة الاحتياطية</FormLabel>
                  <p className="text-[10px] text-muted-foreground">تُستخدم عند غياب ترجمة</p>
                  <FormControl>
                    <select {...field} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold">
                      {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </FormControl>
                </div>
              </div>
            </AdminCard>
          </FormItem>
        )} />

        <FormField control={form.control} name="localization.enableRTL" render={({ field }) => (
          <AdminCard variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <FormLabel className="font-black text-sm">الكتابة من اليمين (RTL)</FormLabel>
                <p className="text-[10px] text-muted-foreground">ضروري للغة العربية</p>
              </div>
              <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
            </div>
          </AdminCard>
        )} />

        <FormField control={form.control} name="localization.timezone" render={({ field }) => (
          <FormItem>
            <AdminCard variant="glass" className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <FormLabel className="font-black text-sm">المنطقة الزمنية</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Africa/Cairo" className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                  </FormControl>
                </div>
              </div>
            </AdminCard>
          </FormItem>
        )} />

        {[
          { name: "localization.dateFormat" as const, label: "تنسيق التاريخ", options: DATE_FORMATS },
          { name: "localization.timeFormat" as const, label: "تنسيق الوقت", options: TIME_FORMATS },
          { name: "localization.numberFormat" as const, label: "تنسيق الأرقام", options: NUMBER_FORMATS },
        ].map(({ name, label, options }) => (
          <FormField key={name} control={form.control} name={name} render={({ field }) => (
            <FormItem>
              <AdminCard variant="glass" className="p-6">
                <FormLabel className="font-black text-sm mb-2 block">{label}</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold font-mono">
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FormControl>
              </AdminCard>
            </FormItem>
          )} />
        ))}
      </div>
    </div>
  );
}
