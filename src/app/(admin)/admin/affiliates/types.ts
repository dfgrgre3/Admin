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

export const referralStatusOptions = [
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "PAID", label: "مدفوع" },
  { value: "CANCELLED", label: "ملغي" },
] as const;

export const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "نشط", className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  PENDING: { label: "قيد الانتظار", className: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  SUSPENDED: { label: "موقوف", className: "bg-red-500/10 text-red-500 border border-red-500/20" },
  PAID: { label: "مدفوع", className: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
  CANCELLED: { label: "ملغي", className: "bg-muted text-muted-foreground border border-border" },
};

export const tierLabels: Record<string, string> = {
  BRONZE: "برونزي",
  SILVER: "فضي",
  GOLD: "ذهبي",
  PLATINUM: "بلاتيني",
};

export const tierBadgeClasses: Record<string, string> = {
  BRONZE: "bg-amber-700/10 text-amber-700 border border-amber-700/20",
  SILVER: "bg-slate-400/10 text-slate-400 border border-slate-400/20",
  GOLD: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  PLATINUM: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
};

/** قيمة العمولة المتبقية غير المسدّدة للمسوق. */
export function getAffiliateRemaining(a: Affiliate): number {
  return Math.max(0, a.totalEarned - a.totalPaid);
}

export type { Affiliate, AffiliateReferral };
