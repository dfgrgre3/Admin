"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: number;
  category: string;
}

interface UserTicketsTabProps {
  userId: string;
}

export function UserTicketsTab({ userId }: UserTicketsTabProps) {
  const [tickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Fetch tickets from API
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي التذاكر</p>
              <p className="text-2xl font-black">{tickets.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">مفتوحة</p>
              <p className="text-2xl font-black">
                {tickets.filter((t) => t.status === "open").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">قيد المعالجة</p>
              <p className="text-2xl font-black">
                {tickets.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">تم الحل</p>
              <p className="text-2xl font-black">
                {tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Tickets List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">التذاكر</h3>
        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد تذاكر</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const statusConfig = statusConfigMap[ticket.status] ?? statusConfigMap.open!;
              const priorityConfig = priorityConfigMap[ticket.priority] ?? priorityConfigMap.medium!;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Ticket className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.category} • {ticket.messages} رسالة
                      </p>
                      <p className="text-xs text-muted-foreground">
                        تاريخ الإنشاء: {formatDate(ticket.createdAt)}
                        {ticket.resolvedAt && ` • تم الحل: ${formatDate(ticket.resolvedAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={priorityConfig!.color}>
                      {priorityConfig!.label}
                    </Badge>
                    <Badge variant={statusConfig!.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig!.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

const statusConfigMap: Record<string, { label: string; variant: any; icon: any }> = {
  open: { label: "مفتوح", variant: "destructive", icon: AlertTriangle },
  in_progress: { label: "قيد المعالجة", variant: "secondary", icon: Clock },
  resolved: { label: "تم الحل", variant: "default", icon: CheckCircle },
  closed: { label: "مغلق", variant: "outline", icon: XCircle },
};

const priorityConfigMap: Record<string, { label: string; color: string }> = {
  low: { label: "منخفضة", color: "bg-gray-500/10 text-gray-500" },
  medium: { label: "متوسطة", color: "bg-blue-500/10 text-blue-500" },
  high: { label: "عالية", color: "bg-orange-500/10 text-orange-500" },
  critical: { label: "حرجة", color: "bg-red-500/10 text-red-500" },
};