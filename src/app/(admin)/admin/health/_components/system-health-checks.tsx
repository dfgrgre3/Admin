import Link from "next/link";
import { Database, Activity, Server, HardDrive, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthStatusBadge } from "./health-status-badge";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { SystemHealth } from "../_types/health";

interface SystemHealthChecksProps {
  system: SystemHealth | undefined;
}

const getComponentIcon = (key: string) => {
  switch (key) {
    case "database":
      return Database;
    case "redis":
      return Activity;
    case "api":
      return Server;
    case "storage":
      return HardDrive;
    default:
      return Server;
  }
};

// This tab's checks object uses "redis" while the detail-page route (and the
// backend's dashboardServiceChecks) uses "cache" for the same probe.
const detailRouteKey: Record<string, string> = {
  redis: "cache",
};

export function SystemHealthChecks({ system }: SystemHealthChecksProps) {
  if (!system?.checks) return null;

  const checks = system.checks;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(checks).map(([key, component]) => {
        const Icon = getComponentIcon(key);
        const routeKey = detailRouteKey[key] ?? key;

        return (
          <AdminCard key={key} variant="glass">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    component.status === "healthy" && "bg-green-500/10 text-green-500",
                    component.status === "degraded" && "bg-yellow-500/10 text-yellow-500",
                    component.status === "unhealthy" && "bg-red-500/10 text-red-500"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg capitalize">{key}</h4>
                  <p className="text-xs text-muted-foreground">
                    آخر فحص:{" "}
                    {new Date(component.lastCheck).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <HealthStatusBadge status={component.status} size="sm" />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">زمن الاستجابة</span>
                <span className="font-bold text-lg">{component.responseTime}ms</span>
              </div>

              {component.details && (
                <div className="p-3 bg-accent/20 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground italic">{component.details}</p>
                </div>
              )}

              {component.metrics &&
                Object.entries(component.metrics).map(([metric, value]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground capitalize">
                      {metric.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold">
                      {typeof value === "number"
                        ? value.toLocaleString("ar-SA")
                        : String(value)}
                    </span>
                  </div>
                ))}

              <Link
                href={`/admin/health/${routeKey}`}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-border/60 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                عرض السجل التاريخي التفصيلي
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}