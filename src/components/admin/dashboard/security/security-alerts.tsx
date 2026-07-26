"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Shield, AlertTriangle, Lock, User, Key, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityAlert {
  id: string;
  type: "unauthorized_access" | "failed_login" | "suspicious_activity" | "data_breach" | "malware_detected" | "policy_violation";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved" | "false_positive";
}

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  className?: string;
}

export function SecurityAlerts({ alerts, className }: SecurityAlertsProps) {
  const typeConfig = {
    unauthorized_access: { icon: Lock, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "وصول غير مصرح" },
    failed_login: { icon: User, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "فشل تسجيل الدخول" },
    suspicious_activity: { icon: AlertTriangle, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "نشاط مشبوه" },
    data_breach: { icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "اختراق البيانات" },
    malware_detected: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "برمجيات خبيثة" },
    policy_violation: { icon: Key, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "انتهاك السياسة" },
  };

  const severityConfig = {
    critical: { color: "text-red-500", bg: "bg-red-500/20", label: "حرج" },
    high: { color: "text-orange-500", bg: "bg-orange-500/20", label: "عالي" },
    medium: { color: "text-amber-500", bg: "bg-amber-500/20", label: "متوسط" },
    low: { color: "text-blue-500", bg: "bg-blue-500/20", label: "منخفض" },
  };

  const statusConfig = {
    active: { color: "text-red-500", bg: "bg-red-500/10", label: "نشط" },
    investigating: { color: "text-amber-500", bg: "bg-amber-500/10", label: "قيد التحقيق" },
    resolved: { color: "text-green-500", bg: "bg-green-500/10", label: "تم الحل" },
    false_positive: { color: "text-gray-500", bg: "bg-gray-500/10", label: "إيجابي كاذب" },
  };

  const activeAlerts = alerts.filter(a => a.status === "active").length;
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;

  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>تنبيهات الأمان</span>
        </h3>
        <div className="flex items-center gap-2">
          {criticalAlerts > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-bold">
              <AlertTriangle className="w-4 h-4" />
              {criticalAlerts} حرج
            </div>
          )}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold">
            <Shield className="w-4 h-4" />
            {activeAlerts} نشط
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            لا توجد تنبيهات أمان
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const type = typeConfig[alert.type];
            const TypeIcon = type.icon;
            const severity = severityConfig[alert.severity];
            const status = statusConfig[alert.status];

            return (
              <div
                key={alert.id}
                className={cn("p-4 rounded-xl border transition-all hover:border-primary/30", type.bg, type.border)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-xl", type.bg)}>
                    <TypeIcon className={cn("w-5 h-5", type.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded", severity.color, severity.bg)}>
                        {severity.label}
                      </span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded", status.color, status.bg)}>
                        {status.label}
                      </span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded", type.color, type.bg)}>
                        {type.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {alert.source}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </div>
                    </div>
                  </div>
                  {alert.status === "active" && (
                    <button className="p-2 rounded-lg hover:bg-green-500/20 text-green-500 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
