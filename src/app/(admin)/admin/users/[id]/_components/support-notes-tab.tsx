"use client";

import * as React from "react";
import type { UserDetails } from "./types";
import { AdminNotes } from "./admin-notes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LifeBuoy,
  Ticket as TicketIcon,
  MessageSquare,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  XCircle,
  ArrowUpCircle,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { adminFetch } from "@/lib/api/admin-api";
import type { SupportTicket, TicketStatus } from "@/hooks/use-support-tickets";

const TICKET_STATUS_META: Record<TicketStatus, { label: string; className: string; icon: React.ElementType }> = {
  open: { label: "مفتوحة", className: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: CircleDot },
  in_progress: { label: "قيد المعالجة", className: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  resolved: { label: "تم الحل", className: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  closed: { label: "مغلقة", className: "bg-muted text-muted-foreground border-border/20", icon: XCircle },
  escalated: { label: "مصعّدة", className: "bg-red-500/10 text-red-500 border-red-500/20", icon: ArrowUpCircle },
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-blue-500",
  high: "text-amber-500",
  urgent: "text-red-500",
};

export function SupportNotesTab({ user }: { user: UserDetails }) {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = React.useState(true);
  const [ticketsError, setTicketsError] = React.useState<string | null>(null);

  const loadTickets = React.useCallback(async () => {
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const params = new URLSearchParams({ userId: user.id, limit: "50" });
      const response = await adminFetch(`/admin/tickets?${params}`);
      if (!response.ok) throw new Error("Failed to load tickets");
      const data = await response.json();
      const list: SupportTicket[] = data.data?.tickets || data.tickets || [];
      // Sort newest first
      list.sort((a: SupportTicket, b: SupportTicket) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTickets(list);
    } catch {
      setTicketsError("تعذر تحميل تذاكر الدعم لهذا المستخدم");
    } finally {
      setLoadingTickets(false);
    }
  }, [user.id]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadTickets(), 0);
    return () => window.clearTimeout(timer);
  }, [loadTickets]);

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress" || t.status === "escalated").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Support Tickets */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              تذاكر الدعم الفني
            </CardTitle>
            <CardDescription>
              {tickets.length} تذكرة · {openTickets} مفتوحة حالياً
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={loadTickets}
            disabled={loadingTickets}
          >
            <Clock className={`h-3.5 w-3.5 ml-1 ${loadingTickets ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <div className="flex items-center justify-center py-10">
              <Clock className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : ticketsError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-center">
              <AlertCircle className="mx-auto mb-2 h-7 w-7 text-danger" />
              <p className="text-sm font-bold text-danger">{ticketsError}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={loadTickets}>إعادة المحاولة</Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TicketIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد تذاكر دعم لهذا المستخدم</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const meta = TICKET_STATUS_META[ticket.status];
                const StatusIcon = meta.icon;
                const lastMessage = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <div
                    key={ticket.id}
                    className="group rounded-2xl border bg-muted/20 p-4 hover:border-primary/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate">{ticket.subject}</span>
                          <Badge className={`text-[10px] font-bold rounded-full border ${meta.className}`}>
                            <StatusIcon className="h-3 w-3 ml-1" />
                            {meta.label}
                          </Badge>
                          <span className={`text-[10px] font-bold ${PRIORITY_COLORS[ticket.priority] || ""}`}>
                            أولوية {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {ticket.description}
                        </p>
                        {lastMessage && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            آخر رسالة: {lastMessage.message.slice(0, 60)}...
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          #{ticket.ticketNumber} ·{" "}
                          {isValid(new Date(ticket.createdAt))
                            ? format(new Date(ticket.createdAt), "d MMM yyyy · HH:mm", { locale: ar })
                            : "-"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(`/admin/tickets?id=${ticket.id}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Internal Admin Notes — visible to admins only, never to the student */}
      <AdminNotes notes={user.adminNotes || []} userId={user.id} />
    </div>
  );
}
