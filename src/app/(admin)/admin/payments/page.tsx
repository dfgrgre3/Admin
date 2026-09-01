"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { adminApi } from "@/lib/api/admin-api";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CreditCard,
  Download,
  LayoutDashboard,
  ListOrdered,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";
import { COMMERCE_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { usePaymentRealtime } from "@/hooks/use-admin-realtime";
import type { Payment, PaymentFilters, PaymentSummary, PaymentsResponse } from "./_components/types";
import { PaymentStatsGrid } from "./_components/payment-stats-grid";
import { FiltersBar } from "./_components/filters-bar";
import { PaymentsTable } from "./_components/payments-table";
import { PaymentDetailsDialog } from "./_components/payment-details-dialog";
import { RefundDialog } from "./_components/refund-dialog";
import { BulkRefundDialog } from "./_components/bulk-refund-dialog";
import { TopSubjects } from "./_components/top-subjects";
import { paymentsCSVColumns, formatEGP } from "./_components/utils";

const RevenueTrendChart = dynamic(
  () => import("./_components/revenue-trend-chart").then((m) => m.RevenueTrendChart),
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse rounded-2xl bg-white/5" /> }
);

const RevenueCountBars = dynamic(
  () => import("./_components/revenue-trend-chart").then((m) => m.RevenueCountBars),
  { ssr: false, loading: () => <div className="h-52 w-full animate-pulse rounded-2xl bg-white/5" /> }
);

const MethodsDistribution = dynamic(
  () => import("./_components/methods-distribution").then((m) => m.MethodsDistribution),
  { ssr: false, loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-white/5" /> }
);

const EMPTY_FILTERS: PaymentFilters = {
  search: "",
  status: "all",
  method: "all",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
};

const EMPTY_SUMMARY: PaymentSummary = {
  totalPayments: 0,
  totalRevenue: 0,
  completedCount: 0,
  pendingCount: 0,
  failedCount: 0,
  refundedCount: 0,
  todayRevenue: 0,
  thisMonthRevenue: 0,
  avgOrderValue: 0,
  refundRate: 0,
  successRate: 0,
};

export default function AdminPaymentsPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [filters, setFilters] = React.useState<PaymentFilters>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [detailsPayment, setDetailsPayment] = React.useState<Payment | null>(null);
  const [refundPayment, setRefundPayment] = React.useState<Payment | null>(null);
  const [bulkRefundPayments, setBulkRefundPayments] = React.useState<Payment[]>([]);
  const [selectedPayments, setSelectedPayments] = React.useState<Payment[]>([]);

  const deferredSearch = React.useDeferredValue(filters.search);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "payments", page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (deferredSearch) params.set("search", deferredSearch);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.method !== "all") params.set("method", filters.method);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.minAmount) params.set("minAmount", filters.minAmount);
      if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);

      const response = await adminApi.fetch(`/admin/payments?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      return (await response.json()) as PaymentsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const handleNewPayment = React.useCallback(() => {
    refetch();
    void requestPublicCacheRevalidation(COMMERCE_PUBLIC_CACHE_PATHS).catch(() => {});
    toast.info("دفعة جديدة وصلت!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentRefunded = React.useCallback(() => {
    refetch();
    void requestPublicCacheRevalidation(COMMERCE_PUBLIC_CACHE_PATHS).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isConnected: isWsConnected } = usePaymentRealtime(handleNewPayment, handlePaymentRefunded);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, filters.status, filters.method, filters.from, filters.to, filters.minAmount, filters.maxAmount]);

  const payments = data?.data?.payments || [];
  const summary = data?.data?.summary || EMPTY_SUMMARY;
  const methods = data?.data?.methods || [];
  const dailyRevenue = data?.data?.dailyRevenue || [];
  const topSubjects = data?.data?.topSubjects || [];
  const pagination = data?.data?.pagination;

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.method !== "all") count++;
    if (filters.from || filters.to) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  }, [filters]);

  const handleExport = () => {
    if (!payments.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    exportToCSV(payments, paymentsCSVColumns(), "payments");
    toast.success("تم التصدير بنجاح");
  };

  const handleRefund = async (payment: Payment, amount: number, reason: string) => {
    try {
      const response = await adminApi.fetch("/admin/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          amount,
          reason: reason || "استرداد من قبل المسؤول",
        }),
      });
      if (response.ok) {
        toast.success(`تم استرداد ${formatEGP(amount)} بنجاح`);
        setRefundPayment(null);
        await requestPublicCacheRevalidation(COMMERCE_PUBLIC_CACHE_PATHS);
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في استرداد المبلغ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    }
  };

  const handleBulkRefund = async (paymentsToRefund: Payment[], reason: string) => {
    try {
      const response = await adminApi.fetch("/admin/payments/refund/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIds: paymentsToRefund.map((p) => p.id),
          reason: reason || "استرداد جماعي من قبل المسؤول",
        }),
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(`تم استرداد ${result?.data?.refunded ?? paymentsToRefund.length} معاملة بنجاح`);
        setBulkRefundPayments([]);
        setSelectedPayments([]);
        await requestPublicCacheRevalidation(COMMERCE_PUBLIC_CACHE_PATHS);
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في الاسترداد الجماعي");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    }
  };

  const refundableSelected = selectedPayments.filter((p) => p.status === "COMPLETED");

  const handleBulkRefundOpen = React.useCallback((payments: Payment[]) => {
    setBulkRefundPayments(payments.filter((p) => p.status === "COMPLETED"));
  }, []);

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="إدارة المدفوعات والمعاملات 💳"
        description="مراقبة وإدارة جميع المعاملات المالية، المدفوعات، والاستردادات في المنصة مع تحليلات لحظية."
        eyebrow="المالية"
        icon={CreditCard}
      >
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`gap-1.5 px-3 py-1.5 font-black text-[10px] ${
              isWsConnected
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                : "border-red-500/20 bg-red-500/10 text-red-500"
            }`}
          >
            {isWsConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isWsConnected ? "متصل لحظياً" : "غير متصل"}
          </Badge>
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>
            تصدير CSV
          </AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>
            تحديث
          </AdminButton>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex items-center gap-2 rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary"
          >
            <ListOrdered className="h-4 w-4" />
            المعاملات
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
              {(pagination?.total ?? 0).toLocaleString("ar-EG")}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary"
          >
            <Activity className="h-4 w-4" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Overview ---------------- */}
        <TabsContent value="overview" className="mt-0 space-y-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentStatsGrid summary={summary} dailyRevenue={dailyRevenue} loading={isLoading} />
          </m.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl lg:col-span-2"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">الإيرادات اليومية</h3>
                  <p className="text-xs font-bold text-muted-foreground">
                    آخر 30 يوماً من المعاملات المكتملة
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-black text-emerald-500">
                  {formatEGP(summary?.thisMonthRevenue ?? 0)}
                </div>
              </div>
              <RevenueTrendChart data={dailyRevenue} />
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl"
            >
              <div className="mb-4">
                <h3 className="text-lg font-black">طرق الدفع</h3>
                <p className="text-xs font-bold text-muted-foreground">توزيع المعاملات المكتملة</p>
              </div>
              <MethodsDistribution methods={methods} />
            </m.div>
          </div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl"
          >
            <div className="mb-4">
              <h3 className="text-lg font-black">الأكثر مبيعاً</h3>
              <p className="text-xs font-bold text-muted-foreground">أفضل المواد والدورات من حيث عدد المعاملات</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TopSubjects subjects={topSubjects} />
              <div className="hidden md:block">
                <RevenueCountBars data={dailyRevenue} />
                <p className="mt-2 text-center text-[10px] font-bold text-muted-foreground">
                  عدد المعاملات اليومية (آخر 30 يوم)
                </p>
              </div>
            </div>
          </m.div>
        </TabsContent>

        {/* ---------------- Transactions ---------------- */}
        <TabsContent value="transactions" className="mt-0 space-y-6">
          <FiltersBar
            filters={filters}
            methods={methods}
            onChange={(f) => setFilters(f)}
            activeCount={activeFilterCount}
          />
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rpg-glass-light dark:rpg-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
          >
            <PaymentsTable
              payments={payments}
              loading={isLoading}
              totalRows={pagination?.total || 0}
              pageCount={pagination?.totalPages || 1}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
              onRefresh={() => refetch()}
              onExport={handleExport}
              onView={setDetailsPayment}
              onRefund={setRefundPayment}
              selectedPayments={selectedPayments}
              onSelectionChange={setSelectedPayments}
              canRefundSelected={refundableSelected.length > 0}
              onBulkRefund={handleBulkRefundOpen}
            />
          </m.div>
        </TabsContent>

        {/* ---------------- Analytics ---------------- */}
        <TabsContent value="analytics" className="mt-0 space-y-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-lg font-black">منحنى الإيرادات</h3>
                <p className="text-xs font-bold text-muted-foreground">الإيرادات المؤكدة خلال آخر 30 يوماً</p>
              </div>
              <RevenueTrendChart data={dailyRevenue} height={340} />
            </div>
            <div className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-lg font-black">حجم المعاملات</h3>
                <p className="text-xs font-bold text-muted-foreground">عدد المعاملات المكتملة يومياً</p>
              </div>
              <RevenueCountBars data={dailyRevenue} height={340} />
            </div>
          </m.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-lg font-black">توزيع طرق الدفع</h3>
                <p className="text-xs font-bold text-muted-foreground">حصة كل طريقة من إجمالي الإيرادات</p>
              </div>
              <MethodsDistribution methods={methods} height={300} />
            </div>
            <div className="rpg-glass-light dark:rpg-glass rounded-[2rem] border border-white/10 p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-lg font-black">الأكثر مبيعاً</h3>
                <p className="text-xs font-bold text-muted-foreground">تصنيف المواد حسب المعاملات والإيرادات</p>
              </div>
              <TopSubjects subjects={topSubjects} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PaymentDetailsDialog
        payment={detailsPayment}
        open={!!detailsPayment}
        onOpenChange={(open) => !open && setDetailsPayment(null)}
        onRefund={(p) => setRefundPayment(p)}
      />
      <RefundDialog
        payment={refundPayment}
        open={!!refundPayment}
        onOpenChange={(open) => !open && setRefundPayment(null)}
        onConfirm={handleRefund}
      />
      <BulkRefundDialog
        payments={bulkRefundPayments}
        open={bulkRefundPayments.length > 0}
        onOpenChange={(open) => !open && setBulkRefundPayments([])}
        onConfirm={handleBulkRefund}
      />
    </div>
  );
}
