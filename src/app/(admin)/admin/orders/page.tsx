import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function OrdersPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الإدارة المالية"
      title="الطلبات"
      description="إدارة طلبات الشراء لجميع منتجات المنصة واشتراكاتها."
      iconName="ShoppingCart"
    />
  );
}
