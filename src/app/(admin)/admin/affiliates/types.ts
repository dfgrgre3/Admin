import { Affiliate, AffiliateReferral } from "@/lib/api/billing-api";

export const statusOptions = [
  { value: "ACTIVE", label: "نشط" },
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "SUSPENDED", label: "موقوف" },
] as const;

export const tierOptions = [
  { value: "BRONZE", label: "برونزي" },
  { value: "SILVER", label: "فضي" },
  { value: "GOLD", label: "ذهبي" },
  { value: "PLATINUM", label: "بلاتيني" },
] as const;

export const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "نشط", className: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "قيد الانتظار", className: "bg-amber-100 text-amber-700" },
  SUSPENDED: { label: "موقوف", className: "bg-red-100 text-red-700" },
  PAID: { label: "مدفوع", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "ملغي", className: "bg-muted text-muted-foreground" },
};

export const tierLabels: Record<string, string> = {
  BRONZE: "برونزي",
  SILVER: "فضي",
  GOLD: "ذهبي",
  PLATINUM: "بلاتيني",
};

export type { Affiliate, AffiliateReferral };
