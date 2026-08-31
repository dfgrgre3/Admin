"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import type { Device } from "./device-types";
import { DeviceCard } from "./device-card";

interface DeviceListProps {
  devices: Device[];
}

export function DeviceList({ devices }: DeviceListProps) {
  return (
    <AdminCard variant="glass" className="p-6">
      <h3 className="text-xl font-black mb-4">الأجهزة</h3>
      {devices.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد أجهزة مسجلة</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </AdminCard>
  );
}

export function DeviceLoadingState() {
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