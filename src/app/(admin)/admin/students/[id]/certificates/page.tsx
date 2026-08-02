import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentCertificatesPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="شهادات الطالب"
      description="الشهادات المتحصل عليها الطالب وملفات إنجازه."
      iconName="Award"
    />
  );
}
