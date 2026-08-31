"use client";

import { Globe, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { Device } from "./device-types";

interface DeviceStatsProps {
  devices: Device[];
}

interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: typeof Monitor;
}

function StatCard({ label, value, iconBg, iconColor, Icon }: StatCardProps) {
  return (
    <AdminCard variant="glass" className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold">{label}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </AdminCard>
  );
}

export function DeviceStats({ devices }: DeviceStatsProps) {
  const trusted = devices.filter((d) => d.trusted).length;
  const mobile = devices.filter((d) => d.type === "mobile").length;
  const uniqueLocations = new Set(
    devices.map((d) => d.location).filter(Boolean),
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="إجمالي الأجهزة"
        value={devices.length}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
        Icon={Monitor}
      />
      <StatCard
        label="موثوقة"
        value={trusted}
        iconBg="bg-green-500/10"
        iconColor="text-green-500"
        Icon={ShieldCheck}
      />
      <StatCard
        label="موبايل"
        value={mobile}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-500"
        Icon={Smartphone}
      />
      <StatCard
        label="مواقع فريدة"
        value={uniqueLocations}
        iconBg="bg-orange-500/10"
        iconColor="text-orange-500"
        Icon={Globe}
      />
    </div>
  );
}