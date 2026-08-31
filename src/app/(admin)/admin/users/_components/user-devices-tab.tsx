"use client";

import * as React from "react";
import { DeviceList, DeviceLoadingState } from "../_tabs/_devices/device-list";
import { DeviceStats } from "../_tabs/_devices/device-stats";
import type { Device, UserDevicesTabProps } from "../_tabs/_devices/device-types";

export function UserDevicesTab({ userId: _userId }: UserDevicesTabProps) {
  const [devices] = React.useState<Device[]>([]);
  const [loading] = React.useState(false);

  if (loading) return <DeviceLoadingState />;

  return (
    <div className="space-y-4">
      <DeviceStats devices={devices} />
      <DeviceList devices={devices} />
    </div>
  );
}