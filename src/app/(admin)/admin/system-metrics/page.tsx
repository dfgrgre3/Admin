import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function SystemMetricsPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="المطورين"
      title="مؤشرات النظام"
      description="مؤشرات أداء النظام: استهلاك الموارد وزمن الاستجابة."
      iconName="Gauge"
    />
  );
}
