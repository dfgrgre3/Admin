"use client";

import * as React from "react";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";
import { SmartAlerts } from "@/components/admin/dashboard/smart-alerts";
import { cn } from "@/lib/utils";
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";

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
  wsConnected?: boolean;
  isError?: boolean;
  errorCount?: number;
  lastUpdated?: Date | null;
  isFetching?: boolean;
  isAuthenticated?: boolean;
  sessionRole?: string;
  onRefresh?: () => void;
}

interface StatusItem {
  label: string;
  value: string;
  healthy: boolean;
  icon: React.ElementType;
  detail?: string;
}

/**
 * SystemDiagnosticsSection — real system status overview + SmartAlerts.
 */
export const SystemDiagnosticsSection = React.memo(function SystemDiagnosticsSection({
  alerts,
  wsConnected = false,
  isError = false,
  errorCount = 0,
  lastUpdated = null,
  isFetching = false,
  isAuthenticated = false,
  sessionRole,
  onRefresh,
}: SystemDiagnosticsSectionProps) {
  const statusItems: StatusItem[] = React.useMemo(() => [
    {
      label: "الاتصال اللحظي (WebSocket)",
      value: wsConnected ? "متصل" : "غير متصل",
      healthy: wsConnected,
      icon: Wifi,
      detail: wsConnected ? "تحديثات فورية نشطة" : "يتم إعادة المحاولة تلقائياً",
    },
    {
      label: "بيانات لوحة التحكم",
      value: isError ? "أخطاء جزئية" : "محدثة",
      healthy: !isError,
      icon: Database,
      detail: errorCount > 0 ? `${errorCount} قسم غير محمّل` : "جميع الأقسام محمّلة",
    },
    {
      label: "جلسة المسؤول",
      value: isAuthenticated ? "مصادقة نشطة" : "غير مصادقة",
      healthy: isAuthenticated,
      icon: ShieldCheck,
      detail: isAuthenticated
        ? sessionRole
          ? `الدور الحالي: ${sessionRole}`
          : "تتحقق من الصلاحية تلقائياً"
        : "يرجى إعادة تسجيل الدخول",
    },
    {
      label: "آخر مزامنة",
      value: isFetching
        ? "جارٍ التحديث..."
        : lastUpdated
          ? new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit" }).format(lastUpdated)
          : "بانتظار البيانات",
      healthy: Boolean(lastUpdated) && !isFetching,
      icon: Activity,
      detail: lastUpdated
        ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(lastUpdated)
        : "—",
    },
  ], [wsConnected, isError, errorCount, lastUpdated, isFetching, isAuthenticated, sessionRole]);

  return (
    <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل تشخيصات النظام</div>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">حالة النظام</h3>
                <p className="text-sm text-gray-400">مراقبة الاتصال والبيانات في الوقت الفعلي</p>
              </div>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isFetching}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                تحديث
              </button>
            )}
          </div>

          <div className="space-y-3">
            {statusItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all",
                    item.healthy
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      item.healthy ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-black",
                      item.healthy ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {item.value}
                    </span>
                    {item.healthy ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={cn(
            "mt-4 flex items-center gap-2 rounded-2xl border p-4 text-sm font-semibold",
            wsConnected
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-amber-500/20 bg-amber-500/5 text-amber-400"
          )}>
            {wsConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {wsConnected
              ? "جميع الأنظمة تعمل بشكل طبيعي"
              : "الاتصال اللحظي متعطل — البيانات قد لا تكون محدثة"}
          </div>
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
