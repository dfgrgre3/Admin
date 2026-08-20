"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Server, AlertTriangle } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function MaintenanceTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  const maintenanceEnabled = form.watch("maintenance.enabled");

  return (
    <div className="space-y-8">
      <SectionHeader icon={Server} title="وضع الصيانة" description="إدارة حالة المنصة وعرض رسائل للمستخدمين" color="red" />

      {maintenanceEnabled && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">تحذير: تفعيل وضع الصيانة سيمنع جميع المستخدمين من الوصول للمنصة</p>
        </div>
      )}

      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="maintenance.enabled"
          render={({ field }) => (
            <AdminCard variant="glass" className={`p-6 transition-all ${maintenanceEnabled ? "border-red-500/30" : "hover:border-red-500/20"}`}>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className={`p-3 rounded-2xl border ${maintenanceEnabled ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">تفعيل وضع الصيانة</h4>
                    <p className="text-[10px] font-bold text-muted-foreground">
                      عند التفعيل، يُعرض للمستخدمين رسالة الصيانة بدلاً من المحتوى
                    </p>
                  </div>
                </div>
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                  className={maintenanceEnabled ? "data-[state=checked]:bg-red-500" : ""}
                />
              </div>
            </AdminCard>
          )}
        />

        <FormField
          control={form.control}
          name="maintenance.message"
          render={({ field }) => (
            <FormItem>
              <AdminCard variant="glass" className="p-6">
                <FormLabel className="font-black text-sm mb-3 block">رسالة الصيانة</FormLabel>
                <p className="text-[10px] text-muted-foreground mb-3">
                  هذه الرسالة تظهر للمستخدمين عند دخولهم المنصة أثناء الصيانة
                </p>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="مثال: المنصة تحت الصيانة حالياً، ستعود قريباً..."
                    className="rounded-xl border-white/10 bg-white/5 font-bold resize-none"
                  />
                </FormControl>
              </AdminCard>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
