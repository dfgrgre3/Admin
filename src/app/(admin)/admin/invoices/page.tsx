"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Download,
  Wallet,
  CheckCircle2,
  Clock,
  Receipt,
  User as UserIcon,
  CreditCard,
  Calendar,
  Hash,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { m } from "framer-motion";
import { billingApi, type Invoice } from "@/lib/api/billing-api";

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  completed: "مدفوعة",
  failed: "فشلت",
  refunded: "مستردة",
  cancelled: "ملغاة",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const methodLabels: Record<string, string> = {
  PAYMOB: "بطاقة / محفظة إلكترونية",
  WALLET: "المحفظة الداخلية",
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "completed" | "pending" | "failed">("all");
  const [detailsInvoice, setDetailsInvoice] = React.useState<Invoice | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "invoices", page, search, statusFilter],
    queryFn: () =>
      billingApi.listInvoices({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const invoices = data?.invoices ?? [];
  const summary = data?.summary;

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "الفاتورة",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-transform hover:scale-105">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-sm font-mono" dir="ltr">
                {invoice.invoiceNumber}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60 mt-0.5">
                {invoice.planName || "بدون خطة"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "user",
      header: "المستخدم",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm">{invoice.user?.name || "—"}</span>
            <span className="text-[11px] text-muted-foreground" dir="ltr">
              {invoice.user?.email}
            </span>
          </div>
        );
      },
    },
    {
      id: "amount",
      header: "المبلغ",
      cell: ({ row }) => {
        const p = row.original.payment;
        return (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="font-black text-lg">{Number(p?.amount ?? 0).toLocaleString("ar-EG")}</span>
            <span className="text-[10px] font-bold text-muted-foreground">{p?.currency}</span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.original.payment?.status || "pending";
        return (
          <Badge
            variant="outline"
            className={`font-black text-xs px-3 py-1 rounded-lg ${statusColors[status] || "bg-gray-500/10 text-gray-500"}`}
          >
            {statusLabels[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإصدار",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "التحكم",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onView={(invoice) => setDetailsInvoice(invoice)}
          extraActions={[
            {
              icon: Download,
              label: "تنزيل PDF",
              onClick: (invoice) => {
                if (invoice.pdfUrl) window.open(invoice.pdfUrl, "_blank", "noopener,noreferrer");
              },
              disabled: !row.original.pdfUrl,
              disabledReason: "لا يوجد ملف PDF لهذه الفاتورة",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="الاشتراك والفواتير 🧾"
        eyebrow="الإدارة المالية"
        description="متابعة الفواتير الصادرة للطلاب، حالة السداد، وربطها بخطط الاشتراك والمدفوعات."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          title="إجمالي الفواتير"
          value={summary?.totalInvoices ?? 0}
          icon={FileText}
          color="blue"
          description="فاتورة صادرة"
        />
        <AdminStatsCard
          title="إجمالي المحصّل"
          value={`${(summary?.totalAmount ?? 0).toLocaleString("ar-EG")} ج.م`}
          icon={Wallet}
          color="green"
          description="من الفواتير المدفوعة"
        />
        <AdminStatsCard
          title="مدفوعة"
          value={summary?.paidCount ?? 0}
          icon={CheckCircle2}
          color="green"
          description="فاتورة مكتملة السداد"
        />
        <AdminStatsCard
          title="قيد الانتظار / فشلت"
          value={(summary?.pendingCount ?? 0) + (summary?.failedCount ?? 0)}
          icon={Clock}
          color="amber"
          description="بحاجة لمتابعة"
        />
      </div>

      {/* Table */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-glass-light dark:rpg-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
      >
        <AdminDataTable
          columns={columns}
          data={invoices}
          loading={isLoading}
          searchKey="invoiceNumber"
          searchPlaceholder="ابحث برقم الفاتورة..."
          actions={{
            onRefresh: () => queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] }),
          }}
          serverSide
          pageCount={data?.pagination?.totalPages ?? 1}
          totalRows={data?.pagination?.total ?? 0}
          onPageChange={(p: number) => setPage(p)}
          toolbar={
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="ابحث برقم الفاتورة أو اسم المستخدم..."
                  className="h-10 w-72 rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold"
                />
              </div>
              <div className="flex bg-accent/10 p-1 rounded-xl border border-border gap-1">
                {(["all", "completed", "pending", "failed"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setStatusFilter(filter);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      statusFilter === filter
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "all"
                      ? "الكل"
                      : filter === "completed"
                      ? "مدفوعة"
                      : filter === "pending"
                      ? "قيد الانتظار"
                      : "فشلت"}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </m.div>

      {/* Invoice Details Dialog */}
      <Dialog open={!!detailsInvoice} onOpenChange={(open) => !open && setDetailsInvoice(null)}>
        <DialogContent className="max-w-xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
          {detailsInvoice && (
            <div className="p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <Receipt className="w-7 h-7 text-orange-500" />
                  تفاصيل الفاتورة
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground font-mono" dir="ltr">
                  {detailsInvoice.invoiceNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <UserIcon className="w-3 h-3" /> المستخدم
                  </p>
                  <p className="font-black text-sm">{detailsInvoice.user?.name || "—"}</p>
                  <p className="text-[11px] text-muted-foreground" dir="ltr">
                    {detailsInvoice.user?.email}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Wallet className="w-3 h-3" /> المبلغ
                  </p>
                  <p className="font-black text-lg">
                    {Number(detailsInvoice.payment?.amount ?? 0).toLocaleString("ar-EG")}{" "}
                    <span className="text-xs text-muted-foreground">{detailsInvoice.payment?.currency}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <CreditCard className="w-3 h-3" /> طريقة الدفع
                  </p>
                  <p className="font-black text-sm">
                    {methodLabels[detailsInvoice.payment?.method || ""] || detailsInvoice.payment?.method || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Hash className="w-3 h-3" /> رقم العملية
                  </p>
                  <p className="font-mono font-bold text-xs truncate" dir="ltr">
                    {detailsInvoice.payment?.reference || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Calendar className="w-3 h-3" /> تاريخ الإصدار
                  </p>
                  <p className="font-black text-sm">
                    {new Date(detailsInvoice.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">الحالة</p>
                  <Badge
                    variant="outline"
                    className={`font-black text-xs px-3 py-1 rounded-lg ${
                      statusColors[detailsInvoice.payment?.status || "pending"]
                    }`}
                  >
                    {statusLabels[detailsInvoice.payment?.status || "pending"]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {detailsInvoice.pdfUrl && (
                  <AdminButton
                    icon={Download}
                    onClick={() => window.open(detailsInvoice.pdfUrl, "_blank", "noopener,noreferrer")}
                  >
                    تنزيل PDF
                  </AdminButton>
                )}
                <AdminButton variant="outline" onClick={() => setDetailsInvoice(null)}>
                  إغلاق
                </AdminButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
