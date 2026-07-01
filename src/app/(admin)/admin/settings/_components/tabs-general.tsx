"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Globe, Mail, Phone } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn, Path } from "react-hook-form";

export function GeneralTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <AdminCard variant="glass" className="p-8 space-y-8">
      <SectionHeader icon={Globe} title="الهوية الرقمية للمنصة" description="تحديد الاسم، الوصف، والكلمات الدليلية لمحركات البحث." color="blue" />
      <div className="grid gap-8">
        <FormField control={form.control} name="siteName" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">اسم المنصة الرسمي</FormLabel>
            <FormControl><Input {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 text-lg font-black px-6" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="siteDescription" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">وصف المنصة (SEO Description)</FormLabel>
            <FormControl><Textarea {...field} className="rounded-2xl border-white/10 bg-white/5 min-h-[120px] p-6 text-sm font-bold" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="siteKeywords" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">الكلمات الدليلية (SEO Keywords)</FormLabel>
            <FormDescription className="text-[10px] font-bold opacity-40">افصل بين الكلمات بفاصلة</FormDescription>
            <FormControl><Textarea {...field} className="rounded-2xl border-white/10 bg-white/5 min-h-[80px] p-6 text-sm font-bold" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid md:grid-cols-2 gap-8">
          <FormField control={form.control} name="contactEmail" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">بريد التواصل الرسمي</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 pr-12 dir-ltr text-center font-bold" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="supportPhone" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">هاتف الدعم الفني</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 pr-12 dir-ltr text-center font-bold" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      </div>
    </AdminCard>
  );
}