"use client";

import { Loader2 } from "lucide-react";

/** Full-panel loading state shown on `AdminLoginPage` while auth state resolves. */
export default function AdminAuthChecking() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      <p className="text-sm font-medium text-red-400">جاري التحقق من الصلاحيات الأمنية...</p>
    </div>
  );
}
