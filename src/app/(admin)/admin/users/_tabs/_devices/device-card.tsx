"use client";

import { Shield, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Device } from "./device-types";
import { DeviceTypeIcon } from "./device-icons";

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <DeviceTypeIcon type={device.type} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-white">
              {device.browser} • {device.os}
            </p>
            {device.isCurrent ? (
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" />
                الحالي
              </Badge>
            ) : null}
            {device.trusted ? (
              <Badge variant="default" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                موثوق
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                جديد
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {device.ipAddress}
            {device.location ? ` • ${device.location}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            آخر نشاط: {formatDate(device.lastActive)}
          </p>
        </div>
      </div>
    </div>
  );
}