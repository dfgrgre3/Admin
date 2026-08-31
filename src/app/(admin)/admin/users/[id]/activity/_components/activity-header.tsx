"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Download, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface ActivityHeaderProps {
  userLabel: string;
  onRefresh: () => void;
  userId: string;
}

export function ActivityHeader({ userLabel, onRefresh, userId }: ActivityHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <PageHeader
        title={`سجل النشاط — ${userLabel}`}
        description="جدول زمني شامل لكل أحداث المستخدم من تسجيل دخول وإجراءات إدارية وأحداث أكاديمية ومالية."
        className="p-0"
      />
      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          icon={ArrowRight}
          className="rounded-2xl border-white/10"
          onClick={() => router.push(`/admin/users/${userId}`)}
        >
          ملف المستخدم
        </AdminButton>
        <AdminButton
          variant="outline"
          icon={RefreshCw}
          className="rounded-2xl border-white/10"
          onClick={onRefresh}
        >
          تحديث
        </AdminButton>
        <AdminButton icon={Download} className="rounded-2xl">
          تصدير CSV
        </AdminButton>
      </div>
    </div>
  );
}