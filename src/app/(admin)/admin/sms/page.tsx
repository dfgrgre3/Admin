import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function SmsPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الإشعارات"
      title="رسائل SMS"
      description="إدارة رسائل SMS المرسلة للمستخدمين وتتبعها."
      iconName="MessageSquare"
    />
  );
}
