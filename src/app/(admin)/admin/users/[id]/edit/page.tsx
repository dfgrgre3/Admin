"use client";

import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  GraduationCap,
  MapPin,
  Target,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { logger } from '@/lib/logger';
import {
  gradeLevelOptions,
  educationTypeOptions,
  genderOptions,
  roleOptions,
} from "../_components/types";

const userEditSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").optional().or(z.literal("")),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "MODERATOR", "USER"]),
  bio: z.string().optional().or(z.literal("")),
  gradeLevel: z.string().optional().or(z.literal("")),
  educationType: z.string().optional().or(z.literal("")),
  section: z.string().optional().or(z.literal("")),
  school: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  studyGoal: z.string().optional().or(z.literal("")),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

interface UserData {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  role: string;
  emailVerified: boolean | null;
  phone: string | null;
  phoneVerified: boolean | null;
  twoFactorEnabled: boolean;
  bio: string | null;
  gradeLevel: string | null;
  educationType: string | null;
  section: string | null;
  school: string | null;
  country: string | null;
  gender: string | null;
  studyGoal: string | null;
  createdAt: string | null;
  lastLogin: string | null;
}

// roleLabels are defined and exported from ../_components/types — no duplication needed here.

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      role: "STUDENT",
      bio: "",
      gradeLevel: "",
      educationType: "",
      section: "",
      school: "",
      country: "",
      gender: "",
      studyGoal: "",
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
    },
  });

  // Capture a stable ref to form.reset so it is safe to include in the
  // dependency array without triggering an infinite re-render loop.
  const formReset = form.reset;

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await adminUsersApi.get(userId);
        setUser(data);
        formReset({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role as UserEditFormValues["role"],
          bio: data.bio || "",
          gradeLevel: data.gradeLevel || "",
          educationType: data.educationType || "",
          section: data.section || "",
          school: data.school || "",
          country: data.country || "",
          gender: (data.gender || "") as UserEditFormValues["gender"],
          studyGoal: data.studyGoal || "",
          emailVerified: data.emailVerified || false,
          phoneVerified: data.phoneVerified || false,
          twoFactorEnabled: data.twoFactorEnabled || false,
        });
      } catch (error) {
        logger.error("Error fetching user:", error);
        toast.error("المستخدم غير موجود");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, router, formReset]);

  const handleSubmit = async (values: UserEditFormValues) => {
    setSaving(true);
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("تم تحديث بيانات المستخدم بنجاح");
        router.push(`/admin/users/${userId}`);
      } else {
        // Safely parse the error body — some error responses have no JSON body.
        let errorMessage = "حدث خطأ أثناء تحديث بيانات المستخدم";
        try {
          const errorBody = await response.json();
          if (errorBody?.error) errorMessage = errorBody.error;
        } catch {
          // Response body is not JSON — keep the default message.
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      logger.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse mx-auto" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded mx-auto" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto" />
          </div>
          <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`تعديل: ${user.name || user.email || "مستخدم"}`}
        description="تعديل بيانات المستخدم"
      >
        <Button variant="outline" onClick={() => router.push(`/admin/users/${userId}`)}>
          <ArrowRight className="ml-2 h-4 w-4" />
          إلغاء والعودة
        </Button>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Disable all inputs while saving to prevent double-submit */}
          <fieldset disabled={saving} style={{ all: "unset", display: "contents" }}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* User Avatar Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.name || "بدون اسم"}</CardTitle>
                <CardDescription>@{user.username || "بدون اسم مستخدم"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                  <p>عضو منذ {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "غير معروف"}</p>
                </div>
                <Separator />
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
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          <FormLabel>اسم المستخدم</FormLabel>
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
                            <div className="relative">
                              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input {...field} type="email" className="pr-9" dir="ltr" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input {...field} className="pr-9" dir="ltr" />
                            </div>
                          </FormControl>
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
                        <FormLabel>نبذة عني</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Education Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    المعلومات الدراسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الصف الدراسي</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الصف" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gradeLevelOptions.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
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
                      name="educationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع التعليم</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {educationTypeOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="section"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الشعبة</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="school"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدرسة</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>الدولة</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input {...field} className="pr-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Gender field — was present in schema & zod but missing from UI */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الجنس</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الجنس" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genderOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    إعدادات الأمان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="emailVerified"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <FormLabel>البريد موثق</FormLabel>
                            <FormDescription>تم التحقق من البريد</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneVerified"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <FormLabel>الهاتف موثق</FormLabel>
                            <FormDescription>تم التحقق من الهاتف</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twoFactorEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <FormLabel>التحقق الثنائي</FormLabel>
                            <FormDescription>مفعّل</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/users/${userId}`)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  aria-busy={saving}
                  aria-label={saving ? "جاري حفظ التغييرات" : "حفظ التغييرات"}
                >
                  <Save className="ml-2 h-4 w-4" />
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </div>
          </div>
        </fieldset>
        </form>
      </Form>
    </div>
  );
}
