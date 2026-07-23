import { AdminCard } from "@/components/admin/ui/admin-card";
import { Split, BarChart3, CheckCircle, Clock } from "lucide-react";
import { Experiment } from "@/types/ab-testing";

interface StatsCardsProps {
  experiments: Experiment[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ experiments }) => {
  const activeCount = experiments.filter(e => e.status === 'active').length;
  const completedCount = experiments.filter(e => e.status === 'completed').length;
  const pausedCount = experiments.filter(e => e.status === 'paused').length;
  const totalViews = experiments.reduce((sum, e) => sum + e.variantA.views + e.variantB.views, 0);

  const stats = [
    { label: "إجمالي التجارب", value: experiments.length, icon: Split, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "نشطة حالياً", value: activeCount, icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "مكتملة", value: completedCount, icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "إجمالي المشاهدات", value: totalViews.toLocaleString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <AdminCard key={idx} variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-black">{stat.value}</p>
            </div>
          </div>
        </AdminCard>
      ))}
    </div>
  );
};