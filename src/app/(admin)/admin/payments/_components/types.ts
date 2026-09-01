export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface PaymentUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface PaymentSubject {
  id: string;
  name: string;
  nameAr: string | null;
}

export interface Payment {
  id: string;
  userId: string;
  planId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  transactionId: string | null;
  externalTxnId?: string | null;
  paymobOrderId?: number | null;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  user?: PaymentUser;
  subject?: PaymentSubject | null;
}

export interface PaymentSummary {
  totalPayments: number;
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  avgOrderValue: number;
  refundRate: number;
  successRate: number;
}

export interface MethodStat {
  method: string;
  count: number;
  total: number;
}

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  count: number;
}

export interface TopSubjectStat {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface PaymentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentsResponse {
  data: {
    payments: Payment[];
    summary: PaymentSummary;
    methods: MethodStat[];
    dailyRevenue: DailyRevenuePoint[];
    topSubjects: TopSubjectStat[];
    pagination: PaymentsPagination;
  };
}

export interface PaymentFilters {
  search: string;
  status: string;
  method: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
}
