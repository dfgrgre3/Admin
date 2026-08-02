"use client";

import * as React from "react";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";
import { SmartAlerts } from "@/components/admin/dashboard/smart-alerts";

interface Alert {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description?: string;
  timestamp?: Date;
  metric?: { current: number; previous: number; change: number };
  action?: { label: string; href?: string; onClick?: () => void };
}

interface SystemDiagnosticsSectionProps {
  alerts: Alert[];
}

/**
 * SystemDiagnosticsSection — SystemPulse + SmartAlerts grid.
 *
 * Extracted from the God Component. SystemPulse is dynamically imported so
 * its heavy dependencies are only loaded when this section renders.
 */
export const SystemDiagnosticsSection = React.memo(function SystemDiagnosticsSection({
  alerts,
}: SystemDiagnosticsSectionProps) {
  return (
    <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل تشخيصات النظام</div>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-gray-400">
          تم دمج تشخيصات النظام ضمن العرض الموحّد للوحة التحكم.
        </div>
        <SmartAlerts
          alerts={alerts}
          title="التنبيهات والتحليلات الذكية"
          className="h-full"
        />
      </div>
    </ErrorBoundary>
  );
});