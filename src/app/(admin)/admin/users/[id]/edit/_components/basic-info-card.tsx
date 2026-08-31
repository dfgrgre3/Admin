"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, User } from "lucide-react";
import type { UserEditFormValues } from "../_schemas/user-edit-schema";

interface BasicInfoCardProps {
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
}

export function BasicInfoCard({ form }: BasicInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          المعلومات الأساسية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="name" label="الاسم الكامل" form={form} />
          <Field name="username" label="اسم المستخدم" form={form} ltr />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="email" label="البريد الإلكتروني" type="email" icon={Mail} form={form} ltr />
          <Field name="phone" label="رقم الهاتف" icon={Phone} form={form} ltr />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نبذة عني</FormLabel>
              <FormControl><Textarea {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  name: keyof UserEditFormValues;
  label: string;
  type?: string;
  icon?: React.ElementType;
  ltr?: boolean;
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
}

function Field({ name, label, type = "text", icon: Icon, ltr, form }: FieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {Icon ? (
              <div className="relative">
                <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...field} type={type} className="pr-9" dir={ltr ? "ltr" : undefined} />
              </div>
            ) : (
              <Input {...field} type={type} dir={ltr ? "ltr" : undefined} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}