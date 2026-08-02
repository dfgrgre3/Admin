import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentNotesPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="ملاحظات الطالب"
      description="الملاحظات المرفقة بملف الطالب من المعلمين والمشرفين."
      iconName="StickyNote"
    />
  );
}
