"use client";

import { Save } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface PermissionsHeaderProps {
  userLabel: string;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function PermissionsHeader({ userLabel, isSaving, onBack, onSave }: PermissionsHeaderProps) {
  return (
    <PageHeader
      title={`صلاحيات ${userLabel}`}
      description="الصلاحيات الافتراضية تأتي من الدور، وما تختاره هنا يمثل صلاحيات إضافية مخصصة لهذا المستخدم."
    >
      <AdminButton variant="outline" onClick={onBack}>رجوع</AdminButton>
      <AdminButton icon={Save} loading={isSaving} onClick={onSave}>
        حفظ الصلاحيات
      </AdminButton>
    </PageHeader>
  );
}