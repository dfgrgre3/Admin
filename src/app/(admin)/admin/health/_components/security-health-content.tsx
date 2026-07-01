"use client";

import { Shield, AlertTriangle, XCircle, Activity } from "lucide-react";
import { AdminCard, AdminStatsCard } from "@/components/admin/ui/admin-card";
import { HealthStatusBadge } from "./health-status-badge";
import { cn } from "@/lib/utils";
import type { SecurityHealth } from "../_types/health";

interface SecurityStatsCardsProps {
  security: SecurityHealth | undefined;
}

export function SecurityStatsCards({ security }: SecurityStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AdminCard
        variant="glass"
        className={cn(
          "border-2",
          security?.threatLevel === "low" && "border-green-500/30 bg-green-500/5",
          security?.threatLevel === "medium" && "border-yellow-500/30 bg-yellow-500/5",
          security?.threatLevel === "high" && "border-orange-500/30 bg-orange-500/5",
          security?.threatLevel === "critical" && "border-red-500/30 bg-red-500/5"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-muted-foreground">مستوى التهديد</p>
            <h3 className="text-2xl font-black mt-1 capitalize">
              {security?.threatLevel || "low"}
            </h3>
          </div>
          <Shield className="w-8 h-8" />
        </div>
      </AdminCard>
      <AdminStatsCard
        title="تهديدات نشطة"
        value={(security?.activeThreats || 0).toLocaleString()}
        description="تحتاج مراجعة"
        icon={AlertTriangle}
        color="red"
      />
      <AdminStatsCard
        title="عناوين محظورة"
        value={(security?.blockedIPs || 0).toLocaleString()}
        description="في القائمة السوداء"
        icon={XCircle}
        color="red"
      />
      <AdminStatsCard
        title="أنشطة مشبوهة"
        value={(security?.suspiciousActivities || 0).toLocaleString()}
        description="آخر 24 ساعة"
        icon={Activity}
        color="yellow"
      />
    </div>
  );
}

interface TwoFactorAuthProps {
  security: SecurityHealth | undefined;
}

export function TwoFactorAuth({ security }: TwoFactorAuthProps) {
  const enabled = security?.twoFactorEnabled || 0;
  const total = security?.twoFactorTotal || 0;
  const percentage = total > 0 ? Math.round((enabled / total) * 100) : 0;

  return (
    <AdminCard variant="glass">
      <h3 className="text-xl font-black mb-4">المصادقة الثنائية</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">المستخدمون المفعلون</span>
          <span className="text-lg font-black">
            {enabled} / {total}
          </span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {percentage}% من المستخدمين
        </p>
      </div>
    </AdminCard>
  );
}

interface RecentIncidentsListProps {
  security: SecurityHealth | undefined;
}

export function RecentIncidentsList({ security }: RecentIncidentsListProps) {
  const incidents = security?.recentIncidents || [];

  if (incidents.length === 0) return null;

  return (
    <AdminCard variant="glass">
      <h3 className="text-xl font-black mb-4">الحوادث الأخيرة</h3>
      <div className="space-y-3">
        {incidents.map((incident, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm font-bold">{incident.type}</p>
              <p className="text-xs text-muted-foreground">{incident.count} حالة</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(incident.lastOccurrence).toLocaleString("ar-SA")}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}