import { AdminCard } from "@/components/admin/ui/admin-card";
import { Activity, Clock, ShieldAlert } from "lucide-react";

interface ServiceSummaryCardsProps {
  uptimePercent: number;
  avgLatencyMs: number;
  incidentCount: number;
}

export function ServiceSummaryCards({
  uptimePercent,
  avgLatencyMs,
  incidentCount,
}: ServiceSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <AdminCard variant="glass" className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">نسبة التوفر خلال الفترة</p>
          <p className="text-2xl font-black">{uptimePercent.toFixed(2)}%</p>
        </div>
      </AdminCard>

      <AdminCard variant="glass" className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">متوسط زمن الاستجابة</p>
          <p className="text-2xl font-black">{Math.round(avgLatencyMs)} ms</p>
        </div>
      </AdminCard>

      <AdminCard variant="glass" className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">عدد الحوادث المسجّلة</p>
          <p className="text-2xl font-black">{incidentCount}</p>
        </div>
      </AdminCard>
    </div>
  );
}
