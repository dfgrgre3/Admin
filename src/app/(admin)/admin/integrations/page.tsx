"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  Puzzle, RefreshCw, Plus, Edit, CheckCircle, XCircle, ExternalLink,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: "PAYMENT" | "EMAIL" | "SMS" | "STORAGE" | "ANALYTICS" | "AI" | "SOCIAL" | "OTHER";
  isActive: boolean;
  config: Record<string, unknown>;
  lastTestedAt: string | null;
  lastTestStatus: "SUCCESS" | "FAILED" | null;
  createdAt: string;
}

const INTEGRATION_TYPES = ["PAYMENT", "EMAIL", "SMS", "STORAGE", "ANALYTICS", "AI", "SOCIAL", "OTHER"] as const;

const DEFAULT_FORM = { name: "", provider: "", type: "OTHER" as Integration["type"], apiKey: "", apiSecret: "", webhookUrl: "", isActive: true };

export default function AdminIntegrationsPage() {
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SETTINGS_VIEW);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingIntegration, setEditingIntegration] = React.useState<Integration | null>(null);
  const [form, setForm] = React.useState(DEFAULT_FORM);

  const openCreate = () => { setEditingIntegration(null); setForm(DEFAULT_FORM); setFormOpen(true); };
  const openEdit = (i: Integration) => {
    setEditingIntegration(i);
    setForm({ name: i.name, provider: i.provider, type: i.type, apiKey: String(i.config?.apiKey ?? ""), apiSecret: String(i.config?.apiSecret ?? ""), webhookUrl: String(i.config?.webhookUrl ?? ""), isActive: i.isActive });
    setFormOpen(true);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "integrations"],
    queryFn: async () => {
      const response = await adminApi.fetch("/api/admin/integrations");
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return (await response.json()) as { data: { integrations: Integration[] } };
    },
  });

  const integrations = data?.data?.integrations || [];

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form & { id?: string }) => {
      const { id, apiKey, apiSecret, webhookUrl, ...rest } = payload;
      const body = { ...rest, config: { apiKey, apiSecret, webhookUrl } };
      const response = id
        ? await adminApi.fetch(`/api/admin/integrations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await adminApi.fetch("/api/admin/integrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e?.error || "Failed"); }
    },
    onSuccess: () => {
      toast.success(editingIntegration ? "تم تحديث التكامل" : "تم إنشاء التكامل");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] });
    },
    onError: (e: Error) => toast.error(e.message || "فشل الحفظ"),
  });

  const handleTest = async (id: string) => {
    try {
      const response = await adminApi.fetch(`/api/admin/integrations/${id}/test`, { method: "POST" });
      if (response.ok) { toast.success("تم اختبار الاتصال بنجاح"); queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] }); }
      else { toast.error("فشل اختبار الاتصال"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const response = await adminApi.fetch(`/api/admin/integrations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: active }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) { toast.success(active ? "تم التفعيل" : "تم التعطيل"); queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] }); }
      else { toast.error("فشل التحديث"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title="التكاملات 🔌" description="إدارة التكاملات مع الخدمات الخارجية: الدفع، البريد، التخزين، والتحليلات." eyebrow="الإعدادات" badge={String(integrations.length)}>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isLoading}>تحديث</AdminButton>
          {canManage && <AdminButton icon={Plus} onClick={openCreate}>إضافة تكامل</AdminButton>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="admin-glass p-6 rounded-[2rem] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{integration.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">{integration.provider}</p>
                </div>
              </div>
              {integration.isActive ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-black text-xs">نشط</Badge>
              ) : (
                <Badge variant="secondary" className="font-black text-xs">غير نشط</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-black text-xs">{integration.type}</Badge>
              {integration.lastTestStatus === "SUCCESS" && <Badge className="bg-green-500/10 text-green-500 font-black text-xs">آخر اختبار: ناجح</Badge>}
              {integration.lastTestStatus === "FAILED" && <Badge className="bg-red-500/10 text-red-500 font-black text-xs">آخر اختبار: فاشل</Badge>}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <AdminButton variant="outline" size="sm" icon={ExternalLink} onClick={() => handleTest(integration.id)}>اختبار</AdminButton>
              {canManage && (
                <>
                  <AdminButton variant="outline" size="sm" icon={integration.isActive ? XCircle : CheckCircle}
                    onClick={() => handleToggle(integration.id, !integration.isActive)}>
                    {integration.isActive ? "تعطيل" : "تفعيل"}
                  </AdminButton>
                  <AdminButton variant="outline" size="sm" icon={Edit} onClick={() => openEdit(integration)}>تعديل</AdminButton>
                </>
              )}
            </div>
          </div>
        ))}
        {integrations.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <Puzzle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">لا توجد تكاملات مضافة</p>
          </div>
        )}
      </div>
      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-primary" />
              {editingIntegration ? "تعديل التكامل" : "إضافة تكامل جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingIntegration ? `تعديل إعدادات ${editingIntegration.name}` : "ربط خدمة خارجية جديدة بالمنصة"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1.5 block">اسم التكامل</label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="مثال: Paymob" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block">المزود (Provider)</label>
                <Input value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} placeholder="مثال: paymob.com" className="rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block">النوع</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Integration["type"] }))} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm font-bold">
                {INTEGRATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block">API Key</label>
              <Input value={form.apiKey} onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))} placeholder="sk_live_..." type="password" className="rounded-xl font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block">API Secret</label>
              <Input value={form.apiSecret} onChange={(e) => setForm((p) => ({ ...p, apiSecret: e.target.value }))} placeholder="secret..." type="password" className="rounded-xl font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block">Webhook URL (اختياري)</label>
              <Input value={form.webhookUrl} onChange={(e) => setForm((p) => ({ ...p, webhookUrl: e.target.value }))} placeholder="https://..." className="rounded-xl" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="integration-active" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
              <label htmlFor="integration-active" className="text-sm font-bold">تفعيل فوراً</label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-bold rounded-xl border border-border hover:bg-accent transition-colors">
              إلغاء
            </button>
            <button
              onClick={() => saveMutation.mutate({ ...form, id: editingIntegration?.id })}
              disabled={saveMutation.isPending || !form.name.trim() || !form.provider.trim()}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? "جاري الحفظ..." : editingIntegration ? "حفظ التعديلات" : "إضافة التكامل"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}