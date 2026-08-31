"use client";

import { AlertTriangle, CheckCircle, Clock, Flag } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { Report } from "./report-types";

interface ReportsStatsProps {
  reports: Report[];
}

interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: typeof Flag;
}

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </AdminCard>
  );
}

export function ReportsStats({ reports }: ReportsStatsProps) {
  const pendingCount = reports.filter(
    (r) => r.status === "pending" || r.status === "reviewing",
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const criticalCount = reports.filter((r) => r.priority === "critical").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="إجمالي البلاغات"
        value={reports.length}
        iconBg="bg-red-500/10"
        iconColor="text-red-500"
        Icon={Flag}
      />
      <StatCard
        label="معلقة"
        value={pendingCount}
        iconBg="bg-yellow-500/10"
        iconColor="text-yellow-500"
        Icon={Clock}
      />
      <StatCard
        label="تم الحل"
        value={resolvedCount}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
        Icon={CheckCircle}
      />
      <StatCard
        label="حرجة"
        value={criticalCount}
        iconBg="bg-red-500/10"
        iconColor="text-red-500"
        Icon={AlertTriangle}
      />
    </div>
  );
}