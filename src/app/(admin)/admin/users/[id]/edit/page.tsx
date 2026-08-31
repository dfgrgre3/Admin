"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { useUserEdit } from "./_hooks/use-user-edit";
import { UserEditSkeleton } from "./_components/user-edit-skeleton";
import { ProfileCard } from "./_components/profile-card";
import { BasicInfoCard } from "./_components/basic-info-card";
import { EducationInfoCard } from "./_components/education-info-card";
import { SecurityCard } from "./_components/security-card";

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user, loading, saving, form, handleSubmit } = useUserEdit(userId);

  if (loading) return <UserEditSkeleton />;
  if (!user) return null;

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={saving} style={{ all: "unset", display: "contents" }}>
            <div className="grid gap-6 lg:grid-cols-3">
              <ProfileCard user={user} form={form} />
              <div className="lg:col-span-2 space-y-6">
                <BasicInfoCard form={form} />
                <EducationInfoCard form={form} />
                <SecurityCard form={form} />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => router.push(`/admin/users/${userId}`)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={saving} aria-busy={saving} aria-label={saving ? "جاري حفظ التغييرات" : "حفظ التغييرات"}>
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