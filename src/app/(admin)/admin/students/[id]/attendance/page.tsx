import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentAttendancePage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="حضور الطالب"
      description="سجل حضور الطالب في الحصص المباشرة والجلسات الدراسية."
      iconName="CalendarCheck"
    />
  );
}
