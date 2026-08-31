import { adminApi } from "./admin-api";
import type {
  Affiliate,
  AffiliateReferral,
} from "./billing-api";

// ---------------------------------------------------------------------------
// Affiliate extended types
// ---------------------------------------------------------------------------

export type AffiliateStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED"
  | "INACTIVE";

export type AffiliateTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "CUSTOM";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
export type PayoutMethod = "BANK" | "PAYPAL" | "VODAFONE_CASH" | "INSTAPAY" | "MANUAL";

export interface AffiliateFull extends Affiliate {
  approvedAt?: string;
  approvedBy?: string;
  payoutMethod?: PayoutMethod | string;
  payoutDetails?: Record<string, unknown>;
  minimumPayout: number;
  holdDays: number;
  clicksCount: number;
  conversionsCount: number;
  lastActivityAt?: string;
  notes?: string;
}

export interface AffiliateCampaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  commissionRate?: number;
  budget?: number;
  spent: number;
  bannerUrl?: string;
  landingUrl?: string;
  promoCode?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  campaignId?: string;
  name: string;
  slug: string;
  destinationUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  clicksCount: number;
  uniqueClicksCount: number;
  conversionsCount: number;
  active: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  affiliate?: AffiliateFull;
  campaign?: AffiliateCampaign;
}

export interface AffiliateLinkClick {
  id: string;
  linkId: string;
  affiliateId: string;
  ipHash?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  device?: string;
  converted: boolean;
  createdAt: string;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method?: string;
  reference?: string;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
  referralIds: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  affiliate?: AffiliateFull;
}

export interface AffiliateTierRule {
  id: string;
  tier: AffiliateTier;
  nameAr: string;
  commissionRate: number;
  minRevenue: number;
  minReferrals: number;
  bonusRate: number;
  color: string;
  sortOrder: number;
  active: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateSetting {
  id: string;
  key: string;
  defaultCommissionRate: number;
  defaultTier: AffiliateTier;
  autoApprove: boolean;
  minimumPayout: number;
  holdDays: number;
  cookieDays: number;
  allowSelfReferral: boolean;
  emailTemplateWelcome?: string;
  emailTemplatePayout?: string;
  notifyOnSignup: boolean;
  notifyOnPayout: boolean;
  metadata?: Record<string, unknown>;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateAudit {
  id: string;
  affiliateId?: string;
  actorId?: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

export interface AffiliateAnalytics {
  windowDays: number;
  headline: {
    totalAffiliates: number;
    activeAffiliates: number;
    pendingAffiliates: number;
    totalClicks: number;
    totalConversions: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalLinks: number;
    totalPayouts: number;
    pendingPayouts: number;
    paidPayouts: number;
  };
  clicksSeries: { day: string; clicks: number; conversions: number }[];
  earningsSeries: { day: string; pending: number; paid: number }[];
  tierDistribution: { tier: string; count: number; total: number }[];
  statusDistribution: { status: string; count: number }[];
  topAffiliates: Affiliate[];
  topCampaigns: AffiliateCampaign[];
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export const affiliateApi = {
  // Core
  list: () => adminApi.get<AffiliateFull[]>("/affiliates"),
  create: (body: {
    userId: string;
    code?: string;
    status?: AffiliateStatus;
    commissionRate?: number;
    tier?: AffiliateTier;
  }) => adminApi.post<AffiliateFull>("/affiliates", body),
  get: (id: string) =>
    adminApi.get<{ affiliate: AffiliateFull; pendingCount: number }>(`/affiliates/${id}`),
  update: (id: string, body: {
    code?: string;
    status?: AffiliateStatus;
    commissionRate?: number;
    tier?: AffiliateTier;
  }) => adminApi.patch<AffiliateFull>(`/affiliates/${id}`, body),
  delete: (id: string) => adminApi.delete<{ success: boolean }>(`/affiliates/${id}`),
  referrals: (id: string) => adminApi.get<AffiliateReferral[]>(`/affiliates/${id}/referrals`),
  createReferral: (id: string, body: { userId: string; amount: number; commission?: number; status?: string }) =>
    adminApi.post<AffiliateReferral>(`/affiliates/${id}/referrals`, body),
  pay: (id: string) =>
    adminApi.post<{ success: boolean; paid: number; count: number; payout?: AffiliatePayout }>(`/affiliates/${id}/pay`, {}),

  // Lifecycle
  approve: (id: string) => adminApi.post<AffiliateFull>(`/affiliates/${id}/approve`, {}),
  suspend: (id: string) => adminApi.post<AffiliateFull>(`/affiliates/${id}/suspend`, {}),
  reactivate: (id: string) => adminApi.post<AffiliateFull>(`/affiliates/${id}/reactivate`, {}),
  updatePayoutConfig: (id: string, body: {
    payoutMethod?: PayoutMethod | "";
    payoutDetails?: Record<string, unknown>;
    minimumPayout?: number;
    holdDays?: number;
    notes?: string;
  }) => adminApi.patch<AffiliateFull>(`/affiliates/${id}/payout-config`, body),

  // Analytics
  analytics: (days = 30) => adminApi.get<AffiliateAnalytics>("/affiliates-analytics", { days }),
  audits: (limit = 50) => adminApi.get<AffiliateAudit[]>("/affiliate-audits", { limit }),

  // Campaigns
  listCampaigns: (params?: { q?: string; status?: CampaignStatus }) =>
    adminApi.get<AffiliateCampaign[]>("/affiliate-campaigns", params),
  createCampaign: (body: Partial<AffiliateCampaign>) =>
    adminApi.post<AffiliateCampaign>("/affiliate-campaigns", body),
  getCampaign: (id: string) =>
    adminApi.get<{ campaign: AffiliateCampaign; linksCount: number; clicksCount: number; conversionsCount: number }>(
      `/affiliate-campaigns/${id}`
    ),
  updateCampaign: (id: string, body: Partial<AffiliateCampaign>) =>
    adminApi.patch<AffiliateCampaign>(`/affiliate-campaigns/${id}`, body),
  deleteCampaign: (id: string) =>
    adminApi.delete<{ success: boolean }>(`/affiliate-campaigns/${id}`),

  // Links
  listLinks: (params?: { affiliateId?: string; campaignId?: string; q?: string }) =>
    adminApi.get<AffiliateLink[]>("/affiliate-links", params),
  createLink: (body: {
    affiliateId: string;
    campaignId?: string;
    name: string;
    slug?: string;
    destinationUrl: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }) => adminApi.post<AffiliateLink>("/affiliate-links", body),
  getLink: (id: string) =>
    adminApi.get<{ link: AffiliateLink; clicks: AffiliateLinkClick[] }>(`/affiliate-links/${id}`),
  updateLink: (id: string, body: Partial<AffiliateLink>) =>
    adminApi.patch<AffiliateLink>(`/affiliate-links/${id}`, body),
  deleteLink: (id: string) =>
    adminApi.delete<{ success: boolean }>(`/affiliate-links/${id}`),
  trackClick: (id: string, body: { ipHash?: string; userAgent?: string; referer?: string; country?: string; device?: string; converted?: boolean } = {}) =>
    adminApi.post<AffiliateLinkClick>(`/affiliate-links/${id}/track`, body),

  // Payouts
  listPayouts: (params?: { affiliateId?: string; status?: PayoutStatus }) =>
    adminApi.get<AffiliatePayout[]>("/affiliate-payouts", params),
  createPayout: (body: { affiliateId: string; amount: number; currency?: string; method?: string; reference?: string; notes?: string; referralIds?: string[] }) =>
    adminApi.post<AffiliatePayout>("/affiliate-payouts", body),
  markPayoutStatus: (id: string, body: { status: PayoutStatus; reference?: string; notes?: string }) =>
    adminApi.post<AffiliatePayout>(`/affiliate-payouts/${id}/status`, body),
  processPayouts: (id: string) =>
    adminApi.post<{ success: boolean; paid: number; count: number; payout: AffiliatePayout }>(
      `/affiliate-payouts/${id}/process`,
      {}
    ),

  // Settings
  getSettings: () => adminApi.get<AffiliateSetting>("/affiliate-settings"),
  updateSettings: (body: Partial<AffiliateSetting>) =>
    adminApi.put<AffiliateSetting>("/affiliate-settings", body),

  // Tiers
  listTiers: () => adminApi.get<AffiliateTierRule[]>("/affiliate-tiers"),
  upsertTier: (body: Partial<AffiliateTierRule> & { tier: AffiliateTier; nameAr: string }) =>
    adminApi.put<AffiliateTierRule>("/affiliate-tiers", body),
  deleteTier: (id: string) =>
    adminApi.delete<{ success: boolean }>(`/affiliate-tiers/${id}`),
};