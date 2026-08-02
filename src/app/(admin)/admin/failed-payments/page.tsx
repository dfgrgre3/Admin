import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function FailedPaymentsPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="المدفوعات"
      title="المدفوعات الفاشلة"
      description="مراجعة عمليات الدفع الفاشلة وأسباب فشلها ومعالجتها."
      iconName="XCircle"
    />
  );
}
