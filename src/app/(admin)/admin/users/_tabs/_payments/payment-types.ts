export type PaymentStatus = "completed" | "pending" | "failed" | "refunded" | string;

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
  subject?: string;
  description?: string;
}

export interface UserPaymentsTabProps {
  userId: string;
}