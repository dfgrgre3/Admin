"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreditCard, DollarSign, Receipt } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn } from "react-hook-form";

export function PaymentsTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={CreditCard} title="إعدادات المدفوعات" description="تكوين العملة وبوابات الدفع والفواتير" color="green" />

      {/* Currency */}
      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <DollarSign className="w-4 h-4" /> العملة والضرائب
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "payments.currency" as const, label: "رمز العملة", placeholder: "EGP" },
            { name: "payments.currencySymbol" as const, label: "رمز العملة (عرض)", placeholder: "ج.م" },
            { name: "payments.invoicePrefix" as const, label: "بادئة الفاتورة", placeholder: "INV-" },
          ].map(({ name, label, placeholder }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem>
                <AdminCard variant="glass" className="p-5">
                  <FormLabel className="font-black text-xs mb-2 block">{label}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={placeholder} className="h-10 rounded-xl border-white/10 bg-white/5 font-bold font-mono" />
                  </FormControl>
                </AdminCard>
              </FormItem>
            )} />
          ))}
          {[
            { name: "payments.taxRate" as const, label: "نسبة الضريبة (%)", min: 0, max: 100 },
            { name: "payments.minDepositAmount" as const, label: "الحد الأدنى للدفع", min: 0 },
            { name: "payments.maxDepositAmount" as const, label: "الحد الأقصى للدفع", min: 0 },
            { name: "payments.paymentTimeoutMinutes" as const, label: "انتهاء الدفع (دقيقة)", min: 1 },
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
        </div>
      </div>

      {/* Payment Gates */}
      <div>
        <h4 className="font-black text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <Receipt className="w-4 h-4" /> بوابات الدفع
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "payments.enablePaymob" as const, label: "بوابة Paymob", desc: "خدمة الدفع الإلكتروني المصرية" },
            { name: "payments.enableWallet" as const, label: "المحفظة الإلكترونية", desc: "دفع من رصيد المحفظة الداخلية" },
            { name: "payments.enableCash" as const, label: "الدفع النقدي", desc: "السماح بالتسجيل وانتظار التأكيد اليدوي" },
            { name: "payments.autoConfirmPayments" as const, label: "تأكيد تلقائي", desc: "قبول الدفعات تلقائياً دون مراجعة يدوية" },
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
    </div>
  );
}
