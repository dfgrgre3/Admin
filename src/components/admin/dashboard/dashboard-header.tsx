"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { RefreshCw, CalendarDays, Wifi, WifiOff, Download, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  userName?: string;
  userRole?: string;
  wsConnected: boolean;
  isFetching: boolean;
  lastUpdated: Date | null;
  onExport: () => void;
  onRefresh: () => void;
  /** When true the refresh button is visually disabled (e.g. while offline). */
  refreshDisabled?: boolean;
  /** When true the export request is in flight. */
  isExporting?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ar-EG", {
  hour: "2-digit",
  minute: "2-digit",
});

export const DashboardHeader = React.memo(function DashboardHeader({
  userName,
  userRole,
  wsConnected,
  isFetching,
  lastUpdated,
  onExport,
  onRefresh,
  refreshDisabled = false,
  isExporting = false,
}: DashboardHeaderProps) {
  const formattedDate = React.useMemo(() => dateFormatter.format(new Date()), []);
  const statusId = React.useId();
  const dateId = React.useId();

  return (
    <header className="dashboard-hero flex flex-col md:flex-row items-center justify-between gap-6" role="banner" aria-label="لوحة التحكم الإدارية">
      <div className="dashboard-hero-copy space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="dashboard-title text-4xl font-black tracking-tight">لوحة التحكم الإدارية</h1>
          <span
            id={statusId}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
              wsConnected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            )}
            role="status"
            aria-live="polite"
          >
            {wsConnected ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />}
            {wsConnected ? "اتصال لحظي نشط" : "الاتصال اللحظي غير متصل"}
          </span>
          {userRole && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {String(userRole).replace(/_/g, " ")}
            </span>
          )}
        </div>
        <p className="text-gray-400 font-medium" aria-label="تحية المستخدم">مرحباً بك، {userName || "المسؤول"}. إليك نظرة شاملة على مستجدات المن��ة التعليمية.</p>
        <div className="flex items-center gap-2 text-sm text-gray-500" aria-labelledby={dateId}>
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <time id={dateId} className="font-semibold text-gray-400" dateTime={new Date().toISOString()}>
            {formattedDate}
          </time>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3" role="toolbar" aria-label="أدوات التحكم">
        <AdminButton
          variant="outline"
          size="lg"
          onClick={onExport}
          loading={isExporting}
          disabled={isExporting}
          icon={Download}
          className="h-14 px-6 rounded-2xl"
          aria-label="تصدير البيانات"
        >
          تصدير البيانات
        </AdminButton>
        <AdminButton
          variant="premium"
          size="lg"
          onClick={onRefresh}
          loading={isFetching}
          disabled={refreshDisabled || isFetching}
          icon={RefreshCw}
          className="h-14 px-8 rounded-2xl"
          aria-label="تحديث البيانات"
        >
          تحديث البيانات
        </AdminButton>
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            isFetching
              ? "border-white/10 bg-white/5 text-gray-400"
              : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
          )}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          آخر تحديث: {isFetching
            ? "جاري التحديث..."
            : lastUpdated
              ? timeFormatter.format(lastUpdated)
              : "—"}
        </div>
      </div>
    </header>
  );
});
