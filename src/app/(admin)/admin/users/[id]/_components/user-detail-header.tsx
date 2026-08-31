"use client";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ArrowRight, Trash2 } from "lucide-react";
import type { UserDetails } from "./types";

interface UserDetailHeaderProps {
  user: UserDetails;
  onBack: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function UserDetailHeader({ user, onBack, onDelete, canDelete }: UserDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <PageHeader
        title={user.name || "تفاصيل المستخدم"}
        description={`إدارة بيانات ونشاط ${user.name || user.email}`}
        className="p-0"
      />
      <div className="flex items-center gap-3">
        <AdminButton variant="outline" className="rounded-2xl border-white/10" onClick={onBack} icon={ArrowRight}>
          قائمة المستخدمين
        </AdminButton>
        {canDelete && (
          <AdminButton variant="destructive" className="rounded-2xl shadow-xl shadow-danger/20" onClick={onDelete} icon={Trash2}>
            حذف المستخدم
          </AdminButton>
        )}
      </div>
    </div>
  );
}