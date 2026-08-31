"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import type { UserEditFormValues } from "../_schemas/user-edit-schema";

interface SecurityCardProps {
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
}

interface SwitchItemProps {
  name: keyof UserEditFormValues;
  label: string;
  description: string;
  form: SecurityCardProps["form"];
}

function SwitchItem({ name, label, description, form }: SwitchItemProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <FormLabel>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function SecurityCard({ form }: SecurityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          إعدادات الأمان
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <SwitchItem name="emailVerified" label="البريد موثق" description="تم التحقق من البريد" form={form} />
          <SwitchItem name="phoneVerified" label="الهاتف موثق" description="تم التحقق من الهاتف" form={form} />
          <SwitchItem name="twoFactorEnabled" label="التحقق الثنائي" description="مفعّل" form={form} />
        </div>
      </CardContent>
    </Card>
  );
}