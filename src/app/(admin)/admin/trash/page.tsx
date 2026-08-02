import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function TrashPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="النظام"
      title="سلة المحذوفات"
      description="استعادة العناصر المحذوفة أو حذفها نهائياً."
      iconName="Trash2"
    />
  );
}
