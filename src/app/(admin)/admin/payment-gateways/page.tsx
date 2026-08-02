import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function PaymentGatewaysPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="المدفوعات"
      title="بوابات الدفع"
      description="إدارة بوابات الدفع المتاحة وإعدادات كل بوابة."
      iconName="CreditCard"
    />
  );
}
