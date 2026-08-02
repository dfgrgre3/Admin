import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function AdminProfilePage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الحساب"
      title="الملف الشخصي"
      description="عرض وتعديل بيانات حسابك الشخصي وإعداداتك."
      iconName="UserCog"
    />
  );
}
