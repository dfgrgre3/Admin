import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function TeacherCoursesPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="المعلمين"
      title="دورات المعلم"
      description="قائمة الدورات التي يقدمها المعلم وحالة كل دورة."
      iconName="BookOpen"
    />
  );
}
