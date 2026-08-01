"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthStatusBadge } from "./health-status-badge";
import type { HealthStatusData } from "../_types/health";

interface OverallStatusBannerProps {
  health: HealthStatusData;
}

export function OverallStatusBanner({ health }: OverallStatusBannerProps) {
  const getStatusMessage = () => {
    switch (health.status) {
      case "healthy":
        return {
          title: "النظام يعمل بشكل ممتاز ✓",
          icon: CheckCircle,
          borderColor: "border-green-500/30",
          bgColor: "bg-green-500/5",
        };
      case "degraded":
        return {
          title: "النظام يعمل مع بعض المشاكل ⚠️",
          icon: AlertTriangle,
          borderColor: "border-yellow-500/30",
          bgColor: "bg-yellow-500/5",
        };
      case "unhealthy":
        return {
          title: "النظام يواجه مشاكل حرجة ❌",
          icon: XCircle,
          borderColor: "border-red-500/30",
          bgColor: "bg-red-500/5",
        };
      default:
        return {
          title: "حالة النظام غير معروفة",
          icon: CheckCircle,
          borderColor: "border-gray-500/30",
          bgColor: "bg-gray-500/5",
        };
    }
  };

  const message = getStatusMessage();
  const Icon = message.icon;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}س و ${minutes}د`;
    } else if (minutes > 0) {
      return `${minutes}د و ${secs}ث`;
    } else {
      return `${secs}ثانية`;
    }
  };

  return (
    <div
      className={cn(
        "border-2 rounded-2xl p-6 transition-all duration-300",
        message.borderColor,
        message.bgColor
      )}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Icon className="w-10 h-10" />
          <div>
            <h3 className="text-2xl font-black">{message.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              آخر تحديث:{" "}
              {new Date(health.timestamp).toLocaleString("ar-SA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-left">
            <p className="text-xs text-muted-foreground mb-1">وقت التشغيل</p>
            <p className="text-lg font-black">{formatUptime(health.uptime)}</p>
          </div>
          
          <div className="text-left">
            <p className="text-xs text-muted-foreground mb-1">الإصدار</p>
            <p className="text-lg font-black font-mono">{health.version === "unknown" ? "غير متاح" : health.version}</p>
          </div>

          <HealthStatusBadge status={health.status} size="lg" />
        </div>
      </div>
    </div>
  );
}