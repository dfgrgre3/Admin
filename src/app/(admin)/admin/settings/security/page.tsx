import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function SecuritySettingsPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="النظام"
      title="الأمان"
      description="إعدادات أمان النظام: كلمات المرور والمصادقة الثنائية والحماية."
      iconName="ShieldCheck"
    />
  );
}
