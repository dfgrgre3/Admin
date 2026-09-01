import * as React from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Ban } from "lucide-react";
import type { PaymentStatus } from "./types";

export const statusConfig: Record<
  PaymentStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string; chartColor: string }
> = {
  PENDING: {
    label: "قيد المعالجة",
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    chartColor: "#f59e0b",
  },
  COMPLETED: {
    label: "مكتملة",
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    chartColor: "#10b981",
  },
  FAILED: {
    label: "فاشلة",
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
    chartColor: "#ef4444",
  },
  REFUNDED: {
    label: "مستردة",
    icon: AlertCircle,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    chartColor: "#a855f7",
  },
  CANCELLED: {
    label: "ملغاة",
    icon: Ban,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10 border-slate-500/20",
    chartColor: "#64748b",
  },
};

export const statusList: PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

export const methodLabels: Record<string, string> = {
  PAYMOB: "Paymob",
  WALLET: "المحفظة",
  CASH: "كاش",
  CARD: "بطاقة",
  BANK_TRANSFER: "تحويل بنكي",
  VODAFONE_CASH: "فودافون كاش",
  INSTAPAY: "إنستاباي",
};

export const methodChartColors: Record<string, string> = {
  PAYMOB: "#6366f1",
  WALLET: "#10b981",
  CASH: "#f59e0b",
  CARD: "#0ea5e9",
  BANK_TRANSFER: "#a855f7",
  VODAFONE_CASH: "#ef4444",
  INSTAPAY: "#14b8a6",
};

export const methodColorPalette = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#f43f5e",
];

export const statusTabItems = [
  { value: "all", label: "الكل" },
  { value: "COMPLETED", label: "مكتملة" },
  { value: "PENDING", label: "قيد المعالجة" },
  { value: "FAILED", label: "فاشلة" },
  { value: "REFUNDED", label: "مستردة" },
];

export function getMethodLabel(method: string | null): string {
  if (!method) return "غير محدد";
  return methodLabels[method] || method;
}

export function getMethodColor(method: string, index: number): string {
  const color = methodChartColors[method];
  if (color) return color;
  return methodColorPalette[index % methodColorPalette.length] ?? "#6366f1";
}
