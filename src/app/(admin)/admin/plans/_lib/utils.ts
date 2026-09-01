import type {
  PlanFormValues,
  PlanStats,
  SubscriptionPlan,
} from "./types";

// توحيد شكل الاستجابة القادمة من الـ API
export function parsePlanList(json: unknown): SubscriptionPlan[] {
  if (Array.isArray(json)) return json as SubscriptionPlan[];
  if (json && typeof json === "object") {
    const data = (json as { data?: unknown }).data ?? json;
    if (Array.isArray(data)) return data as SubscriptionPlan[];
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.plans)) return obj.plans as SubscriptionPlan[];
      if (Array.isArray(obj.items)) return obj.items as SubscriptionPlan[];
    }
  }
  return [];
}

// تنسيق السعر بالعملة
export function formatPrice(price: number, currency = "EGP"): string {
  const value = price.toLocaleString("ar-EG");
  return currency ? `${value} ${currency}` : value;
}

// تنسيق التاريخ
export function formatPlanDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

// هل الخطة ضمن مجموعة (مرتبطة بخطة أخرى)؟
export function isPlanGrouped(plan: SubscriptionPlan): boolean {
  return Boolean(plan.groupKey && plan.groupKey !== plan.id);
}

// حساب الإحصائيات من قائمة الخطط
export function computePlanStats(plans: SubscriptionPlan[]): PlanStats {
  const prices = plans.map((p) => p.price);
  const byInterval: PlanStats["byInterval"] = { MONTHLY: 0, YEARLY: 0, FOREVER: 0 };

  for (const p of plans) {
    if (p.interval in byInterval) byInterval[p.interval]++;
  }

  const groups = new Set(plans.map((p) => p.groupKey || p.id));

  const totalPrice = prices.reduce((sum, price) => sum + price, 0);

  return {
    total: plans.length,
    active: plans.filter((p) => p.isActive).length,
    inactive: plans.filter((p) => !p.isActive).length,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    avgPrice: prices.length ? Math.round((totalPrice / prices.length) * 100) / 100 : 0,
    byInterval,
    groupsCount: groups.size,
  };
}

// تحويل قيم النموذج إلى payload للإرسال
export function toPlanPayload(values: PlanFormValues): Record<string, unknown> {
  return {
    name: values.name,
    nameAr: values.nameAr,
    description: values.description || "",
    price: values.price,
    currency: values.currency,
    interval: values.interval,
    isActive: values.isActive,
    features: values.features
      ? values.features.split("\n").map((f) => f.trim()).filter(Boolean)
      : [],
    groupKey: values.groupKey || "",
  };
}

// تحويل قيم النموذج إلى نص (للتعديل)
export function featuresToString(features?: string[]): string {
  return Array.isArray(features) ? features.join("\n") : "";
}

// تصدير الخطط إلى CSV
export function convertPlansToCSV(plans: SubscriptionPlan[]): string {
  const headers = [
    "الاسم (عربي)",
    "الاسم (إنجليزي)",
    "السعر",
    "العملة",
    "المدة",
    "الحالة",
    "المميزات",
    "تاريخ الإنشاء",
  ];

  const rows = plans.map((p) =>
    [
      p.nameAr,
      p.name,
      String(p.price),
      p.currency,
      p.interval,
      p.isActive ? "مفعّلة" : "معطّلة",
      (p.features || []).join(" | "),
      p.createdAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}

// تنزيل ملف
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
