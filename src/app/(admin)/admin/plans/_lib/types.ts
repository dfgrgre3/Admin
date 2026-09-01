// نوع المدة الزمنية للخطة — القيم المدعومة من الـ API
export type PlanInterval = "MONTHLY" | "YEARLY" | "FOREVER";

// فلتر حالة الخطة في الواجهة
export type PlanStatusFilter = "all" | "active" | "inactive";

// فلتر المدة (يضيف "all" على قيم PlanInterval)
export type PlanFilterInterval = "all" | PlanInterval;

// نموذج الخطة كما يعيده الـ Backend
export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  currency: string;
  interval: PlanInterval;
  isActive: boolean;
  features: string[];
  groupKey?: string;
  createdAt: string;
  updatedAt: string;
}

// قيم نموذج الإدخال (النموذج + تحويل المميزات إلى نص مسطّر)
export interface PlanFormValues {
  name: string;
  nameAr: string;
  description: string;
  price: number;
  currency: string;
  interval: PlanInterval;
  isActive: boolean;
  features: string;
  groupKey: string;
}

// إحصائيات محسوبة من قائمة الخطط
export interface PlanStats {
  total: number;
  active: number;
  inactive: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  byInterval: Record<PlanInterval, number>;
  groupsCount: number;
}
