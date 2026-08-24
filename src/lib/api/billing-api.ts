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
  user?: {
    id: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
}

export interface AffiliateDetail extends Affiliate {
  pendingCount?: number;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  userId: string;
  amount: number;
  commission: number;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
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

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  method: string;
  reference: string;
  completedAt?: string;
  externalTxnId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string;
  createdAt: string;
  updatedAt: string;
  payment: InvoicePayment;
  planName?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  summary: {
    totalInvoices: number;
    totalAmount: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  createAffiliate: (body: { userId: string; code?: string; commissionRate?: number; tier?: string; status?: string }) =>
    adminApi.post<Affiliate>("/affiliates", body),
  getAffiliate: (id: string) =>
    adminApi.get<{ affiliate: AffiliateDetail; pendingCount: number }>(`/affiliates/${id}`),
  updateAffiliate: (id: string, body: { code?: string; status?: string; commissionRate?: number; tier?: string }) =>
    adminApi.patch<Affiliate>(`/affiliates/${id}`, body),
  deleteAffiliate: (id: string) =>
    adminApi.delete<{ success: boolean }>(`/affiliates/${id}`),
  listAffiliateReferrals: (id: string) =>
    adminApi.get<AffiliateReferral[]>(`/affiliates/${id}/referrals`),
  payAffiliate: (id: string) => adminApi.post<{ success: boolean; paid: number; count: number }>(`/affiliates/${id}/pay`, {}),

  listDunning: () => adminApi.get<DunningRecord[]>("/dunning"),

  listInvoices: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    adminApi.get<InvoiceListResponse>("/invoices", params),
  getInvoice: (id: string) => adminApi.get<Invoice>(`/invoices/${id}`),

  getTaxReport: (from: string, to: string) =>
    adminApi.get<TaxReport>("/reports/tax", { from, to }),
};
