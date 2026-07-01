"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Share2 } from "lucide-react";
import { SectionHeader } from "./shared";
import type { SettingsFormValues } from "./types";
import type { UseFormReturn, Path } from "react-hook-form";

const SOCIAL_LINKS = [
  { key: "facebook", label: "فيسبوك", placeholder: "https://facebook.com/..." },
  { key: "twitter", label: "تويتر (X)", placeholder: "https://twitter.com/..." },
  { key: "instagram", label: "إنستغرام", placeholder: "https://instagram.com/..." },
  { key: "youtube", label: "يوتيوب", placeholder: "https://youtube.com/..." },
] as const;

export function SocialTab({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <AdminCard variant="glass" className="p-8 space-y-8">
      <SectionHeader icon={Share2} title="روابط التواصل الاجتماعي" description="روابط حسابات المنصة على منصات التواصل." color="pink" />
      <div className="grid gap-8">
        {SOCIAL_LINKS.map((social) => (
          <FormField
            key={social.key}
            control={form.control}
            name={`socialLinks.${social.key}` as Path<SettingsFormValues>}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">{social.label}</FormLabel>
                <FormControl>
                  <Input {...field} value={typeof field.value === 'string' ? field.value : ''} dir="ltr" placeholder={social.placeholder} className="h-14 rounded-2xl border-white/10 bg-white/5 px-6 font-bold text-left" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </AdminCard>
  );
}