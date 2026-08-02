"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { Bell, CheckCheck, Clock3, Mail, MessageSquareText, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminUsersApi, type UserNotificationItem } from "@/lib/api/admin-users-api";

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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "user", user.id, "notifications"],
    queryFn: () => adminUsersApi.getUserNotifications(user.id, { limit: 20, page: 1 }),
    staleTime: 30_000,
  });

  const rawItems = Array.isArray((data as any)?.items)
    ? (data as any).items
    : Array.isArray((data as any)?.notifications)
      ? (data as any).notifications
      : [];
  const total = (data as any)?.total ?? rawItems.length;
  const items = rawItems;

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
          {data && (
            <Badge variant="secondary" className="rounded-full text-xs">
              {total} إجمالي
            </Badge>
          )}
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
    </Card>
  );
}
