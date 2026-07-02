"use client";

import type { UserDetails } from "./types";
import { gradeLevelOptions, educationTypeOptions, genderOptions, roleOptions } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Shield,
  User as UserIcon,
  Mail,
  Hash,
  Phone,
  School,
  Save,
  MapPin,
  CalendarDays,
  VenusAndMars,
  AlertCircle
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editableUserSchema, type EditableUserFormData } from "@/lib/validations/user-schemas";
import { useEffect, useCallback, useRef } from "react";

export function SettingsTab({
  user,
  editedUser,
  setEditedUser,
  handleUpdate,
  setIsEditing,
  saving = false
}: {
  user: UserDetails;
  editedUser: Partial<UserDetails>;
  setEditedUser: (u: Partial<UserDetails>) => void;
  handleUpdate: () => Promise<void>;
  setIsEditing: (e: boolean) => void;
  saving?: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<EditableUserFormData>({
    resolver: zodResolver(editableUserSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || undefined,
      gradeLevel: user.gradeLevel || "",
      educationType: user.educationType || "",
      school: user.school || "",
      country: user.country || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
      gender: user.gender as "male" | "female" | "other" | undefined,
      bio: user.bio || "",
    },
  });

  // Sync watched values back to parent `editedUser` so any parent-side logic can read them
  const watchedValues = watch();
  const prevWatchedValuesRef = useRef(watchedValues);

  useEffect(() => {
    // Only update parent when values actually change
    if (JSON.stringify(watchedValues) !== JSON.stringify(prevWatchedValuesRef.current)) {
      prevWatchedValuesRef.current = watchedValues;
      setEditedUser(watchedValues as Partial<UserDetails>);
    }
  }, [watchedValues, setEditedUser]);

  // When `user` prop changes externally (e.g. refetch), re-populate the form
  useEffect(() => {
    reset({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || undefined,
      gradeLevel: user.gradeLevel || "",
      educationType: user.educationType || "",
      school: user.school || "",
      country: user.country || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
      gender: user.gender as "male" | "female" | "other" | undefined,
      bio: user.bio || "",
    });
  }, [user, reset]);

  const onSubmit = useCallback(async () => {
    await handleUpdate();
  }, [handleUpdate]);

  return (
    <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          إعدادات الحساب والصلاحيات
        </CardTitle>
        <CardDescription>تعديل الدور والصلاحيات الأساسية للمستخدم</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold">دور المستخدم</label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger className={`h-12 rounded-xl ${errors.role ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">تغيير الدور سيؤثر على الصلاحيات التي يمتلكها المستخدم في المنصة.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">المرحلة الدراسية</label>
              <Controller
                control={control}
                name="gradeLevel"
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger className={`h-12 rounded-xl ${errors.gradeLevel ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="اختر المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gradeLevel && (
                <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.gradeLevel.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <h4 className="font-bold text-sm">بيانات الملف الشخصي</h4>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم الكامل</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.name ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="الاسم الكامل"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.email ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="البريد الإلكتروني"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المستخدم</label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.username ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="اسم المستخدم"
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.phone ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="رقم الهاتف"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">المدرسة</label>
                <div className="relative">
                  <School className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.school ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="اسم المدرسة"
                    {...register("school")}
                  />
                </div>
                {errors.school && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.school.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع التعليم</label>
                <Controller
                  control={control}
                  name="educationType"
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className={`h-11 rounded-xl ${errors.educationType ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.educationType && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.educationType.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الدولة</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.country ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="الدولة"
                    {...register("country")}
                  />
                </div>
                {errors.country && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.country.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ الميلاد</label>
                <div className="relative">
                  <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    className={`w-full h-11 pr-10 rounded-xl border bg-muted/50 px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all ${errors.dateOfBirth ? "border-destructive ring-destructive/30" : ""}`}
                    placeholder="تاريخ الميلاد"
                    {...register("dateOfBirth")}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">النوع</label>
                <div className="relative">
                  <VenusAndMars className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className={`h-11 pr-10 rounded-xl ${errors.gender ? "border-destructive" : ""}`}>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.gender && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">نبذة تعريفية (Bio)</label>
                <textarea
                  className={`w-full h-24 rounded-xl border bg-muted/50 p-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all resize-none ${errors.bio ? "border-destructive ring-destructive/30" : ""}`}
                  placeholder="اكتب نبذة عن المستخدم..."
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-start gap-3 pt-4">
              <Button
                type="submit"
                className="rounded-xl px-8 shadow-lg shadow-primary/20"
                disabled={saving || (isDirty && !isValid)}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                disabled={saving}
                onClick={() => {
                  setIsEditing(false);
                  reset({
                    name: user.name || "",
                    username: user.username || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    role: user.role || undefined,
                    gradeLevel: user.gradeLevel || "",
                    educationType: user.educationType || "",
                    school: user.school || "",
                    country: user.country || "",
                    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
                    gender: user.gender as "male" | "female" | "other" | undefined,
                    bio: user.bio || "",
                  });
                }}>
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}