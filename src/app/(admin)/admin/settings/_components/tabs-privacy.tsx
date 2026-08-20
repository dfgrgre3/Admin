"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, Link, UserX, Shield } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function PrivacyTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Eye} title="الخصوصية وحماية البيانات" description="سياسات GDPR وحقوق المستخدمين والبيانات" color="indigo" />

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Link className="w-4 h-4" /> روابط السياسات
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "privacy.termsOfServiceUrl" as const, label: "رابط شروط الاستخدام", placeholder: "https://..." },
            { name: "privacy.privacyPolicyUrl" as const, label: "رابط سياسة الخصوصية", placeholder: "https://..." },
            { name: "privacy.cookiePolicyUrl" as const, label: "رابط سياسة الكوكيز", placeholder: "https://..." },
            { name: "privacy.analyticsId" as const, label: "معرّف التحليلات", placeholder: "GA-XXXXXXX" },
          ].map(({ name, label, placeholder }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={placeholder} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold text-sm" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Shield className="w-4 h-4" /> الامتثال والموافقات
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "privacy.enableCookieConsent" as const, label: "موافقة الكوكيز", desc: "عرض نافذة الموافقة على الكوكيز" },
            { name: "privacy.enableGDPR" as const, label: "الامتثال لـ GDPR", desc: "تطبيق متطلبات حماية بيانات أوروبا" },
            { name: "privacy.enableAnalytics" as const, label: "التحليلات", desc: "تفعيل تتبع الزوار وتحليل السلوك" },
            { name: "privacy.enableUserDataExport" as const, label: "تصدير بيانات المستخدم", desc: "السماح للمستخدم بتنزيل بياناته" },
            { name: "privacy.enableAccountDeletion" as const, label: "حذف الحساب", desc: "السماح للمستخدم بحذف حسابه نهائياً" },
            { name: "privacy.parentalConsentRequired" as const, label: "موافقة ولي الأمر", desc: "مطلوبة للمستخدمين القاصرين" },
            { name: "privacy.showWatermarkOnContent" as const, label: "علامة مائية", desc: "إضافة علامة مائية على المحتوى" },
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
          <UserX className="w-4 h-4" /> الاحتفاظ بالبيانات
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "privacy.dataRetentionDays" as const, label: "الاحتفاظ بالبيانات (يوم)", min: 30 },
            { name: "privacy.deletionGracePeriodDays" as const, label: "مهلة الحذف (يوم)", min: 1 },
            { name: "privacy.minAgeRequirement" as const, label: "الحد الأدنى للعمر", min: 0 },
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
