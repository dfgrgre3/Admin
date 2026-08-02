"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  onRefresh: () => void;
  isFetching: boolean;
  notifications: any[];
  isConnected: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
}

export function DashboardHeader({
  userName,
  onRefresh,
  isFetching,
  notifications,
  isConnected,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight">لوحة التحكم الإدارية</h1>
        <p className="text-gray-400 font-medium">
          مرحباً بك، {userName || "المسؤول"}. إليك نظرة شاملة على مستجدات المنصة التعليمية.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <AdminButton
          variant="outline"
          size="lg"
          onClick={onRefresh}
          loading={isFetching}
          icon={RefreshCw}
          className="h-14 px-8 rounded-2xl"
        >
          تحديث البيانات
        </AdminButton>
      </div>
    </header>
  );
}
