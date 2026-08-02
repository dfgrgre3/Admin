import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentProfilePage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="ملف الطالب"
      description="عرض البيانات الشخصية والتفاصيل الكاملة للطالب."
      iconName="UserRound"
    />
  );
}
