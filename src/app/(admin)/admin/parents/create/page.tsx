"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, UserPlus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/admin-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { UserRole } from "@/types/enums";
import { logger }from '@/lib/logger';

const createParentSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").optional().or(z.literal("")),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone: z.string().optional(),
  country: z.string().optional(),
});

type CreateParentValues = z.infer<typeof createParentSchema>;

export default function CreateParentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CreateParentValues>({
    resolver: zodResolver(createParentSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      country: "",
    },
  });

  const handleSubmit = async (values: CreateParentValues) => {
    setIsSubmitting(true);
    try {
      const data = await adminApi.post<{ id: string } | { data?: { id: string } }>("users", {
        name: values.name,
        email: values.email,
        password: values.password,
        username: values.username || undefined,
        role: UserRole.PARENT,
        phone: values.phone || undefined,
        country: values.country || undefined,
      });

      const id = (data as { id: string }).id || (data as { data?: { id: string } }).data?.id;
      if (!id) {
        toast.error("تعذر إنشاء ولي الأمر");
        return;
      }

      toast.success("تم إنشاء ولي الأمر بنجاح");
      router.push(`/admin/parents/${id}`);
    } catch (error) {
      logger.error("Error creating parent:", error);
      toast.error("حدث خطأ أثناء إنشاء ولي الأمر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="إضافة ولي أمر جديد"
        description="إنشاء حساب ولي أمر جديد داخل لوحة التحكم مع إمكانية ربطه بالطلاب لاحقاً."
      >
        <AdminButton variant="outline" onClick={() => router.push("/admin/parents")}>
          رجوع لأولياء الأمور
        </AdminButton>
      </PageHeader>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            بيانات ولي الأمر
          </CardTitle>
          <CardDescription>
            بعد الإنشاء يمكنك ربط الطلاب بحساب ولي الأمر من صفحة التفاصيل.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدولة (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <Shield className="h-4 w-4" />
                  ملاحظة
                </div>
                سيتم إنشاء الحساب بدور "ولي أمر" تلقائياً. يمكنك ربط الطلاب بهذا الحساب بعد الإنشاء من صفحة التفاصيل.
              </div>

              <div className="flex justify-end gap-3">
                <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/parents")}>
                  إلغاء
                </AdminButton>
                <AdminButton type="submit" icon={UserPlus} loading={isSubmitting}>
                  إنشاء ولي الأمر
                </AdminButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
