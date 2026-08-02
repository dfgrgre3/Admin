import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function TeacherSchedulePage() {
  return (
    <AdminSectionSkeleton
      eyebrow="المعلمين"
      title="جدول المعلم"
      description="جدول الحصص المباشرة والجلسات الدراسية للمعلم."
      iconName="CalendarDays"
    />
  );
}
