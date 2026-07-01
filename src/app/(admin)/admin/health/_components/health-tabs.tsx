"use client";

import { Server, Database, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealthChecks } from "./system-health-checks";
import { ExamStatsCards, ExamSuccessRate, RecentIssuesList } from "./exam-health-content.tsx";
import { SecurityStatsCards, TwoFactorAuth, RecentIncidentsList } from "./security-health-content.tsx";
import { PerformanceMetricsGrid } from "./performance-metrics-grid.tsx";
import type { SystemHealth, ExamHealth, SecurityHealth, PerformanceMetrics } from "../_types/health";

interface HealthTabsProps {
  system: SystemHealth | undefined;
  exams: ExamHealth | undefined;
  security: SecurityHealth | undefined;
  performance: PerformanceMetrics | undefined;
}

export function HealthTabs({ system, exams, security, performance }: HealthTabsProps) {
  return (
    <Tabs defaultValue="system" className="w-full">
      <TabsList className="w-full bg-background/50 h-14 p-1 border-border rounded-xl mb-6">
        <TabsTrigger value="system" className="w-full h-full text-base font-bold rounded-lg">
          <Server className="w-4 h-4 ml-2" />
          النظام
        </TabsTrigger>
        <TabsTrigger value="exams" className="w-full h-full text-base font-bold rounded-lg">
          <Database className="w-4 h-4 ml-2" />
          الامتحانات
        </TabsTrigger>
        <TabsTrigger value="security" className="w-full h-full text-base font-bold rounded-lg">
          <Activity className="w-4 h-4 ml-2" />
          الأمان
        </TabsTrigger>
        <TabsTrigger value="performance" className="w-full h-full text-base font-bold rounded-lg">
          <Server className="w-4 h-4 ml-2" />
          الأداء
        </TabsTrigger>
      </TabsList>

      <TabsContent value="system" className="space-y-6">
        <SystemHealthChecks system={system} />
      </TabsContent>

      <TabsContent value="exams" className="space-y-6">
        <ExamStatsCards exams={exams} />
        <ExamSuccessRate exams={exams} />
        <RecentIssuesList exams={exams} />
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <SecurityStatsCards security={security} />
        <TwoFactorAuth security={security} />
        <RecentIncidentsList security={security} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceMetricsGrid performance={performance} />
      </TabsContent>
    </Tabs>
  );
}
