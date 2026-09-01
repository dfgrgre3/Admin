import { formatCurrency, formatNumber } from "@/lib/utils";
import type { DailyRevenuePoint, MethodStat, Payment } from "./types";

export function formatEGP(amount: number | null | undefined): string {
  return formatCurrency(amount ?? 0, "EGP");
}

export function formatCompact(value: number | null | undefined): string {
  const v = value ?? 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return formatNumber(v);
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTimeFull(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortId(id: string | null | undefined, length = 8): string {
  if (!id) return "-";
  return id.length > length ? `${id.slice(0, length)}...` : id;
}

export function revenueChangePercent(
  dailyRevenue: DailyRevenuePoint[] | undefined
): number | null {
  if (!dailyRevenue || dailyRevenue.length < 2) return null;
  const total = dailyRevenue.reduce((sum, p) => sum + p.revenue, 0);
  const firstHalf = dailyRevenue.slice(0, Math.floor(dailyRevenue.length / 2));
  const secondHalf = dailyRevenue.slice(Math.floor(dailyRevenue.length / 2));
  const firstTotal = firstHalf.reduce((sum, p) => sum + p.revenue, 0);
  const secondTotal = secondHalf.reduce((sum, p) => sum + p.revenue, 0);
  if (firstTotal === 0) return null;
  return ((secondTotal - firstTotal) / firstTotal) * 100;
}

export function countChangePercent(
  dailyRevenue: DailyRevenuePoint[] | undefined
): number | null {
  if (!dailyRevenue || dailyRevenue.length < 2) return null;
  const firstHalf = dailyRevenue.slice(0, Math.floor(dailyRevenue.length / 2));
  const secondHalf = dailyRevenue.slice(Math.floor(dailyRevenue.length / 2));
  const firstTotal = firstHalf.reduce((sum, p) => sum + p.count, 0);
  const secondTotal = secondHalf.reduce((sum, p) => sum + p.count, 0);
  if (firstTotal === 0) return null;
  return ((secondTotal - firstTotal) / firstTotal) * 100;
}

export function methodsTotal(methods: MethodStat[] | undefined): number {
  return (methods || []).reduce((sum, m) => sum + m.total, 0);
}

export function paymentsCSVColumns() {
  return [
    { header: "رقم العملية", accessor: (p: Payment) => p.transactionId || p.id },
    {
      header: "المستخدم",
      accessor: (p: Payment) => p.user?.name || p.user?.email || "غير معروف",
    },
    { header: "المبلغ", accessor: (p: Payment) => `${p.amount} ${p.currency}` },
    {
      header: "الحالة",
      accessor: (p: Payment) =>
        ({
          PENDING: "قيد المعالجة",
          COMPLETED: "مكتملة",
          FAILED: "فاشلة",
          REFUNDED: "مستردة",
          CANCELLED: "ملغاة",
        })[p.status] || p.status,
    },
    { header: "طريقة الدفع", accessor: (p: Payment) => p.method || "غير محدد" },
    {
      header: "المادة/الدورة",
      accessor: (p: Payment) => p.subject?.nameAr || p.subject?.name || "-",
    },
    {
      header: "التاريخ",
      accessor: (p: Payment) =>
        new Date(p.createdAt).toLocaleDateString("ar-EG"),
    },
  ];
}
