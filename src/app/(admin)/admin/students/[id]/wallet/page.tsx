import { AdminSectionSkeleton } from "@/components/admin/ui/admin-section-skeleton";
export default function StudentWalletPage() {
  return (
    <AdminSectionSkeleton
      eyebrow="الطلاب"
      title="محفظة الطالب"
      description="رصيد محفظة الطالب وحركات الإيداع والسحب."
      iconName="Wallet"
    />
  );
}
