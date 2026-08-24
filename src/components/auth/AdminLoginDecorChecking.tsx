"use client";

import { ShieldAlert } from "lucide-react";

/** Decorated loading state of the `/auth/admin-login` variant. */
export default function AdminLoginDecorChecking() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="relative">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-red-500/20 border-t-red-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
        </div>
      </div>
      <p className="animate-pulse text-sm font-medium text-red-400">جاري التحقق من الصلاحيات الأمنية...</p>
    </div>
  );
}
