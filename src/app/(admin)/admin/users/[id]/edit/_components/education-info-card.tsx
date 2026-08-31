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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, MapPin, Target } from "lucide-react";
import { gradeLevelOptions, educationTypeOptions, genderOptions } from "../../_components/types";
import type { UserEditFormValues } from "../_schemas/user-edit-schema";

interface EducationInfoCardProps {
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
}

export function EducationInfoCard({ form }: EducationInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          المعلومات الدراسية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField name="gradeLevel" label="الصف الدراسي" placeholder="اختر الصف" options={gradeLevelOptions} form={form} />
          <SelectField name="educationType" label="نوع التعليم" placeholder="اختر النوع" options={educationTypeOptions} form={form} />
          <TextField name="section" label="الشعبة" form={form} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <TextField name="school" label="المدرسة" form={form} />
          <TextField name="country" label="الدولة" icon={MapPin} form={form} />
          <SelectField name="gender" label="الجنس" placeholder="اختر الجنس" options={genderOptions} form={form} allowEmpty />
        </div>
        <FormField
          control={form.control}
          name="studyGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>هدف الدراسة</FormLabel>
              <FormControl>
                <div className="relative">
                  <Target className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea {...field} className="pr-9" rows={2} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

interface SelectFieldProps {
  name: keyof UserEditFormValues;
  label: string;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
  allowEmpty?: boolean;
}

function SelectField({ name, label, placeholder, options, form, allowEmpty }: SelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={allowEmpty ? ((field.value as string | undefined) ?? "") : (field.value as string | undefined)}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface TextFieldProps {
  name: keyof UserEditFormValues;
  label: string;
  icon?: React.ElementType;
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
}

function TextField({ name, label, icon: Icon, form }: TextFieldProps) {
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
                <Input {...field} value={field.value as string | undefined} className="pr-9" />
              </div>
            ) : (
              <Input {...field} value={field.value as string | undefined} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}