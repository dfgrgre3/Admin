"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateInstructor } from "@/hooks/use-instructors";

const createInstructorSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  username: z.string().min(2, "اسم المستخدم يجب أن يكون حرفين على الأقل"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"]),
  specialties: z.string().optional(),
  languages: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  experience: z.number().min(0).optional(),
});

type CreateInstructorValues = z.infer<typeof createInstructorSchema>;

export default function CreateInstructorPage() {
  const router = useRouter();
  const createMutation = useCreateInstructor();

  const form = useForm<CreateInstructorValues>({
    resolver: zodResolver(createInstructorSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      bio: "",
      phone: "",
      country: "SA",
      status: "PENDING",
      specialties: "",
      languages: "",
      commissionRate: 50,
      experience: 0,
    },
  });

  const onSubmit = async (values: CreateInstructorValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        email: values.email,
        username: values.username,
        bio: values.bio,
        phone: values.phone,
        country: values.country,
        status: values.status,
        specialties: (values.specialties || "").split(",").map(s => s.trim()).filter(Boolean),
        languages: (values.languages || "").split(",").map(s => s.trim()).filter(Boolean),
        commissionRate: values.commissionRate,
        experience: values.experience,
      });
      toast.success("تم إنشاء المدرّس بنجاح");
      router.push("/admin/instructors");
    } catch (error) {
      toast.error("فشل في إنشاء المدرّس");
    }
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title="إضافة مدرّس جديد"
        description="إنشاء حساب مدرّس جديد في المنصة"
      >
        <AdminButton variant="outline" icon={ArrowLeft} onClick={() => router.push("/admin/instructors")} className="rounded-xl border-white/10">
          العودة للقائمة
        </AdminButton>
      </PageHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">الاسم الكامل *</label>
            <Input {...form.register("name")} placeholder="الاسم الكامل" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">البريد الإلكتروني *</label>
            <Input type="email" {...form.register("email")} placeholder="email@example.com" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">اسم المستخدم *</label>
            <Input {...form.register("username")} placeholder="username" />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">الهاتف</label>
            <Input type="tel" {...form.register("phone")} placeholder="+966 50 123 4567" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">الدولة</label>
            <Select value={form.watch("country") || ""} onValueChange={(value) => form.setValue("country", value as string)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدولة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SA">السعودية</SelectItem>
                <SelectItem value="EG">مصر</SelectItem>
                <SelectItem value="AE">الإمارات</SelectItem>
                <SelectItem value="KW">الكويت</SelectItem>
                <SelectItem value="QA">قطر</SelectItem>
                <SelectItem value="BH">البحرين</SelectItem>
                <SelectItem value="OM">عُمان</SelectItem>
                <SelectItem value="JO">الأردن</SelectItem>
                <SelectItem value="LB">لبنان</SelectItem>
                <SelectItem value="MA">المغرب</SelectItem>
                <SelectItem value="DZ">الجزائر</SelectItem>
                <SelectItem value="TN">تونس</SelectItem>
                <SelectItem value="OTHER">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">الحالة *</label>
            <Select value={form.watch("status")} onValueChange={(value: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED") => form.setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                <SelectItem value="UNDER_REVIEW">قيد المراجعة</SelectItem>
                <SelectItem value="APPROVED">موافق عليه</SelectItem>
                <SelectItem value="REJECTED">مرفوض</SelectItem>
                <SelectItem value="SUSPENDED">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">النبذة</label>
          <Textarea {...form.register("bio")} placeholder="نبذة عن المدرّس..." rows={3} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">التخصصات (مفصولة بفواصل)</label>
          <Input {...form.register("specialties")} placeholder="رياضيات, فيزياء, كيمياء" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">اللغات (مفصولة بفواصل)</label>
          <Input {...form.register("languages")} placeholder="العربية, الإنجليزية, الفرنسية" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">نسبة العمولة (%)</label>
            <Input type="number" {...form.register("commissionRate", { valueAsNumber: true })} min={0} max={100} step={0.1} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">سنوات الخبرة</label>
            <Input type="number" {...form.register("experience", { valueAsNumber: true })} min={0} max={50} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/instructors")}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button type="submit" className="rounded-xl" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                إنشاء المدرّس
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}