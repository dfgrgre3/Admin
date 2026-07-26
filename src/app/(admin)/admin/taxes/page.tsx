"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Landmark, Search, Download, RefreshCw, Plus, Edit, Trash2, Percent, FileText, DollarSign, Calculator,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: "PERCENTAGE" | "FIXED";
  country: string;
  region: string | null;
  isActive: boolean;
  appliesTo: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaxResponse {
  data: { taxRates: TaxRate[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalRates: number; activeRates: number; countries: number } };
}

export default function AdminTaxesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.TAXES_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "taxes", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/taxes?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tax rates");
      return (await response.json()) as TaxResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const taxRates = data?.data?.taxRates || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalRates: 0, activeRates: 0, countries: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/taxes/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف معدل الضريبة"); queryClient.invalidateQueries({ queryKey: ["admin", "taxes"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const columns: ColumnDef<TaxRate>[] = [
    { accessorKey: "name", header: "الاسم", cell: ({ row }) => <span className="font-black text-xs">{row.original.name}</span> },
    { accessorKey: "rate", header: "المعدل", cell: ({ row }) => <div className="flex items-center gap-2"><Percent className="h-3 w-3 text-primary" /><span className="font-black text-xs">{row.original.rate}%</span></div> },
    { accessorKey: "country", header: "الدولة", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.country}</Badge> },
    { accessorKey: "region", header: "المنطقة", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{row.original.region || "الكل"}</span> },
    { accessorKey: "isActive", header: "الحالة", cell: ({ row }) => row.original.isActive ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge> : <Badge variant="secondary" className="font-black text-xs">غير نشط</Badge> },
    { accessorKey: "createdAt", header: "تاريخ الإنشاء", cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("ar-EG")}</span> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && ( <> <button onClick={() => router.push(`/admin/taxes/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل"><Edit className="h-3.5 w-3.5" /></button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="إدارة الضرائب 🏛️" description="إدارة معدلات الضرائب والرسوم المطبقة على المنصة." eyebrow="المالية" badge={summary.totalRates.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/taxes/create")}>إضافة معدل ضريبة</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="معدلات الضرائب" value={summary.totalRates} icon={Calculator} color="blue" description="معدل ضريبة" />
        <AdminStatsCard title="معدلات نشطة" value={summary.activeRates} icon={Percent} color="green" description="معدل نشط" />
        <AdminStatsCard title="الدول المشمولة" value={summary.countries} icon={Landmark} color="amber" description="دولة" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={taxRates} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد معدلات ضريبية", description: "لم يتم إضافة أي معدلات ضريبية بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف معدل الضريبة" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}