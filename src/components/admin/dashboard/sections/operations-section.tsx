"use client";

import * as React from "react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ServerCrash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DashboardAlert,
  DashboardPendingAction,
  DashboardServiceHealth,
} from "@/hooks/dashboard/use-dashboard-operations";

interface OperationsSectionProps {
  alerts: DashboardAlert[];
  alertsLoading: boolean;
  alertsError: boolean;
  onAcknowledge: (alertId: string) => void;
  isAcknowledging: boolean;
  showAlerts: boolean;
  canAcknowledge: boolean;

  pendingActions: DashboardPendingAction[];
  pendingTotal: number;
  pendingLoading: boolean;
  pendingError: boolean;
  showPending: boolean;

  services: DashboardServiceHealth[];
  overallStatus: string | null;
  healthLoading: boolean;
  healthError: boolean;
  showHealth: boolean;
}

const severityStyles: Record<string, string> = {
  critical: "bg-red-500/15 text-red-600 border-red-500/30",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
  warning: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const severityLabels: Record<string, string> = {
  critical: "حرج",
  error: "خطأ",
  warning: "تحذير",
  info: "معلومة",
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-600 border-red-500/30",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

const priorityLabels: Record<string, string> = {
  urgent: "عاجل",
  high: "مرتفع",
  medium: "متوسط",
  low: "منخفض",
};

const healthStyles: Record<string, string> = {
  healthy: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  degraded: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  unhealthy: "bg-red-500/15 text-red-600 border-red-500/30",
};

const healthLabels: Record<string, string> = {
  healthy: "سليمة",
  degraded: "متدهورة",
  unhealthy: "غير متاحة",
};

/** Shared loading placeholder so each panel can load independently. */
function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Renders the operational half of the dashboard: unacknowledged alerts, the
 * pending-decision queue and live service health.
 *
 * Every panel handles its own loading, empty and error state so a failure in one
 * cannot take down the others.
 */
export const OperationsSection = React.memo(function OperationsSection({
  alerts,
  alertsLoading,
  alertsError,
  onAcknowledge,
  isAcknowledging,
  showAlerts,
  canAcknowledge,
  pendingActions,
  pendingTotal,
  pendingLoading,
  pendingError,
  showPending,
  services,
  overallStatus,
  healthLoading,
  healthError,
  showHealth,
}: OperationsSectionProps) {
  if (!showAlerts && !showPending && !showHealth) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {showAlerts && (
        <AdminCard variant="glass" className="border-amber-500/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black">
              <BellRing className="h-5 w-5 text-amber-500" />
              <span>التنبيهات المفتوحة</span>
            </h3>
            {alerts.length > 0 && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                {alerts.length}
              </Badge>
            )}
          </div>

          {alertsLoading ? (
            <PanelSkeleton />
          ) : alertsError ? (
            <EmptyState
              variant="error"
              size="sm"
              title="تعذر تحميل التنبيهات"
              description="بقية أقسام لوحة التحكم لا تزال تعمل."
            />
          ) : alerts.length === 0 ? (
            <EmptyState
              size="sm"
              icon={CheckCircle2}
              title="لا توجد تنبيهات مفتوحة"
              description="كل التنبيهات تمت معالجتها."
            />
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[11px]", severityStyles[alert.severity])}
                        >
                          {severityLabels[alert.severity] ?? alert.severity}
                        </Badge>
                        {alert.occurrenceCount > 1 && (
                          <span className="text-xs text-muted-foreground">
                            تكرر {alert.occurrenceCount} مرة
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm font-bold">{alert.title}</p>
                      {alert.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {alert.actionUrl && (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                        <Link href={alert.actionUrl}>عرض التفاصيل</Link>
                      </Button>
                    )}
                    {canAcknowledge && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        disabled={isAcknowledging}
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        تمت المعالجة
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      )}

      {showPending && (
        <AdminCard variant="glass" className="border-primary/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black">
              <ClipboardList className="h-5 w-5 text-primary" />
              <span>مهام تنتظر القرار</span>
            </h3>
            {pendingTotal > 0 && (
              <Badge variant="outline" className="border-primary/30 text-primary">
                {pendingTotal}
              </Badge>
            )}
          </div>

          {pendingLoading ? (
            <PanelSkeleton />
          ) : pendingError ? (
            <EmptyState
              variant="error"
              size="sm"
              title="تعذر تحميل المهام المعلقة"
              description="بقية أقسام لوحة التحكم لا تزال تعمل."
            />
          ) : pendingActions.length === 0 ? (
            <EmptyState
              size="sm"
              icon={CheckCircle2}
              title="لا توجد مهام معلقة"
              description="لا شيء ينتظر قراراً إدارياً حالياً."
            />
          ) : (
            <ul className="space-y-3">
              {pendingActions.map((item) => (
                <li key={item.id}>
                  {/* Navigation into the owning module, rather than inline CRUD. */}
                  <Link
                    href={item.actionUrl}
                    className="block rounded-lg border border-border/60 bg-background/40 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-bold">{item.title}</p>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[11px]", priorityStyles[item.priority])}
                      >
                        {priorityLabels[item.priority] ?? item.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.entityType} · {item.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      )}

      {showHealth && (
        <AdminCard variant="glass" className="border-emerald-500/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black">
              <HeartPulse className="h-5 w-5 text-emerald-500" />
              <span>حالة الخدمات</span>
            </h3>
            {overallStatus && (
              <Badge variant="outline" className={cn("text-[11px]", healthStyles[overallStatus])}>
                {healthLabels[overallStatus] ?? overallStatus}
              </Badge>
            )}
          </div>

          {healthLoading ? (
            <PanelSkeleton rows={4} />
          ) : healthError ? (
            <EmptyState
              variant="error"
              size="sm"
              icon={ServerCrash}
              title="تعذر قراءة حالة الخدمات"
              description="بقية أقسام لوحة التحكم لا تزال تعمل."
            />
          ) : services.length === 0 ? (
            <EmptyState
              size="sm"
              title="لا توجد فحوصات متاحة"
              description="لم يتم تكوين أي فحص للخدمات."
            />
          ) : (
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.serviceKey}>
                  <Link
                    href={`/admin/health/${service.serviceKey}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{service.serviceName}</p>
                      <p className="truncate text-xs text-muted-foreground">{service.details}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(service.latency)} ms
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-[11px]", healthStyles[service.status])}
                      >
                        {service.status === "unhealthy" && (
                          <AlertTriangle className="me-1 h-3 w-3" aria-hidden="true" />
                        )}
                        {healthLabels[service.status] ?? service.status}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      )}
    </div>
  );
});
