"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { Bell, CheckCheck, Clock3, Loader2, Mail, MessageSquareText, Send, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminUsersApi, type UserNotificationItem } from "@/lib/api/admin-users-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";

type NotificationsPayload = {
  total?: number;
  items?: UserNotificationItem[];
  notifications?: UserNotificationItem[];
};

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "بريد إلكتروني" },
  { value: "SMS", label: "رسالة نصية" },
  { value: "PUSH", label: "إشعار فوري" },
  { value: "IN_APP", label: "داخل التطبيق" },
] as const;

const notificationTypeConfig: Record<
  UserNotificationItem["type"],
  { label: string; icon: typeof Bell; tone: string }
> = {
  EMAIL: { label: "بريد", icon: Mail, tone: "bg-emerald-500/10 text-emerald-600" },
  SMS: { label: "رسالة نصية", icon: MessageSquareText, tone: "bg-cyan-500/10 text-cyan-600" },
  PUSH: { label: "إشعار فوري", icon: Smartphone, tone: "bg-violet-500/10 text-violet-600" },
  IN_APP: { label: "داخل التطبيق", icon: Bell, tone: "bg-amber-500/10 text-amber-600" },
};

export function UserNotificationsTab({ user }: { user: { id: string; name?: string | null } }) {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canSend = hasPermission(PERMISSIONS.USERS_SEND_NOTIFICATIONS);

  const [sendOpen, setSendOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [channels, setChannels] = React.useState<Set<"EMAIL" | "SMS" | "PUSH" | "IN_APP">>(new Set(["IN_APP"]));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "user", user.id, "notifications"],
    queryFn: () => adminUsersApi.getUserNotifications(user.id, { limit: 20, page: 1 }),
    staleTime: 30_000,
  });

  const payload = data as NotificationsPayload | undefined;
  const rawItems = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.notifications)
      ? payload.notifications
      : [];
  const total = payload?.total ?? rawItems.length;
  const items = rawItems;

  const sendMutation = useMutation({
    mutationFn: () =>
      adminUsersApi.sendNotification(user.id, {
        title: title.trim(),
        body: body.trim(),
        channels: Array.from(channels),
      }),
    onSuccess: () => {
      toast.success("تم إرسال الإشعار للمستخدم بنجاح");
      setSendOpen(false);
      setTitle("");
      setBody("");
      setChannels(new Set(["IN_APP"]));
      queryClient.invalidateQueries({ queryKey: ["admin", "user", user.id, "notifications"] });
    },
    onError: (err: Error) => toast.error(err.message || "فشل إرسال الإشعار"),
  });

  const toggleChannel = (channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP") => {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) {
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  };

  const resetSendForm = () => {
    setTitle("");
    setBody("");
    setChannels(new Set(["IN_APP"]));
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              الإشعارات
            </CardTitle>
            <CardDescription>
              آخر {items.length} إشعار مرسل إلى {user.name || "المستخدم"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <Badge variant="secondary" className="rounded-full text-xs">
                {total} إجمالي
              </Badge>
            )}
            {canSend && (
              <Button
                size="sm"
                className="rounded-xl gap-1.5"
                onClick={() => setSendOpen(true)}
              >
                <Send className="h-3.5 w-3.5" />
                إرسال إشعار
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5 text-sm text-muted-foreground">جاري تحميل الإشعارات...</div>
        ) : isError ? (
          <div className="p-5 text-sm text-destructive">تعذر تحميل الإشعارات. حاول مرة أخرى.</div>
        ) : items.length > 0 ? (
          <div className="divide-y">
            {items.map((item: { id: string; title: string; body: string; createdAt: string; readAt?: string | null; type?: keyof typeof notificationTypeConfig }) => {
              const config = notificationTypeConfig[item.type ?? "IN_APP"] ?? notificationTypeConfig.IN_APP;
              const Icon = config.icon;
              const createdAt = new Date(item.createdAt);
              const readableDate = isValid(createdAt)
                ? format(createdAt, "d MMM yyyy · HH:mm", { locale: ar })
                : "-";

              return (
                <div key={item.id} className="p-4 sm:p-5 transition-colors hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 rounded-xl p-2 ${config.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-sm truncate">{item.title}</p>
                          <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground leading-6">{item.body}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {readableDate}
                          </span>
                          {item.readAt ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCheck className="h-3 w-3" />
                              تم قراءتها
                            </span>
                          ) : (
                            <span className="text-amber-600">غير مقروءة</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">لا توجد إشعارات مرسلة لهذا المستخدم</p>
          </div>
        )}
      </CardContent>

      <Dialog open={sendOpen} onOpenChange={(open) => {
        setSendOpen(open);
        if (!open) resetSendForm();
      }}>
        <DialogContent dir="rtl" className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <Send className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-xl font-black">
              إرسال إشعار للمستخدم
            </DialogTitle>
            <DialogDescription className="text-center">
              سيُرسل الإشعار إلى {user.name || "المستخدم"} عبر القنوات المحددة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="notification-title" className="text-sm font-bold">العنوان *</Label>
              <Input
                id="notification-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تذكير بموعد الامتحان"
                className="h-12 rounded-xl"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-body" className="text-sm font-bold">نص الإشعار *</Label>
              <Textarea
                id="notification-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="اكتب نص الرسالة..."
                className="rounded-xl min-h-[100px]"
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold">قنوات الإرسال</Label>
              <div className="grid grid-cols-2 gap-2">
                {CHANNEL_OPTIONS.map((channel) => (
                  <label
                    key={channel.value}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                      channels.has(channel.value)
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={channels.has(channel.value)}
                      onCheckedChange={() => toggleChannel(channel.value)}
                    />
                    {channel.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={() => setSendOpen(false)}
              type="button"
            >
              إلغاء
            </Button>
            <Button
              className="flex-1 rounded-xl h-11"
              disabled={!title.trim() || !body.trim() || channels.size === 0 || sendMutation.isPending}
              type="button"
              onClick={() => sendMutation.mutate()}
            >
              {sendMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إرسال الإشعار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
