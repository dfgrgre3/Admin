"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Webhook,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Send,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";

export type AnnouncementEvent =
  | "announcement.created"
  | "announcement.updated"
  | "announcement.published"
  | "announcement.unpublished"
  | "announcement.deleted"
  | "announcement.scheduled"
  | "announcement.expired"
  | "announcement.approved"
  | "announcement.rejected"
  | "announcement.broadcast"
  | "announcement.viewed"
  | "announcement.clicked";

export const ALL_EVENTS: { value: AnnouncementEvent; label: string; group: string }[] = [
  { value: "announcement.created", label: "تم إنشاء إعلان", group: "Lifecycle" },
  { value: "announcement.updated", label: "تم تعديل إعلان", group: "Lifecycle" },
  { value: "announcement.published", label: "تم نشر إعلان", group: "Lifecycle" },
  { value: "announcement.unpublished", label: "تم إخفاء إعلان", group: "Lifecycle" },
  { value: "announcement.deleted", label: "تم حذف إعلان", group: "Lifecycle" },
  { value: "announcement.scheduled", label: "تم جدولة إعلان", group: "Scheduling" },
  { value: "announcement.expired", label: "انتهت صلاحية إعلان", group: "Scheduling" },
  { value: "announcement.approved", label: "تمت الموافقة على إعلان", group: "Approval" },
  { value: "announcement.rejected", label: "تم رفض إعلان", group: "Approval" },
  { value: "announcement.broadcast", label: "تم بث إعلان", group: "Engagement" },
  { value: "announcement.viewed", label: "تم مشاهدة إعلان", group: "Engagement" },
  { value: "announcement.clicked", label: "تم النقر على إعلان", group: "Engagement" },
];

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: AnnouncementEvent[];
  active: boolean;
  secret?: string;
  createdAt: string;
  updatedAt?: string;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "success" | "failed" | "pending";
  failureCount?: number;
}

interface WebhooksManagerProps {
  className?: string;
}

/**
 * مكوّن إدارة Webhooks - إضافة/حذف/تفعيل/اختبار Webhooks
 * للأحداث المختلفة في دورة حياة الإعلان
 */
export function WebhooksManager({ className }: WebhooksManagerProps) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<WebhookConfig | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = React.useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "announcements", "webhooks"],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/announcements/webhooks`);
      if (!res.ok) return { items: [] as WebhookConfig[] };
      const json = await res.json();
      const items: WebhookConfig[] =
        (json?.data?.webhooks as WebhookConfig[]) ||
        (json?.data?.items as WebhookConfig[]) ||
        (json?.webhooks as WebhookConfig[]) ||
        (json?.items as WebhookConfig[]) ||
        [];
      return { items };
    },
    staleTime: 30000,
  });

  const webhooks = data?.items || [];

  const toggleActive = useMutation({
    mutationFn: async (vars: { id: string; active: boolean }) => {
      const res = await adminFetch(`/api/admin/announcements/webhooks/${vars.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: vars.active }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة الـ Webhook");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "webhooks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/announcements/webhooks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم حذف الـ Webhook");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "webhooks"] });
      setDeletingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testWebhook = useMutation({
    mutationFn: async (id: string) => {
      setTestingId(id);
      const res = await adminFetch(`/api/admin/announcements/webhooks/${id}/test`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("فشل الاختبار");
      return res.json();
    },
    onSuccess: (data: { status?: number; message?: string }) => {
      if (data?.status && data.status >= 200 && data.status < 300) {
        toast.success(`تم إرسال الطلب التجريبي (${data.status})`);
      } else {
        toast.warning(`استجابة غير متوقعة: ${data?.status ?? "—"}`);
      }
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "webhooks"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setTestingId(null),
  });

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret).then(
      () => toast.success("تم نسخ المفتاح السري"),
      () => toast.error("فشل النسخ")
    );
  };

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn("space-y-4", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
            <Webhook className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">Webhooks للأحداث</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              اربط أنظمتك الخارجية بأحداث الإعلانات (12 حدث متاح)
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="gradient"
          size="sm"
          icon={Plus}
          onClick={() => setCreateOpen(true)}
        >
          إضافة Webhook
        </AdminButton>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] font-bold text-amber-700">
          تعذّر تحميل قائمة الـ Webhooks.
        </div>
      )}

      {!isLoading && webhooks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-8 text-center text-xs font-bold text-muted-foreground">
          <Globe className="h-6 w-6 opacity-40" />
          لا توجد Webhooks مهيّأة بعد
        </div>
      )}

      {!isLoading && webhooks.length > 0 && (
        <div className="space-y-2">
          {webhooks.map((w) => {
            const statusIcon =
              w.lastDeliveryStatus === "success" ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : w.lastDeliveryStatus === "failed" ? (
                <XCircle className="h-3 w-3 text-red-500" />
              ) : (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              );
            const isRevealed = revealedSecrets.has(w.id);
            return (
              <div
                key={w.id}
                className={cn(
                  "rounded-xl border bg-white/2.5 p-3 transition",
                  w.active ? "border-white/10" : "border-white/5 opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black">{w.name}</p>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                          w.active
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-slate-500/15 text-slate-500"
                        )}
                      >
                        {w.active ? "نشط" : "متوقف"}
                      </span>
                      {statusIcon}
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] font-bold text-muted-foreground" dir="ltr">
                      {w.url}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {w.events.slice(0, 3).map((e) => (
                        <span
                          key={e}
                          className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-500"
                        >
                          {e}
                        </span>
                      ))}
                      {w.events.length > 3 && (
                        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                          +{w.events.length - 3}
                        </span>
                      )}
                    </div>
                    {w.secret && (
                      <div className="mt-2 flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                        <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <code className="flex-1 truncate font-mono text-[10px] font-bold text-muted-foreground" dir="ltr">
                          {isRevealed ? w.secret : "•".repeat(24)}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleSecret(w.id)}
                          className="text-muted-foreground transition hover:text-foreground"
                          aria-label={isRevealed ? "إخفاء" : "إظهار"}
                        >
                          {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copySecret(w.secret!)}
                          className="text-muted-foreground transition hover:text-foreground"
                          aria-label="نسخ"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={w.active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: w.id, active: checked })}
                    />
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={testingId === w.id ? Loader2 : Send}
                      onClick={() => testWebhook.mutate(w.id)}
                      disabled={testingId === w.id}
                      className={testingId === w.id ? "animate-spin" : ""}
                    >
                      اختبار
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(w)}
                    >
                      تعديل
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setDeletingId(w.id)}
                      className="text-red-500 hover:bg-red-500/10"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WebhookFormDialog
        open={createOpen || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
        editing={editing}
      />

      <AdminConfirm
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="حذف Webhook"
        description="هل أنت متأكد من حذف هذا الـ Webhook؟ لن يتم إرسال أي إشعارات للأحداث بعد الآن."
        confirmText="حذف"
        variant="destructive"
        onConfirm={() => deletingId && deleteWebhook.mutate(deletingId)}
        loading={deleteWebhook.isPending}
      />
    </div>
  );
}

/* ───────── Dialog إنشاء/تعديل ───────── */

interface WebhookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: WebhookConfig | null;
}

function WebhookFormDialog({ open, onOpenChange, editing }: WebhookFormDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [events, setEvents] = React.useState<Set<AnnouncementEvent>>(new Set());
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setName(editing?.name || "");
      setUrl(editing?.url || "");
      setEvents(new Set(editing?.events || []));
      setActive(editing?.active ?? true);
    }
  }, [open, editing]);

  const toggleEvent = (e: AnnouncementEvent) => {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e);
      else next.add(e);
      return next;
    });
  };

  const toggleGroup = (group: string) => {
    const groupEvents = ALL_EVENTS.filter((e) => e.group === group).map((e) => e.value);
    const allSelected = groupEvents.every((e) => events.has(e));
    setEvents((prev) => {
      const next = new Set(prev);
      groupEvents.forEach((e) => {
        if (allSelected) next.delete(e);
        else next.add(e);
      });
      return next;
    });
  };

  const submit = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        url: url.trim(),
        events: Array.from(events),
        active,
      };
      const endpoint = editing
        ? `/api/admin/announcements/webhooks/${editing.id}`
        : `/api/admin/announcements/webhooks`;
      const method = editing ? "PATCH" : "POST";
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "فشل الحفظ");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(editing ? "تم تحديث الـ Webhook" : "تم إنشاء الـ Webhook");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "webhooks"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = Array.from(new Set(ALL_EVENTS.map((e) => e.group)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل Webhook" : "إضافة Webhook جديد"}</DialogTitle>
          <DialogDescription>
            حدد URL والأحداث التي تريد استقبال إشعار بها. سيتم توقيع الطلب بمفتاح سري.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              الاسم
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثل: Slack - فريق التسويق"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              URL
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.example.com/announcements"
              dir="ltr"
            />
            <p className="text-[9px] font-bold text-muted-foreground">
              يدعم HTTPS فقط. سيُرسل طلب POST مع توقيع HMAC-SHA256.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              الأحداث ({events.size} / {ALL_EVENTS.length})
            </label>
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/2.5 p-3">
              {groups.map((g) => {
                const groupEvents = ALL_EVENTS.filter((e) => e.group === g);
                const allSelected = groupEvents.every((e) => events.has(e.value));
                const someSelected = groupEvents.some((e) => events.has(e.value));
                return (
                  <div key={g} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {g}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroup(g)}
                        className="text-[10px] font-bold text-violet-500 transition hover:underline"
                      >
                        {allSelected ? "إلغاء الكل" : someSelected ? "تحديد الكل" : "تحديد الكل"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {groupEvents.map((e) => (
                        <label
                          key={e.value}
                          className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-[10px] font-bold transition hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={events.has(e.value)}
                            onChange={() => toggleEvent(e.value)}
                            className="h-3 w-3 accent-violet-500"
                          />
                          <span>{e.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2.5 p-3">
            <div>
              <p className="text-xs font-black">مفعّل</p>
              <p className="text-[10px] font-bold text-muted-foreground">
                إذا تم تعطيله، لن يتم إرسال أي طلبات
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <AdminButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            type="button"
            variant="gradient"
            icon={RefreshCw}
            disabled={submit.isPending || !name.trim() || !url.trim() || events.size === 0}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إنشاء"}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * مكوّن عرض سجل تسليم Webhook (اختياري - عرض في Dialog التفاصيل)
 */
export function WebhookDeliveryLog({
  webhookId,
  className,
}: {
  webhookId: string;
  className?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "webhooks", webhookId, "deliveries"],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/announcements/webhooks/${webhookId}/deliveries`);
      if (!res.ok) return { items: [] as Array<{ id: string; status: number; createdAt: string; response?: string }> };
      const json = await res.json();
      return {
        items:
          (json?.data?.deliveries as Array<{ id: string; status: number; createdAt: string; response?: string }>) ||
          [],
      };
    },
  });

  if (isLoading) return <Skeleton className="h-20 w-full rounded-lg" />;
  const items = data?.items || [];
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[10px] font-bold text-muted-foreground">
        لا توجد عمليات تسليم مسجلة
      </div>
    );
  }
  return (
    <div className={cn("space-y-1", className)} dir="rtl">
      {items.slice(0, 10).map((d) => (
        <div
          key={d.id}
          className="flex items-center justify-between rounded-md bg-white/2.5 px-2 py-1.5 text-[10px]"
        >
          <span className="font-mono font-bold">{d.status}</span>
          <span className="text-muted-foreground">
            {new Date(d.createdAt).toLocaleString("ar-EG")}
          </span>
        </div>
      ))}
    </div>
  );
}