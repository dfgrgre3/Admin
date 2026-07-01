import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";
import type { HealthStatus, ThreatLevel } from "../_types/health";

interface HealthStatusBadgeProps {
  status: HealthStatus | ThreatLevel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HealthStatusBadge({
  status,
  showIcon = true,
  size = "md",
  className = "",
}: HealthStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "healthy":
      case "low":
        return {
          label: status === "healthy" ? "صحي" : "منخفض",
          colorClass: "bg-green-500/10 text-green-500 border-green-500/20",
          icon: CheckCircle,
        };
      case "degraded":
      case "medium":
        return {
          label: status === "degraded" ? "متدهور" : "متوسط",
          colorClass: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          icon: AlertTriangle,
        };
      case "unhealthy":
      case "high":
        return {
          label: status === "unhealthy" ? "غير صحي" : "مرتفع",
          colorClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
          icon: AlertTriangle,
        };
      case "critical":
        return {
          label: "حرج",
          colorClass: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          colorClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: Activity,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold border rounded-lg transition-all",
        config.colorClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}