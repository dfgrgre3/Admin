"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Bell } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function EmailTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <AdminCard variant="glass" className="p-8 space-y-8">
      <SectionHeader icon={Mail} title="إعدادات البريد الإلكتروني (SMTP)" description="تكوين خادم البريد الصادر لإرسال الإشعارات والرسائل." color="sky" />
      <div className="grid gap-8">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-sky-500" />
            <span className="font-bold text-sm">تفعيل البريد الإلكتروني</span>
          </div>
          <FormField control={form.control} name="email.enabled" render={({ field }) => (
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          )} />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <FormField control={form.control} name="email.smtpHost" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">خادم SMTP</FormLabel>
              <FormControl><Input {...field} dir="ltr" placeholder="smtp.gmail.com" className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-left" /></FormControl>
              <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email.smtpPort" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">منفذ SMTP</FormLabel>
              <FormControl><Input type="number" {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-center" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
              <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <FormField control={form.control} name="email.smtpUsername" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">اسم المستخدم SMTP</FormLabel>
              <FormControl><Input {...field} dir="ltr" className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-left" /></FormControl>
              <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email.smtpPassword" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">كلمة مرور SMTP</FormLabel>
              <FormControl><Input {...field} type="password" dir="ltr" className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-left" /></FormControl>
              <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <FormField control={form.control} name="email.fromAddress" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">بريد المرسل</FormLabel>
              <FormControl><Input {...field} dir="ltr" placeholder="noreply@tolo.app" className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-left" /></FormControl>
              <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email.fromName" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">اسم المرسل</FormLabel>
              <FormControl><Input {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold" /></FormControl>
              <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FormField control={form.control} name="email.encryption" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">نوع التشفير</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="none">بدون تشفير</SelectItem>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email.maxBatchSize" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">الحد الأقصى للدفعة</FormLabel>
              <FormControl><Input type="number" {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-center" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
              <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email.throttleMs" render={({ field }) => (
            <FormItem><FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">مهلة الإرسال (مللي ثانية)</FormLabel>
              <FormControl><Input type="number" {...field} className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-center" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
              <FormMessage /></FormItem>
          )} />
        </div>
      </div>
    </AdminCard>
  );
}