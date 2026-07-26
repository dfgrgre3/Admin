"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor, Search, RefreshCw, Eye, XCircle, Clock, Globe, Smartphone, Users,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface UserSession {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  device: string | null;
  location: string | null;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

interface UserSessionsResponse {
  data: { sessions: UserSession[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalSessions: number; activeSessions: number; uniqueUsers: number } };
}

export default function AdminUserSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "user-sessions", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/user-sessions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch user sessions");
      return (await response.json()) as UserSessionsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const sessions = data?.data?.sessions || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalSessions: 0, activeSessions: 0, uniqueUsers: 0 };

  const handleRevoke = async (id: string) => {
    if (!confirm("هل أنت متأكد من إنهاء هذه الجلسة؟")) return;
    try {
      const response = await adminApi.fetch(`/api/admin/user-sessions/${id}/revoke`, { method: "POST" });
      if (response.ok) { toast.success("تم إنهاء الجلسة"); queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] }); }
      else { toast.error("فشل في إنهاء الجلسة"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<UserSession>[] = [
    { accessorKey: "userName", header: "المستخدم", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.userName || "مستخدم"}</p><p className="text-[10px] text-muted-foreground">{row.original.userEmail}</p></div> },
    { accessorKey: "ipAddress", header: "عنوان IP", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ipAddress}</span> },
    { accessorKey: "device", header: "الجهاز", cell: ({ row }) => <span className="text-xs font-bold">{row.original.device || "غير معروف"}</span> },
    { accessorKey: "location", header: "الموقع", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{row.original.location || "-"}</span> },
    { accessorKey: "isActive", header: "الحالة", cell: ({ row }) => row.original.isActive ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge> : <Badge variant="secondary" className="font-black text-xs">منتهي</Badge> },
    { accessorKey: "lastActivity", header: "آخر نشاط", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.lastActivity).toLocaleString("ar-EG")}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && row.original.isActive && ( <button onClick={() => handleRevoke(row.original.id)} className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg" title="إنهاء"><XCircle className="h-3.5 w-3.5" /></button> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="جلسات المستخدمين 🖥️" description="مراقبة وإدارة جلسات المستخدمين النشطة." eyebrow="الأمان" badge={summary.totalSessions.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="إجمالي الجلسات" value={summary.totalSessions} icon={Monitor} color="blue" description="جلسة" />
        <AdminStatsCard title="جلسات نشطة" value={summary.activeSessions} icon={Smartphone} color="green" description="جلسة" />
        <AdminStatsCard title="مستخدمون فريدون" value={summary.uniqueUsers} icon={Users} color="purple" description="مستخدم" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={sessions} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد جلسات", description: "لم يتم العثور على أي جلسات نشطة." }} />
      </div>
    </div>
  );
}