"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Bell, Smartphone, Clock, MessageSquare } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function NotificationsSettingsTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={Bell} title="إعدادات الإشعارات" description="تكوين قنوات الإشعار وأوقات الهدوء" color="yellow" />

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Smartphone className="w-4 h-4" /> قنوات الإشعار
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "notifications.enablePushNotifications" as const, label: "إشعارات Push", desc: "إشعارات الدفع للمتصفح والتطبيق" },
            { name: "notifications.enableEmailNotifications" as const, label: "إشعارات البريد", desc: "إرسال إشعارات عبر البريد الإلكتروني" },
            { name: "notifications.enableSmsNotifications" as const, label: "إشعارات SMS", desc: "إرسال إشعارات عبر الرسائل القصيرة" },
            { name: "notifications.dailyDigestEnabled" as const, label: "ملخص يومي", desc: "إرسال ملخص يومي للنشاطات" },
          ].map(({ name, label, desc }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <AdminCard variant="glass" className="p-5 hover:border-yellow-500/30 transition-all">
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
          <MessageSquare className="w-4 h-4" /> إعداد Firebase
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "notifications.firebaseServerKey" as const, label: "Firebase Server Key", placeholder: "AAAA..." },
            { name: "notifications.firebaseSenderId" as const, label: "Firebase Sender ID", placeholder: "1234567890" },
            { name: "notifications.onesignalAppId" as const, label: "OneSignal App ID", placeholder: "xxxxxxxx-xxxx-..." },
            { name: "notifications.onesignalApiKey" as const, label: "OneSignal API Key", placeholder: "os_v2_..." },
          ].map(({ name, label, placeholder }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={placeholder} type="password" className="h-10 rounded-xl border-white/10 bg-white/5 font-mono text-sm" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Clock className="w-4 h-4" /> التوقيت والحدود
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "notifications.digestTime" as const, label: "وقت الملخص اليومي", type: "time" as const },
            { name: "notifications.quietHoursStart" as const, label: "بداية وقت الهدوء", type: "time" as const },
            { name: "notifications.quietHoursEnd" as const, label: "نهاية وقت الهدوء", type: "time" as const },
          ].map(({ name, label, type }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input type={type} {...field} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
          <FormField control={form.control} name="notifications.maxNotificationsPerDay" render={({ field }) => (
            <FormItem>
              <AdminCard variant="glass" className="p-5">
                <FormLabel className="font-black text-xs mb-2 block">أقصى إشعارات يومياً</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold" />
                </FormControl>
              </AdminCard>
            </FormItem>
          )} />
        </div>
      </div>
    </div>
  );
}
