"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";
import { SmartAlerts } from "@/components/admin/dashboard/smart-alerts";

const SystemPulse = dynamic(() => import("@/components/admin/dashboard/system-pulse").then(mod => mod.SystemPulse), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-[2rem] border border-white/10" />,
});

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
        <SystemPulse />
        <SmartAlerts
          alerts={alerts}
          title="التنبيهات والتحليلات الذكية"
          className="h-full"
        />
      </div>
    </ErrorBoundary>
  );
});