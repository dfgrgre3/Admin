import { AdminCard } from "@/components/admin/ui/admin-card";
import { HealthStatusBadge } from "../../_components/health-status-badge";
import type { ServiceHealthCurrent } from "../_hooks/use-service-health-history";

interface ServiceStatusHeaderProps {
  serviceName: string;
  current: ServiceHealthCurrent | null;
}

export function ServiceStatusHeader({ serviceName, current }: ServiceStatusHeaderProps) {
  if (!current) return null;

  const lastChecked = new Date(current.lastCheckedAt);

  return (
    <AdminCard variant="glass" className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black">{serviceName}</h2>
          <HealthStatusBadge status={current.status} size="md" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{current.details}</p>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">زمن الاستجابة الحالي</p>
          <p className="text-lg font-bold">{Math.round(current.latency)} ms</p>
        </div>
        {current.errorRate !== null && (
          <div>
            <p className="text-xs text-muted-foreground">معدل الأخطاء</p>
            <p className="text-lg font-bold">{(current.errorRate * 100).toFixed(2)}%</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">آخر فحص</p>
          <p className="text-lg font-bold">
            {Number.isNaN(lastChecked.getTime())
              ? "—"
              : lastChecked.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
      </div>
    </AdminCard>
  );
}
