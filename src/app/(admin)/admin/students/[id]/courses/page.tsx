import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentCoursesPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="دورات الطالب"
      description="قائمة الدورات المسجل بها الطالب وحالة كل دورة."
      iconName="BookOpen"
    />
  );
}
