"use client";

import * as React from "react";
import { m } from "framer-motion";
import {
  Eye,
  Globe,
  Cpu,
  Smartphone,
  Laptop,
  Tablet,
  MapPin,
  Wifi,
  Activity,
  Hash,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_CONFIG,
  type AntiCheatFlagDetail,
} from "./types";

interface EvidenceViewerProps {
  detail: AntiCheatFlagDetail | undefined;
  loading?: boolean;
}

export function EvidenceViewer({ detail, loading }: EvidenceViewerProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (!detail) return null;

  const { flag } = detail;
  const evidence = flag?.evidence;
  const ips = evidence?.ips || [];
  const devices = evidence?.devices || [];
  const eventTypes = evidence?.byEventType || [];

  return (
    <div className="space-y-4">
      {/* توزيع الأحداث */}
      {eventTypes.length > 0 && (
        <Section
          icon={Activity}
          title="توزيع أنواع الأحداث"
          description="عدد مرات تكرار كل نوع حدث"
        >
          <div className="space-y-2">
            {eventTypes
              .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
              .slice(0, 8)
              .map((ev: { eventType: string; count: number }) => {
                const cfg = EVENT_TYPE_CONFIG[ev.eventType as keyof typeof EVENT_TYPE_CONFIG];
                const Icon = cfg?.icon || Eye;
                const max = Math.max(...eventTypes.map((e: { count: number }) => e.count));
                const pct = max > 0 ? (ev.count / max) * 100 : 0;
                return (
                  <div key={ev.eventType} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", cfg?.text)} />
                        <span>{cfg?.label || ev.eventType}</span>
                      </div>
                      <span className="font-black">{ev.count}×</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={cn("h-full rounded-full", cfg?.border?.includes("red") ? "bg-red-500" : cfg?.border?.includes("orange") ? "bg-orange-500" : cfg?.border?.includes("amber") ? "bg-amber-500" : "bg-blue-500")}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Section>
      )}

      {/* عناوين IP */}
      {ips.length > 0 && (
        <Section
          icon={Wifi}
          title="عناوين IP المستخدمة"
          description={`${ips.length} عنوان فريد`}
        >
          <div className="space-y-2">
            {ips.map((ip: { ip: string; country?: string; count: number }) => (
              <div
                key={ip.ip}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-mono text-[11px] font-black" dir="ltr">
                    {ip.ip}
                  </span>
                  {ip.country && (
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 bg-blue-500/10 text-[9px] font-black text-blue-500"
                    >
                      <MapPin className="mr-1 h-2.5 w-2.5" />
                      {ip.country}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-black text-muted-foreground">
                  {ip.count} ظهور
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* الأجهزة */}
      {devices.length > 0 && (
        <Section
          icon={Cpu}
          title="بصمات الأجهزة"
          description={`${devices.length} جهاز`}
        >
          <div className="space-y-2">
            {devices.map((dev: { fingerprint: string; browser: string; os: string; count: number }) => (
              <div
                key={dev.fingerprint}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                    {getDeviceIcon(dev.os)}
                  </div>
                  <div>
                    <p className="text-[11px] font-black">{dev.browser}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">
                      {dev.os}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold text-muted-foreground" dir="ltr">
                    {dev.fingerprint.slice(0, 8)}...
                  </span>
                  <Badge
                    variant="outline"
                    className="border-purple-500/30 bg-purple-500/10 text-[10px] font-black text-purple-500"
                  >
                    {dev.count}× ظهور
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* تفاصيل إضافية */}
      {flag.eventCount > 0 && (
        <Section
          icon={Hash}
          title="ملخص الأدلة"
          description="نظرة سريعة على المؤشرات"
        >
          <div className="grid grid-cols-2 gap-3">
            <EvidenceItem
              icon={Activity}
              label="عدد الأحداث"
              value={flag.eventCount.toString()}
            />
            <EvidenceItem
              icon={Lock}
              label="آخر نشاط"
              value={
                flag.lastEventAt
                  ? new Date(flag.lastEventAt).toLocaleString("ar-EG")
                  : "—"
              }
            />
            <EvidenceItem
              icon={Wifi}
              label="IP الحالي"
              value={flag.ipAddress || "—"}
              mono
            />
            <EvidenceItem
              icon={MapPin}
              label="الامتحان"
              value={flag.examTitle || "—"}
            />
          </div>
        </Section>
      )}
    </div>
  );
}

function getDeviceIcon(os: string) {
  const o = os.toLowerCase();
  if (o.includes("android") || o.includes("ios")) return <Smartphone className="h-4 w-4" />;
  if (o.includes("ipad") || o.includes("tablet")) return <Tablet className="h-4 w-4" />;
  return <Laptop className="h-4 w-4" />;
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border/70 bg-card/60 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <div>
          <h4 className="text-xs font-black">{title}</h4>
          {description && (
            <p className="text-[10px] font-bold text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </m.div>
  );
}

function EvidenceItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-1 truncate text-xs font-black",
          mono && "font-mono text-[11px]"
        )}
        dir={mono ? "ltr" : "rtl"}
      >
        {value}
      </p>
    </div>
  );
}