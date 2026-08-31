"use client";

import { Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, { Icon: LucideIcon; color: string }> = {
  desktop: { Icon: Monitor, color: "text-blue-500" },
  mobile: { Icon: Smartphone, color: "text-green-500" },
  tablet: { Icon: Tablet, color: "text-purple-500" },
};

const FALLBACK = { Icon: Globe, color: "text-gray-500" };

export function DeviceTypeIcon({ type }: { type: string }) {
  const { Icon, color } = ICONS[type] ?? FALLBACK;
  return <Icon className={`h-5 w-5 ${color}`} />;
}