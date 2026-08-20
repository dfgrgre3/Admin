"use client";

import * as React from "react";
import { adminApi } from "@/lib/api/admin-api";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Download,
  DollarSign,
  TrendingUp,
  Receipt,
  Banknote,
  Eye,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import { toast } from "sonner";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

interface OrderItem {
  id: string;
  title: string;
  type: "COURSE" | "BUNDLE" | "SUBSCRIPTION" | "BOOK";
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "PROCESSING";
  total: number;
  currency: string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  items: OrderItem[];
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  couponCode?: string | null;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  data: {
    orders: Order[];
    summary: {
      totalOrders: number;
      completedCount: number;
      pendingCount: number;
      cancelledCount: number;
      totalRevenue: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const statusConfig: Record<Order["status"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  COMPLETED: { label: "مكتمل", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  PENDING: { label: "معلق", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  PROCESSING: { label: "قيد المعالجة", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  CANCELLED: { label: "ملغي", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  REFUNDED: { label: "مسترد", icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const deferredSearch = React.useDeferredValue(search);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "orders", page, limit, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await adminApi.fetch(`/admin/orders?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return (await response.json()) as OrdersResponse;
    },
  });

  React.useEffect(() => { setPage(1); }, [deferredSearch, statusFilter]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      const response = await adminApi.fetch(`/admin/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Failed to update order status");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("فشل تحديث حالة الطلب"),
  });

  const orders = data?.data?.orders || [];
  const summary = data?.data?.summary || {
    totalOrders: 0, completedCount: 0, pendingCount: 0, cancelledCount: 0, totalRevenue: 0,
  };
  const pagination = data?.data?.pagination;

  const handleExport = () => {
    if (!orders.length) { toast.error("لا توجد بيانات للتصدير"); return; }
    const cols: ExportColumn<Order>[] = [
      { header: "رقم الطلب", accessor: (o) => o.orderNumber || o.id.slice(0, 8) },
      { header: "العميل", accessor: (o) => o.user?.name || o.user?.email || "غير معروف" },
      { header: "الإجمالي", accessor: (o) => `${o.total} ${o.currency}` },
      { header: "الحالة", accessor: (o) => statusConfig[o.status]?.label || o.status },
      { header: "المنتجات", accessor: (o) => o.items.map(i => i.title).join(", ") },
      { header: "طريقة الدفع", accessor: (o) => o.paymentMethod || "-" },
      { header: "كود خصم", accessor: (o) => o.couponCode || "-" },
      { header: "تاريخ الطلب", accessor: (o) => new Date(o.createdAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(orders, cols, "orders");
    toast.success("تم التصدير بنجاح");
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "رقم الطلب",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary/10 text-primary border border-primary/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono font-black text-xs tracking-tight">
                #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60">
                {new Date(order.createdAt).toLocaleDateString("ar-EG")} ·{" "}
                {new Date(order.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user",
      header: "العميل",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-primary/20">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback className="font-bold bg-primary/10 text-primary text-[10px]">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-xs">{user?.name || "مستخدم"}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">
                {user?.email || ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: "المنتجات",
      cell: ({ row }) => {
        const items = row.original.items;
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {items.slice(0, 2).map((item) => (
              <Badge key={item.id} variant="outline" className="text-[9px] font-black truncate max-w-[120px]">
                {item.title}
              </Badge>
            ))}
            {items.length > 2 && (
              <Badge variant="secondary" className="text-[9px] font-black">
                +{items.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: "الإجمالي",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <span className="font-black text-emerald-500 text-sm flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              {order.total.toLocaleString()} {order.currency}
            </span>
            {order.discountAmount ? (
              <p className="text-[10px] text-red-400/70 mt-0.5">خصم: -{order.discountAmount.toLocaleString()}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status];
        const Icon = cfg.icon;
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedOrder(order); setDetailsDialogOpen(true); }}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="عرض تفاصيل الطلب"
            >
              <Eye className="h-4 w-4" />
            </button>
            {order.status === "PENDING" && (
              <button
                onClick={() => updateStatusMutation.mutate({ id: order.id, status: "CANCELLED" })}
                disabled={updateStatusMutation.isPending}
                className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        eyebrow="الإدارة المالية"
        title="إدارة الطلبات"
        description="مراقبة وإدارة جميع طلبات الشراء لمنتجات المنصة والاشتراكات."
        badge={summary.totalOrders ? String(summary.totalOrders) : undefined}
      >
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>
            تصدير CSV
          </AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AdminStatsCard title="إجمالي الطلبات" value={summary.totalOrders} icon={ShoppingCart} color="blue" description="طلب مسجل" />
        <AdminStatsCard title="إجمالي الإيرادات" value={summary.totalRevenue} icon={DollarSign} color="green" description="ج.م" />
        <AdminStatsCard title="مكتملة" value={summary.completedCount} icon={CheckCircle} color="green" description="طلب ناجح" />
        <AdminStatsCard title="معلقة" value={summary.pendingCount} icon={Clock} color="yellow" description="تنتظر المعالجة" />
        <AdminStatsCard title="ملغية" value={summary.cancelledCount} icon={XCircle} color="red" description="تم الإلغاء" />
      </div>

      {/* Table */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rpg-glass-light dark:rpg-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
      >
        <AdminDataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          serverSide
          virtualized
          totalRows={pagination?.total || 0}
          pageCount={pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث برقم الطلب أو العميل..."
                  className="h-10 w-64 rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-10 rounded-xl bg-accent/10 border-border text-xs font-black">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-bold">كل الحالات</SelectItem>
                  <SelectItem value="COMPLETED" className="font-bold text-emerald-500">مكتمل</SelectItem>
                  <SelectItem value="PENDING" className="font-bold text-amber-500">معلق</SelectItem>
                  <SelectItem value="PROCESSING" className="font-bold text-blue-500">قيد المعالجة</SelectItem>
                  <SelectItem value="CANCELLED" className="font-bold text-red-500">ملغي</SelectItem>
                  <SelectItem value="REFUNDED" className="font-bold text-purple-500">مسترد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </m.div>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              تفاصيل الطلب #{selectedOrder?.orderNumber || selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && `طلب مقدم من ${selectedOrder.user?.name || selectedOrder.user?.email || "مستخدم غير معروف"}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-bold mb-1">الحالة</p>
                  <div className={`inline-flex items-center gap-1.5 ${statusConfig[selectedOrder.status].color}`}>
                    {React.createElement(statusConfig[selectedOrder.status].icon, { className: "w-3.5 h-3.5" })}
                    <span className="font-black text-xs">{statusConfig[selectedOrder.status].label}</span>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-bold mb-1">الإجمالي</p>
                  <p className="font-black text-emerald-500">{selectedOrder.total.toLocaleString()} {selectedOrder.currency}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-bold mb-1">طريقة الدفع</p>
                  <p className="font-bold">{selectedOrder.paymentMethod || "غير محدد"}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-bold mb-1">كود الخصم</p>
                  <p className="font-bold font-mono">{selectedOrder.couponCode || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground mb-2 uppercase tracking-widest">المنتجات</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div>
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">{item.type}</p>
                      </div>
                      <span className="font-black text-sm text-emerald-500">{item.price.toLocaleString()} {selectedOrder.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => { setDetailsDialogOpen(false); setSelectedOrder(null); }}
              className="px-4 py-2 text-sm font-bold rounded-xl border border-border hover:bg-accent transition-colors"
            >
              إغلاق
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
