export interface Report {
  id: string;
  type: "spam" | "harassment" | "inappropriate_content" | "fraud" | "other";
  subject: string;
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reportedBy?: string;
  moderatorNotes?: string;
}

export interface UserReportsTabProps {
  userId: string;
}

export const REPORT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  spam: { label: "بريد مزعج", color: "bg-gray-500/10 text-gray-500" },
  harassment: { label: "تحرش", color: "bg-red-500/10 text-red-500" },
  inappropriate_content: { label: "محتوى غير لائق", color: "bg-orange-500/10 text-orange-500" },
  fraud: { label: "احتيال", color: "bg-purple-500/10 text-purple-500" },
  other: { label: "أخرى", color: "bg-blue-500/10 text-blue-500" },
};

export const REPORT_PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "منخفضة", color: "bg-gray-500/10 text-gray-500" },
  medium: { label: "متوسطة", color: "bg-blue-500/10 text-blue-500" },
  high: { label: "عالية", color: "bg-orange-500/10 text-orange-500" },
  critical: { label: "حرجة", color: "bg-red-500/10 text-red-500" },
};