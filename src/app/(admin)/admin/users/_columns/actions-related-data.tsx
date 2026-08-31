"use client";

import {
  Activity, Award, CircleOff, FileText, LifeBuoy, Package, Wallet,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";

interface RelatedDataActionsProps {
  userId: string;
  isDeleted: boolean;
  canViewSessions: boolean;
  canTerminateSessions: boolean;
  canViewActivity: boolean;
  canViewAudit: boolean;
  canViewOrders: boolean;
  canViewFinancial: boolean;
  canViewCertificates: boolean;
  canViewSupport: boolean;
  onTerminateAllSessions: (user: AdminUserListItem) => void;
}

export function RelatedDataActions({
  userId, isDeleted,
  canViewSessions, canTerminateSessions, canViewActivity, canViewAudit,
  canViewOrders, canViewFinancial, canViewCertificates, canViewSupport,
  onTerminateAllSessions,
}: RelatedDataActionsProps) {
  const router = useRouter();
  const hasRelated = canViewSessions || canViewActivity || canViewAudit || canViewOrders
    || canViewFinancial || canViewCertificates || canViewSupport;
  if (!hasRelated) return null;

  const showSeparator = hasRelated && !isDeleted;
  return (
    <>
      {showSeparator && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[11px]">البيانات المرتبطة</DropdownMenuLabel>
        </>
      )}
      {canViewSessions && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/user-sessions?userId=${userId}`)}>
          <Activity className="ml-2 h-4 w-4" />
          الجلسات النشطة
        </DropdownMenuItem>
      )}
      {canTerminateSessions && !isDeleted && (
        <DropdownMenuItem onClick={() => onTerminateAllSessions({ id: userId } as AdminUserListItem)}>
          <CircleOff className="ml-2 h-4 w-4 text-destructive" />
          إنهاء جميع الجلسات
        </DropdownMenuItem>
      )}
      {canViewActivity && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/activity`)}>
          <Activity className="ml-2 h-4 w-4" />
          سجل النشاط
        </DropdownMenuItem>
      )}
      {canViewAudit && (
        <DropdownMenuItem onClick={() => router.push(`/admin/audit-logs?userId=${userId}`)}>
          <FileText className="ml-2 h-4 w-4" />
          سجل التدقيق
        </DropdownMenuItem>
      )}
      {canViewOrders && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/orders?userId=${userId}`)}>
          <Package className="ml-2 h-4 w-4" />
          الطلبات
        </DropdownMenuItem>
      )}
      {canViewFinancial && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/wallet?userId=${userId}`)}>
          <Wallet className="ml-2 h-4 w-4" />
          المحفظة
        </DropdownMenuItem>
      )}
      {canViewCertificates && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/certificates?userId=${userId}`)}>
          <Award className="ml-2 h-4 w-4" />
          الشهادات
        </DropdownMenuItem>
      )}
      {canViewSupport && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/tickets?userId=${userId}`)}>
          <LifeBuoy className="ml-2 h-4 w-4" />
          تذاكر الدعم
        </DropdownMenuItem>
      )}
    </>
  );
}