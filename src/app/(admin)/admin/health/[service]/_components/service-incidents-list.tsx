import { AdminCard } from "@/components/admin/ui/admin-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckCircle2 } from "lucide-react";
import { HealthStatusBadge } from "../../_components/health-status-badge";
import type { ServiceHealthHistoryPoint } from "../_hooks/use-service-health-history";

interface ServiceIncidentsListProps {
  history: ServiceHealthHistoryPoint[];
}

export function ServiceIncidentsList({ history }: ServiceIncidentsListProps) {
  const incidents = history.filter((point) => point.status !== "healthy").slice().reverse();

  return (
    <AdminCard variant="glass">
      <h3 className="mb-4 text-lg font-black">الحوادث المسجّلة خلال الفترة</h3>

      {incidents.length === 0 ? (
        <EmptyState
          size="sm"
          icon={CheckCircle2}
          title="لا توجد حوادث في هذه الفترة"
          description="الخدمة كانت سليمة في كل فحص مسجّل."
        />
      ) : (
        <ul className="space-y-2">
          {incidents.map((incident) => {
            const time = new Date(incident.checkedAt);
            return (
              <li
                key={incident.checkedAt}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{incident.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number.isNaN(time.getTime())
                      ? incident.checkedAt
                      : time.toLocaleString("ar-EG", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                    · {Math.round(incident.latencyMs)} ms
                  </p>
                </div>
                <HealthStatusBadge status={incident.status} size="sm" />
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
