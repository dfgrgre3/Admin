"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Shield, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Device {
  id: string;
  type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
  trusted: boolean;
}

interface UserDevicesTabProps {
  userId: string;
}

export function UserDevicesTab({ userId }: UserDevicesTabProps) {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Fetch devices from API
    setLoading(false);
  }, [userId]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return <Monitor className="h-5 w-5 text-blue-500" />;
      case "mobile":
        return <Smartphone className="h-5 w-5 text-green-500" />;
      case "tablet":
        return <Tablet className="h-5 w-5 text-purple-500" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي الأجهزة</p>
              <p className="text-2xl font-black">{devices.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">موثوقة</p>
              <p className="text-2xl font-black">
                {devices.filter((d) => d.trusted).length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">موبايل</p>
              <p className="text-2xl font-black">
                {devices.filter((d) => d.type === "mobile").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">مواقع فريدة</p>
              <p className="text-2xl font-black">
                {new Set(devices.map((d) => d.location).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Devices List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">الأجهزة</h3>
        {devices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد أجهزة مسجلة</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">
                        {device.browser} • {device.os}
                      </p>
                      {device.isCurrent && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          الحالي
                        </Badge>
                      )}
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
                      {device.location && ` • ${device.location}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      آخر نشاط: {formatDate(device.lastActive)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}