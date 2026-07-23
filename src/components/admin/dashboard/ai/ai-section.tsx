"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AiCommandCenter } from "@/components/admin/dashboard/ai-command-center";
import { SmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import { GoalsKPIs } from "@/components/admin/dashboard/goals-kpis";
import { Brain, Zap, Target, Bell } from "lucide-react";

interface AiSectionProps {
  dashboardContext: {
    stats: any;
    trends: any;
    activity: any;
    alerts: any[];
    recentActivity: any[];
    upcomingEvents: any[];
    timeFilter: string;
    realtime: { connected: boolean };
  };
  pageControls: {
    refreshDashboard: () => void;
    openBroadcast: () => void;
    setTimeFilter: (filter: "today" | "week" | "month" | "year") => void;
    scrollToSection: (sectionId: string) => void;
  };
  goals: Array<{
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
    category: "users" | "content" | "engagement" | "revenue" | "other";
    priority: "low" | "medium" | "high";
  }>;
  alerts: any[];
}

export function AiSection({
  dashboardContext,
  pageControls,
  goals,
  alerts
}: AiSectionProps) {
  return (
    <div className="space-y-8">
      {/* AI Command Center */}
      <AdminCard variant="glass" className="border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-black">مركز الأوامر الذكي</h3>
        </div>
        <AiCommandCenter 
          dashboardContext={dashboardContext} 
          pageControls={pageControls} 
        />
      </AdminCard>

      {/* Smart Alerts and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminCard variant="glass" className="border-amber-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-black">التنبيهات الذكية</h3>
          </div>
          <SmartAlerts 
            alerts={alerts} 
            title="التنبيهات والتحليلات الذكية"
            className="h-full"
          />
        </AdminCard>

        <AdminCard variant="glass" className="border-green-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-green-500" />
            <h3 className="text-xl font-black">الأهداف ومؤشرات الأداء</h3>
          </div>
          <GoalsKPIs 
            goals={goals}
          />
        </AdminCard>
      </div>
    </div>
  );
}
