"use client";

import * as React from "react";
import { DraggableDashboard } from "@/components/admin/dashboard/draggable-dashboard";
import { ErrorBoundary } from "@/components/admin/ui/error-boundary";
import { SystemPulse } from "@/components/admin/dashboard/system-pulse";

interface DashboardLayoutProps {
  sections: Array<{
    id: string;
    content: React.ReactNode;
  }>;
  onOrderChange?: (newOrder: string[]) => void;
}

export function DashboardLayout({ sections, onOrderChange }: DashboardLayoutProps) {
  return (
    <div className="space-y-12">
      <DraggableDashboard onOrderChange={onOrderChange || (() => {})}>
        {sections}
      </DraggableDashboard>
    </div>
  );
}

export function SystemDiagnosticsSection() {
  return (
    <ErrorBoundary fallback={<div className="text-gray-400 p-8 text-center font-bold">حدث خطأ في تحميل تشخيصات النظام</div>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SystemPulse />
        <div className="admin-glass p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-xl font-black mb-6">حالة النظام</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="font-bold">قاعدة البيانات</span>
              <span className="text-green-500 font-black">متصل</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="font-bold">خادم API</span>
              <span className="text-green-500 font-black">نشط</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="font-bold">خدمة Redis</span>
              <span className="text-green-500 font-black">متصل</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="font-bold">خدمة WebSocket</span>
              <span className="text-green-500 font-black">نشط</span>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
