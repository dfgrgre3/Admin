export type DeviceType = "desktop" | "mobile" | "tablet" | string;

export interface Device {
  id: string;
  type: DeviceType;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
  trusted: boolean;
}

export interface UserDevicesTabProps {
  userId: string;
}