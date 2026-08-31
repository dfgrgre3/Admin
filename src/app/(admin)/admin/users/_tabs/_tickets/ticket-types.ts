export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | string;
export type TicketPriority = "low" | "medium" | "high" | "critical" | string;

export interface SupportTicketItem {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: number;
  category: string;
}

export interface UserTicketsTabProps {
  userId: string;
}

export type TicketBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export const TICKET_PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "منخفضة", color: "bg-gray-500/10 text-gray-500" },
  medium: { label: "متوسطة", color: "bg-blue-500/10 text-blue-500" },
  high: { label: "عالية", color: "bg-orange-500/10 text-orange-500" },
  critical: { label: "حرجة", color: "bg-red-500/10 text-red-500" },
};