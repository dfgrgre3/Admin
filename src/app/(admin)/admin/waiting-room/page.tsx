import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function WaitingRoomPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الحصص المباشرة"
      title="غرفة الانتظار"
      description="إدارة الطلاب المنتظرين في قاعة الانتظار قبل بدء الحصة."
      iconName="DoorOpen"
    />
  );
}
