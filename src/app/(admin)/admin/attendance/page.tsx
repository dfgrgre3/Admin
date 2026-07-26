"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Search, Download, RefreshCw, Eye, Users, Clock, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Attendance {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  sessionId: string;
  sessionTitle: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  checkInTime: string | null;
  checkOutTime: string | null;
  duration: number;
  date: string;
}

interface AttendanceResponse {
  data: { records: Attendance[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalRecords: number; presentCount: number; absentCount: number; lateCount: number; excusedCount: number; averageAttendance: number } };
}

const attendanceStatusConfig: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "حاضر", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  ABSENT: { label: "غائب", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  LATE: { label: "متأخر", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  EXCUSED: { label: "معذور", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
};

export default function AdminAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get("status") || "all");

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "attendance", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/api/admin/attendance?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return (await response.json()) as AttendanceResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const records = data?.data?.records || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalRecords: 0, presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0, averageAttendance: 0 };

  const handleExport = () => {
    if (!records.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<Attendance>[] = [
      { header: "الطالب", accessor: (r) => r.userName || r.userEmail },
      { header: "الجلسة", accessor: (r) => r.sessionTitle },
      { header: "الحالة", accessor: (r) => attendanceStatusConfig[r.status]?.label || r.status },
      { header: "التاريخ", accessor: (r) => new Date(r.date).toLocaleDateString("ar-EG") },
      { header: "المدة", accessor: (r) => `${r.duration} دقيقة` },
    ];
    exportToCSV(records, cols, "attendance");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<Attendance>[] = [
    { accessorKey: "userName", header: "الطالب", cell: ({ row }) => <div><p className="font-black text-xs">{row.original.userName || "طالب"}</p><p className="text-[10px] text-muted-foreground">{row.original.userEmail}</p></div> },
    { accessorKey: "sessionTitle", header: "الجلسة", cell: ({ row }) => <span className="font-black text-xs">{row.original.sessionTitle}</span> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => { const c = attendanceStatusConfig[row.original.status]; return <Badge variant="outline" className={`font-black text-xs ${c?.color || ""}`}>{c?.label || row.original.status}</Badge>; } },
    { accessorKey: "date", header: "التاريخ", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.date).toLocaleDateString("ar-EG")}</span> },
    { accessorKey: "duration", header: "المدة", cell: ({ row }) => <span className="font-bold text-xs">{row.original.duration} دقيقة</span> },
    { accessorKey: "checkInTime", header: "وقت الحضور", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{row.original.checkInTime ? new Date(row.original.checkInTime).toLocaleTimeString("ar-EG") : "-"}</span> },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة الحضور 📋" description="تتبع حضور وغياب الطلاب في الجلسات التعليمية." eyebrow="التعليم" badge={summary.totalRecords.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>تصدير CSV</AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي السجلات" value={summary.totalRecords} icon={CalendarCheck} color="blue" description="سجل حضور" />
        <AdminStatsCard title="حاضر" value={summary.presentCount} icon={CheckCircle} color="green" description="طالب حاضر" />
        <AdminStatsCard title="غائب" value={summary.absentCount} icon={XCircle} color="red" description="طالب غائب" />
        <AdminStatsCard title="متأخر" value={summary.lateCount} icon={Clock} color="amber" description="طالب متأخر" />
        <AdminStatsCard title="نسبة الحضور" value={`${summary.averageAttendance}%`} icon={Users} color="purple" description="متوسط الحضور" />
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary">الكل</TabsTrigger>
          <TabsTrigger value="PRESENT" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white">حاضر</TabsTrigger>
          <TabsTrigger value="ABSENT" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white">غائب</TabsTrigger>
          <TabsTrigger value="LATE" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-amber-500 data-[state=active]:text-white">متأخر</TabsTrigger>
          <TabsTrigger value="EXCUSED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-blue-500 data-[state=active]:text-white">معذور</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={records} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد سجلات حضور", description: "لم يتم العثور على أي سجلات حضور." }} />
      </div>
    </div>
  );
}