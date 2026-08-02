import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function LessonDripPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الدروس"
      title="الإصدار المدرج (Drip)"
      description="ضبط إصدار محتوى الدرس على فترات زمنية تدريجية للطلاب."
      iconName="Hourglass"
    />
  );
}
