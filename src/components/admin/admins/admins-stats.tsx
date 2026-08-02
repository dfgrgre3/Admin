import { Activity, ShieldCheck, Users, Zap } from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";

export interface AdminStatsData {
  total: number;
  active: number;
  pending: number;
  critical: number;
}

export function AdminsStats({ total, active, pending, critical }: AdminStatsData) {
  const stats = [
    {
      title: "إجمالي المشرفين",
      value: total,
      description: "جميع الحسابات الإدارية",
      icon: Users,
      color: "violet" as const,
      trend: { value: 0, isPositive: true, label: "الإجمالي الحالي" },
    },
    {
      title: "نشط الآن",
      value: active,
      description: "حسابات نشطة في النظام",
      icon: Activity,
      color: "green" as const,
      trend: { value: 0, isPositive: true, label: "نشط" },
    },
    {
      title: "قيد المراجعة",
      value: pending,
      description: "حسابات تحتاج متابعة",
      icon: ShieldCheck,
      color: "amber" as const,
      trend: { value: 0, isPositive: true, label: "مراجعة" },
    },
    {
      title: "تحتاج متابعة",
      value: critical,
      description: "حالات تحتاج تدخل فوري",
      icon: Zap,
      color: "red" as const,
      trend: { value: 0, isPositive: false, label: "حرج" },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <AdminStatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
