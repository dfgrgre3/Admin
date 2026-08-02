"use client";

import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { adminUsersApi } from "@/lib/api/admin-users-api";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, UserPlus, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logger } from '@/lib/logger';
import { UserRole, UserStatus } from "@/types/enums";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Validation schema ──
const createUserSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
  lastName: z.string().min(2, "اسم العائلة يجب أن يكون حرفين على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").optional().or(z.literal("")),
  email: z.string().email("صيغة البريد الإلكتروني غير صالحة"),
  phone: z.string().min(8, "رقم الهاتف قصير جداً").optional().or(z.literal("")),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").regex(/[A-Za-z]/, "يجب أن تحتوي كلمة المرور على حروف").regex(/\d/, "يجب أن تحتوي كلمة المرور على أرقام"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "MODERATOR", "SUPPORT", "SUPER_ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  language: z.string().optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "النبذة يجب ألا تتجاوز 500 حرف").optional().or(z.literal("")),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

const roleOptions = [
  { value: UserRole.STUDENT, label: "طالب" },
  { value: UserRole.TEACHER, label: "معلم" },
  { value: UserRole.PARENT, label: "ولي أمر" },
  { value: UserRole.MODERATOR, label: "مشرف" },
  { value: UserRole.SUPPORT, label: "دعم فني" },
  { value: UserRole.ADMIN, label: "مدير" },
] as const;

const statusOptions = [
  { value: UserStatus.ACTIVE, label: "نشط" },
  { value: UserStatus.INACTIVE, label: "غير نشط" },
  { value: UserStatus.SUSPENDED, label: "موقوف" },
  { value: UserStatus.PENDING_VERIFICATION, label: "قيد التحقق" },
] as const;

const genderOptions = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "آخر" },
] as const;

const languageOptions = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
  { value: "fr", label: "الفرنسية" },
] as const;

const AVATAR_MAX_SIZE_MB = 5;
const AVATAR_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      country: "",
      city: "",
      dateOfBirth: "",
      gender: "",
      language: "ar",
      timezone: "Africa/Cairo",
      bio: "",
    },
  });

  const handleAvatarUpload = (file: File) => {
    // Validate size
    if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة يجب ألا يتجاوز ${AVATAR_MAX_SIZE_MB}MB`);
      return;
    }
    // Validate type
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("نوع الصورة غير مدعوم. الأنواع المسموحة: JPEG, PNG, WebP, GIF");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values: CreateUserValues) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username || undefined,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        role: values.role,
        status: values.status,
        country: values.country || undefined,
        city: values.city || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        language: values.language || undefined,
        timezone: values.timezone || undefined,
        bio: values.bio || undefined,
      };

      const response = await adminFetch(apiRoutes.admin.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json();
      if (!response.ok) {
        toast.error(responsePayload.error || "تعذر إنشاء المستخدم");
        return;
      }

      const userId = responsePayload.data?.id ?? responsePayload.id;

      // Upload avatar after creating the user if one was selected
      if (avatarFile && userId) {
        try {
          await adminUsersApi.uploadAvatar(userId, avatarFile);
          toast.success("تم رفع الصورة الشخصية بنجاح");
        } catch (avatarErr) {
          toast.warning("تم إنشاء المستخدم لكن فشل رفع الصورة");
          logger.error("Avatar upload failed", avatarErr);
        }
      }

      toast.success("تم إنشاء المستخدم بنجاح");
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      logger.error("Error creating user:", error);
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="إضافة مستخدم جديد"
        description="إنشاء حساب جديد داخل لوحة التحكم مع تحديد الدور والحالة والبيانات التفصيلية."
      >
        <AdminButton variant="outline" onClick={() => router.push("/admin/users")}>
          رجوع إلى المستخدمين
        </AdminButton>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Avatar Card */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader className="text-center">
                <Avatar className="h-28 w-28 mx-auto mb-4 border-2 border-primary/20">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} />
                  ) : (
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {form.watch("firstName")?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle>الصورة الشخصية</CardTitle>
                <CardDescription>JPG, PNG, WebP أو GIF — بحد أقصى {AVATAR_MAX_SIZE_MB}MB</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-bold">اضغط لاختيار صورة</span>
                  <input
                    type="file"
                    accept={AVATAR_ACCEPTED_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {avatarFile && (
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                    <span className="text-xs font-bold truncate">{avatarFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                      className="text-xs text-destructive font-black hover:underline"
                    >
                      إزالة
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5" />
                    البيانات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الأول</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم العائلة</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input {...field} dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} dir="ltr" placeholder="+20xxxxxxxxxx" />
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
                          <FormDescription className="text-[11px]">
                            8 أحرف على الأقل وتحتوي على حروف وأرقام
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>النبذة</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Role & Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    الدور والحالة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الدور</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الدور" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحالة</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location & Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">الموقع والبيانات الشخصية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الدولة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: مصر" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدينة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: القاهرة" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الميلاد</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الجنس</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الجنس" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genderOptions.map((gender) => (
                                <SelectItem key={gender.value} value={gender.value}>
                                  {gender.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اللغة</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر اللغة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languageOptions.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المنطقة الزمنية</FormLabel>
                          <FormControl>
                            <Input {...field} dir="ltr" placeholder="Africa/Cairo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <Shield className="h-4 w-4" />
                  ملاحظة
                </div>
                سيتم إرسال طلب الإنشاء إلى الـ Backend وسيتحقق من عدم تكرار البريد واسم المستخدم ورقم الهاتف.
              </div>

              <div className="flex justify-end gap-3">
                <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                  إلغاء
                </AdminButton>
                <AdminButton type="submit" icon={UserPlus} loading={isSubmitting}>
                  {isSubmitting ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                </AdminButton>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}