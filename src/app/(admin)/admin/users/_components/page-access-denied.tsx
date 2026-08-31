"use client";

import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageAccessDeniedProps {
  onBack: () => void;
}

export function PageAccessDenied({ onBack }: PageAccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center" dir="rtl">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20 mb-6">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-black mb-2">غير مصرح بالوصول</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        ليس لديك الصلاحية لعرض صفحة إدارة المستخدمين. يرجى التواصل مع مدير النظام.
      </p>
      <Button variant="outline" onClick={onBack}>
        العودة إلى لوحة التحكم
      </Button>
    </div>
  );
}