import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentOrdersPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="طلبات الطالب"
      description="سجل طلبات الطالب وعمليات الشراء والاشتراكات."
      iconName="ShoppingCart"
    />
  );
}
