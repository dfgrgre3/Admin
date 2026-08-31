"use client";

import { useRouter } from "next/navigation";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Form } from "@/components/ui/form";
import { AvatarUploader } from "./_components/avatar-uploader";
import { BasicInfoFields } from "./_components/basic-info-fields";
import { FormFooter } from "./_components/form-footer";
import { LocationPersonalFields } from "./_components/location-personal-fields";
import { RoleStatusFields } from "./_components/role-status-fields";
import { useCreateUserForm } from "./_components/use-create-user";

export default function CreateUserPage() {
  const router = useRouter();
  const {
    form,
    isSubmitting,
    avatarFile,
    avatarPreview,
    handleAvatarUpload,
    resetAvatar,
    handleSubmit,
  } = useCreateUserForm();

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
            <AvatarUploader
              preview={avatarPreview}
              firstName={form.watch("firstName")}
              fileName={avatarFile?.name}
              onUpload={handleAvatarUpload}
              onRemove={resetAvatar}
            />

            <div className="lg:col-span-2 space-y-6">
              <BasicInfoFields form={form} />
              <RoleStatusFields form={form} />
              <LocationPersonalFields form={form} />
              <FormFooter
                isSubmitting={isSubmitting}
                onCancel={() => router.push("/admin/users")}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}