import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function PaymentLogsPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="المدفوعات"
      title="سجلات الدفع"
      description="سجل تفصيلي بجميع عمليات الدفع على المنصة."
      iconName="ReceiptText"
    />
  );
}
