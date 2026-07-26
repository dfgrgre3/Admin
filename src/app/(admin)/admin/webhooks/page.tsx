"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Webhook, Search, RefreshCw, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Send,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

interface WebhooksResponse {
  data: { webhooks: WebhookRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number }; summary: { totalWebhooks: number; activeWebhooks: number; totalTriggers: number } };
}

export default function AdminWebhooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const deferredSearch = React.useDeferredValue(querySearch);
  React.useEffect(() => { setPage(1); }, [deferredSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "webhooks", page, limit, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await adminApi.fetch(`/api/admin/webhooks?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch webhooks");
      return (await response.json()) as WebhooksResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const webhooks = data?.data?.webhooks || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || { totalWebhooks: 0, activeWebhooks: 0, totalTriggers: 0 };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`/api/admin/webhooks/${deleteDialog.id}`, { method: "DELETE" });
      if (response.ok) { toast.success("تم حذف الويبهوك"); queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] }); }
      else { const err = await response.json(); toast.error(err.error || "فشل في الحذف"); }
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setDeleteDialog({ open: false, id: null }); }
  };

  const handleTest = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/webhooks/${id}/test`, { method: "POST" });
      if (response.ok) { toast.success("تم إرسال اختبار بنجاح"); }
      else { toast.error("فشل في الاختبار"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const columns: ColumnDef<WebhookRecord>[] = [
    { accessorKey: "name", header: "الويبهوك", cell: ({ row }) => ( <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20"><Webhook className="h-5 w-5 text-primary" /></div><div><p className="font-black text-xs">{row.original.name}</p><p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{row.original.url}</p></div></div> ) },
    { accessorKey: "events", header: "الأحداث", cell: ({ row }) => <Badge variant="outline" className="font-black text-xs">{row.original.events.length} حدث</Badge> },
    { accessorKey: "successCount", header: "النجاح", cell: ({ row }) => <span className="font-black text-xs text-green-500">{row.original.successCount}</span> },
    { accessorKey: "failureCount", header: "الفشل", cell: ({ row }) => <span className="font-black text-xs text-red-500">{row.original.failureCount}</span> },
    { accessorKey: "isActive", header: "الحالة", cell: ({ row }) => row.original.isActive ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge> : <Badge variant="secondary" className="font-black text-xs">معطل</Badge> },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => ( <div className="flex items-center gap-1"> {canManage && ( <> <button onClick={() => handleTest(row.original.id)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="اختبار"><Send className="h-3.5 w-3.5" /></button> <button onClick={() => router.push(`/admin/webhooks/${row.original.id}/edit`)} className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" title="تعديل"><Edit className="h-3.5 w-3.5" /></button> <button onClick={() => setDeleteDialog({ open: true, id: row.original.id })} className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button> </> )} </div> ) },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="الويبهوك 🔗" description="إدارة ويبهوكات الإشعارات والتكاملات." eyebrow="التكاملات" badge={summary.totalWebhooks.toLocaleString()}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={() => router.push("/admin/webhooks/create")}>إضافة ويبهوك</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard title="إجمالي الويبهوكات" value={summary.totalWebhooks} icon={Webhook} color="blue" description="ويبهوك" />
        <AdminStatsCard title="ويبهوكات نشطة" value={summary.activeWebhooks} icon={CheckCircle} color="green" description="ويبهوك" />
        <AdminStatsCard title="إجمالي التشغيلات" value={summary.totalTriggers} icon={Send} color="purple" description="تشغيل" />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable columns={columns} data={webhooks} loading={isLoading} serverSide
          totalRows={pagination?.total || 0} pageCount={pagination?.totalPages || 1}
          currentPage={page} onPageChange={setPage} onPageSizeChange={setLimit} pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={<div className="relative group w-full sm:w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setQuerySearch(e.target.value); }} placeholder="ابحث..." className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right" dir="rtl" /></div>}
          emptyMessage={{ title: "لا توجد ويبهوكات", description: "لم يتم إنشاء أي ويبهوكات بعد." }} />
      </div>

      <AdminConfirm open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الويبهوك" description="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف" cancelText="إلغاء" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}