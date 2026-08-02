import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function InvoicesPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الإدارة المالية"
      title="الفواتير"
      description="إدارة وعرض الفواتير الصادرة للطلاب والجهات."
      iconName="FileText"
    />
  );
}
