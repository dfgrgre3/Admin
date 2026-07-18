import { adminApi } from "./admin-api";

export interface MRRData {
  currentMRR: number;
  currency: string;
  series: { month: string; revenue: number; activeSubs: number }[];
  activeSubscriptions: number;
  churnLast30Days: number;
}

export interface Affiliate {
  id: string;
  userId: string;
  code: string;
  status: string;
  commissionRate: number;
  tier: string;
  totalEarned: number;
  totalPaid: number;
  createdAt: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  userId: string;
  amount: number;
  commission: number;
  status: string;
  createdAt: string;
}

export interface DunningRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string;
  emailsSent: number;
  createdAt: string;
}

export interface TaxReport {
  country: string;
  taxName: string;
  rate: number;
  from: string;
  to: string;
  netRevenue: number;
  taxAmount: number;
  grossTotal: number;
  currency: string;
}

export const billingApi = {
  getMRR: () => adminApi.get<MRRData>("/analytics/mrr"),

  listAffiliates: () => adminApi.get<Affiliate[]>("/affiliates"),
  createAffiliate: (body: { userId: string; code?: string; commissionRate?: number; tier?: string }) =>
    adminApi.post<Affiliate>("/affiliates", body),
  listAffiliateReferrals: (id: string) =>
    adminApi.get<AffiliateReferral[]>(`/affiliates/${id}/referrals`),
  payAffiliate: (id: string) => adminApi.post<{ success: boolean; paid: number }>(`/affiliates/${id}/pay`, {}),

  listDunning: () => adminApi.get<DunningRecord[]>("/dunning"),

  getTaxReport: (from: string, to: string) =>
    adminApi.get<TaxReport>("/reports/tax", { from, to }),
};
