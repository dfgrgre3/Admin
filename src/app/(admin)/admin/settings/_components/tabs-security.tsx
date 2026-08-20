"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Key, AlertTriangle, Clock } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function SecurityTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Shield} title="إعدادات الأمان" description="سياسات كلمات المرور والجلسات والحماية" color="rose" />

      {/* Password Policy */}
      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Lock className="w-4 h-4" /> سياسة كلمة المرور
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="security.passwordMinLength"
            render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">الحد الأدنى للطول</FormLabel>
                  <FormControl>
                    <Input type="number" min={6} max={32} {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )}
          />
          {([
            { name: "security.passwordRequireUppercase" as const, label: "حرف كبير إلزامي" },
            { name: "security.passwordRequireLowercase" as const, label: "حرف صغير إلزامي" },
            { name: "security.passwordRequireNumbers" as const, label: "رقم إلزامي" },
            { name: "security.passwordRequireSymbols" as const, label: "رمز خاص إلزامي" },
          ]).map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <AdminCard variant="glass" className="p-5">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-black text-xs">{label}</FormLabel>
                  <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                </div>
              </AdminCard>
            )} />
          ))}
        </div>
      </div>

      {/* Session & Login */}
      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Clock className="w-4 h-4" /> الجلسات وتسجيل الدخول
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "security.sessionTimeoutMinutes" as const, label: "انتهاء الجلسة (دقيقة)", min: 5 },
            { name: "security.maxLoginAttempts" as const, label: "محاولات الدخول القصوى", min: 1 },
            { name: "security.lockoutDurationMinutes" as const, label: "مدة الحظر المؤقت (دقيقة)", min: 1 },
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

      {/* Advanced */}
      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Key className="w-4 h-4" /> حماية متقدمة
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="security.enforce2FA" render={({ field }) => (
            <AdminCard variant="glass" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="font-black text-xs">إجبار التحقق الثنائي (2FA)</FormLabel>
                  <p className="text-[10px] text-muted-foreground">لجميع حسابات الإدارة</p>
                </div>
                <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
              </div>
            </AdminCard>
          )} />
          <FormField control={form.control} name="security.hstsEnabled" render={({ field }) => (
            <AdminCard variant="glass" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="font-black text-xs">تفعيل HSTS</FormLabel>
                  <p className="text-[10px] text-muted-foreground">HTTP Strict Transport Security</p>
                </div>
                <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
              </div>
            </AdminCard>
          )} />
          {[
            { name: "security.rateLimitPerMinute" as const, label: "حد الطلبات/دقيقة" },
            { name: "security.rateLimitPerHour" as const, label: "حد الطلبات/ساعة" },
          ].map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
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
