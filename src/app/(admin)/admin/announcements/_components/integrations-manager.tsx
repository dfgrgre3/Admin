"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Hash,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Settings,
  ExternalLink,
  Globe,
  Bell,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type IntegrationProvider = "SLACK" | "DISCORD" | "TELEGRAM" | "TEAMS";

export interface Integration {
  id: string;
  name: string;
  provider: IntegrationProvider;
  /** Webhook URL أو Bot Token */
  webhookUrl?: string;
  /** اسم القناة/المحادثة */
  channelName?: string;
  /** Bot token (Telegram/Teams) */
  botToken?: string;
  /** chat_id (Telegram) */
  chatId?: string;
  active: boolean;
  /** الأحداث المفعّلة */
  events: string[];
  /** آخر إرسال */
  lastSentAt?: string;
  lastSentStatus?: "success" | "failed";
  createdAt: string;
}

interface IntegrationsManagerProps {
  className?: string;
}

const PROVIDER_META: Record<
  IntegrationProvider,
  { label: string; icon: React.ElementType; color: string; description: string; docUrl: string }
> = {
  SLACK: {
    label: "Slack",
    icon: MessageSquare,
    color: "bg-purple-500/15 text-purple-500",
    description: "إرسال الإعلانات إلى قناة Slack عبر Webhook",
    docUrl: "https://api.slack.com/messaging/webhooks",
  },
  DISCORD: {
    label: "Discord",
    icon: Hash,
    color: "bg-indigo-500/15 text-indigo-500",
    description: "إرسال الإعلانات إلى قناة Discord عبر Webhook",
    docUrl: "https://discord.com/developers/docs/resources/webhook",
  },
  TELEGRAM: {
    label: "Telegram",
    icon: Send,
    color: "bg-blue-500/15 text-blue-500",
    description: "إرسال عبر Telegram Bot API",
    docUrl: "https://core.telegram.org/bots/api",
  },
  TEAMS: {
    label: "Microsoft Teams",
    icon: Bell,
    color: "bg-cyan-500/15 text-cyan-500",
    description: "إرسال إلى قناة Teams عبر Webhook",
    docUrl: "https://learn.microsoft.com/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook",
  },
};

const TRIGGER_EVENTS = [
  { value: "announcement.created", label: "إعلان جديد" },
  { value: "announcement.published", label: "نشر إعلان" },
  { value: "announcement.scheduled", label: "جدولة إعلان" },
  { value: "announcement.urgent", label: "إعلان عاجل" },
];

/**
 * مكوّن إدارة التكاملات - Slack / Discord / Telegram / Teams
 * لإرسال إشعارات الإعلانات الهامة إلى منصات التواصل
 */
export function IntegrationsManager({ className }: IntegrationsManagerProps) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Integration | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "integrations"],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/announcements/integrations`);
      if (!res.ok) return { items: [] as Integration[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.integrations as Integration[]) ||
          (json?.data?.items as Integration[]) ||
          (json?.integrations as Integration[]) ||
          (json?.items as Integration[]) ||
          [],
      };
    },
    staleTime: 30000,
  });

  const integrations = data?.items || [];

  const toggleActive = useMutation({
    mutationFn: async (vars: { id: string; active: boolean }) => {
      const res = await adminFetch(`/api/admin/announcements/integrations/${vars.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: vars.active }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة التكامل");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "integrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/announcements/integrations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم حذف التكامل");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "integrations"] });
      setDeletingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testIntegration = useMutation({
    mutationFn: async (id: string) => {
      setTestingId(id);
      const res = await adminFetch(`/api/admin/announcements/integrations/${id}/test`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("فشل الاختبار");
      return res.json();
    },
    onSuccess: (data: { ok?: boolean; message?: string }) => {
      if (data?.ok) {
        toast.success("تم إرسال رسالة اختبار بنجاح");
      } else {
        toast.warning(`استجابة غير متوقعة: ${data?.message ?? "—"}`);
      }
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "integrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setTestingId(null),
  });

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">التكاملات (Integrations)</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              أرسل الإعلانات إلى Slack / Discord / Telegram / Teams
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
          إضافة تكامل
        </AdminButton>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && integrations.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-8 text-center text-xs font-bold text-muted-foreground">
          <Globe className="h-6 w-6 opacity-40" />
          لا توجد تكاملات مهيّأة
        </div>
      )}

      {!isLoading && integrations.length > 0 && (
        <div className="space-y-2">
          {integrations.map((integ) => {
            const meta = PROVIDER_META[integ.provider];
            const Icon = meta.icon;
            const StatusIcon =
              integ.lastSentStatus === "success" ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : integ.lastSentStatus === "failed" ? (
                <XCircle className="h-3 w-3 text-red-500" />
              ) : null;
            return (
              <div
                key={integ.id}
                className={cn(
                  "rounded-xl border bg-white/2.5 p-3 transition",
                  integ.active ? "border-white/10" : "border-white/5 opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black">{integ.name}</p>
                        <Badge variant="outline" className="text-[9px] font-black">
                          {meta.label}
                        </Badge>
                        {StatusIcon}
                      </div>
                      {integ.channelName && (
                        <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                          {integ.channelName}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {integ.events.slice(0, 2).map((e) => (
                          <Badge
                            key={e}
                            variant="secondary"
                            className="text-[9px] font-bold"
                          >
                            {TRIGGER_EVENTS.find((t) => t.value === e)?.label || e}
                          </Badge>
                        ))}
                        {integ.events.length > 2 && (
                          <Badge variant="secondary" className="text-[9px] font-bold">
                            +{integ.events.length - 2}
                          </Badge>
                        )}
                      </div>
                      {integ.lastSentAt && (
                        <p className="mt-1 text-[9px] font-bold text-muted-foreground">
                          آخر إرسال: {formatDateTime(integ.lastSentAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleActive.mutate({ id: integ.id, active: !integ.active })}
                      className={cn(
                        "rounded-md p-1.5 transition",
                        integ.active
                          ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                          : "bg-slate-500/15 text-slate-500 hover:bg-slate-500/25"
                      )}
                      aria-label={integ.active ? "تعطيل" : "تفعيل"}
                    >
                      {integ.active ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                    </button>
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={testingId === integ.id ? Loader2 : Send}
                      onClick={() => testIntegration.mutate(integ.id)}
                      disabled={testingId === integ.id}
                      className={testingId === integ.id ? "animate-spin" : ""}
                      aria-label="اختبار"
                    />
                    <AdminButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Settings}
                      onClick={() => setEditing(integ)}
                      aria-label="تعديل"
                    />
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setDeletingId(integ.id)}
                      className="text-red-500 hover:bg-red-500/10"
                      aria-label="حذف"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <IntegrationFormDialog
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
        title="حذف التكامل"
        description="هل أنت متأكد من حذف هذا التكامل؟ لن يتم إرسال أي إشعارات بعد الآن."
        confirmText="حذف"
        variant="destructive"
        onConfirm={() => deletingId && deleteIntegration.mutate(deletingId)}
        loading={deleteIntegration.isPending}
      />
    </div>
  );
}

/* ───────── Dialog إضافة/تعديل ───────── */

interface IntegrationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Integration | null;
}

function IntegrationFormDialog({ open, onOpenChange, editing }: IntegrationFormDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [provider, setProvider] = React.useState<IntegrationProvider>("SLACK");
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [botToken, setBotToken] = React.useState("");
  const [chatId, setChatId] = React.useState("");
  const [channelName, setChannelName] = React.useState("");
  const [events, setEvents] = React.useState<Set<string>>(new Set(["announcement.published"]));
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setName(editing?.name || "");
      setProvider(editing?.provider || "SLACK");
      setWebhookUrl(editing?.webhookUrl || "");
      setBotToken(editing?.botToken || "");
      setChatId(editing?.chatId || "");
      setChannelName(editing?.channelName || "");
      setEvents(new Set(editing?.events || ["announcement.published"]));
      setActive(editing?.active ?? true);
    }
  }, [open, editing]);

  const toggleEvent = (e: string) => {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e);
      else next.add(e);
      return next;
    });
  };

  const submit = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        provider,
        events: Array.from(events),
        active,
        channelName: channelName.trim() || undefined,
      };
      if (provider === "TELEGRAM") {
        payload.botToken = botToken.trim();
        payload.chatId = chatId.trim();
      } else {
        payload.webhookUrl = webhookUrl.trim();
      }
      const endpoint = editing
        ? `/api/admin/announcements/integrations/${editing.id}`
        : `/api/admin/announcements/integrations`;
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
      toast.success(editing ? "تم تحديث التكامل" : "تم إنشاء التكامل");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "integrations"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const meta = PROVIDER_META[provider];
  const isValid = () => {
    if (!name.trim() || events.size === 0) return false;
    if (provider === "TELEGRAM") return !!botToken.trim() && !!chatId.trim();
    return !!webhookUrl.trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل التكامل" : "إضافة تكامل جديد"}</DialogTitle>
          <DialogDescription>
            اربط Slack / Discord / Telegram / Teams لإرسال الإعلانات تلقائياً
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              اسم التكامل
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثل: Slack - فريق التسويق"
            />
          </div>

          {!editing && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                المنصة
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(PROVIDER_META) as IntegrationProvider[]).map((p) => {
                  const pmeta = PROVIDER_META[p];
                  const PIcon = pmeta.icon;
                  const active = provider === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-2 transition",
                        active
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-white/10 bg-white/2.5 hover:bg-white/5"
                      )}
                    >
                      <PIcon className={cn("h-4 w-4", active ? "text-indigo-500" : pmeta.color.split(" ")[1])} />
                      <span className="text-[10px] font-black">{pmeta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {provider === "TELEGRAM" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Bot Token
                </label>
                <Input
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456:ABC-DEF..."
                  dir="ltr"
                />
                <p className="text-[9px] font-bold text-muted-foreground">
                  أنشئ بوت عبر @BotFather واحصل على Token
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Chat ID
                </label>
                <Input
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="-1001234567890"
                  dir="ltr"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Webhook URL
              </label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                dir="ltr"
              />
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-muted-foreground">{meta.description}</span>
                <a
                  href={meta.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-indigo-500 hover:underline"
                >
                  دليل الإعداد <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              اسم القناة (اختياري)
            </label>
            <Input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="#announcements"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              الأحداث ({events.size})
            </label>
            <div className="space-y-1 rounded-lg border border-white/10 bg-white/2.5 p-2">
              {TRIGGER_EVENTS.map((e) => (
                <label
                  key={e.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-[11px] font-bold transition hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={events.has(e.value)}
                    onChange={() => toggleEvent(e.value)}
                    className="h-3 w-3 accent-indigo-500"
                  />
                  <span>{e.label}</span>
                  <code className="text-[9px] text-muted-foreground" dir="ltr">
                    {e.value}
                  </code>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2.5 p-3">
            <div>
              <p className="text-xs font-black">مفعّل</p>
              <p className="text-[10px] font-bold text-muted-foreground">
                التكامل يعمل الآن ويرسل الإشعارات
              </p>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <AdminButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            type="button"
            variant="gradient"
            disabled={!isValid() || submit.isPending}
            onClick={() => submit.mutate()}
            icon={submit.isPending ? Loader2 : Send}
            className={submit.isPending ? "animate-spin" : ""}
          >
            {submit.isPending ? "جاري الحفظ..." : editing ? "حفظ" : "إنشاء"}
          </AdminButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}