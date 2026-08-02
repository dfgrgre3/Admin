import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function CourseQuestionsPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الدورات التعليمية"
      title="أسئلة الدورة"
      description="إدارة الأسئلة والاستفسارات المطروحة على الدورة وإجابات المعلم."
      iconName="MessageCircleQuestion"
    />
  );
}
