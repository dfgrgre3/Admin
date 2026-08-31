"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  affiliateApi,
  type AffiliateSetting,
  type AffiliateTierRule,
  type AffiliateTier,
} from "@/lib/api/affiliate-api";
import {
  Save,
  Settings,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Layers,
  DollarSign,
  Calendar,
  Users,
  Bell,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const TIER_OPTIONS: AffiliateTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "CUSTOM"];
const TIER_LABEL_AR: Record<AffiliateTier, string> = {
  BRONZE: "برونزي",
  SILVER: "فضي",
  GOLD: "ذهبي",
  PLATINUM: "بلاتيني",
  CUSTOM: "مخصص",
};
const TIER_COLOR: Record<AffiliateTier, string> = {
  BRONZE: "amber",
  SILVER: "zinc",
  GOLD: "yellow",
  PLATINUM: "violet",
  CUSTOM: "blue",
};

export default function AffiliateSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات المسوقين"
        description="القواعد العامة للعمولات، الفئات، الإعتماد التلقائي، الإشعارات"
      />
      <SettingsCard />
      <TiersCard />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Card
// ---------------------------------------------------------------------------

function SettingsCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliate-settings"],
    queryFn: () => affiliateApi.getSettings(),
  });

  const [form, setForm] = React.useState<Partial<AffiliateSetting>>({});
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (data) {
      setForm(data);
      setDirty(false);
    }
  }, [data]);

  const update = (key: keyof AffiliateSetting, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const updateMutation = useMutation({
    mutationFn: (body: Partial<AffiliateSetting>) => affiliateApi.updateSettings(body),
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-settings"] });
      setDirty(false);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل الحفظ"),
  });

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="py-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> الإعدادات العامة
            </CardTitle>
            <CardDescription>تؤثر على كل المسوقين الجدد وعلى سير العمل</CardDescription>
          </div>
          <AdminButton
            disabled={!dirty || updateMutation.isPending}
            onClick={() => updateMutation.mutate(form)}
          >
            <Save className="w-4 h-4 ml-2" /> حفظ التغييرات
          </AdminButton>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Defaults */}
        <Section title="الإعدادات الافتراضية" icon={<Users className="w-4 h-4" />}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="نسبة العمولة الافتراضية (%)">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.defaultCommissionRate ?? ""}
                onChange={(e) => update("defaultCommissionRate", Number(e.target.value))}
              />
            </Field>
            <Field label="الفئة الافتراضية">
              <select
                value={form.defaultTier ?? "BRONZE"}
                onChange={(e) => update("defaultTier", e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABEL_AR[t]} ({t})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Section 2: Payout rules */}
        <Section title="قواعد الدفع" icon={<DollarSign className="w-4 h-4" />}>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="الحد الأدنى للدفع (ج.م)">
              <Input
                type="number"
                min="0"
                value={form.minimumPayout ?? ""}
                onChange={(e) => update("minimumPayout", Number(e.target.value))}
              />
            </Field>
            <Field label="فترة الانتظار (أيام)">
              <Input
                type="number"
                min="0"
                value={form.holdDays ?? ""}
                onChange={(e) => update("holdDays", Number(e.target.value))}
              />
            </Field>
            <Field label="مدة الكوكي (أيام)">
              <Input
                type="number"
                min="1"
                max="365"
                value={form.cookieDays ?? ""}
                onChange={(e) => update("cookieDays", Number(e.target.value))}
              />
            </Field>
          </div>
        </Section>

        {/* Section 3: Approvals & flags */}
        <Section title="الاعتماد والقواعد" icon={<ShieldCheck className="w-4 h-4" />}>
          <div className="space-y-3">
            <Toggle
              label="الإعتماد التلقائي"
              description="اعتماد المسوقين الجدد تلقائياً دون مراجعة"
              checked={!!form.autoApprove}
              onChange={(v) => update("autoApprove", v)}
            />
            <Toggle
              label="السماح بالإحالة الذاتية"
              description="يمكن للمستخدم استخدام كود الإحالة الخاص به"
              checked={!!form.allowSelfReferral}
              onChange={(v) => update("allowSelfReferral", v)}
            />
          </div>
        </Section>

        {/* Section 4: Notifications */}
        <Section title="الإشعارات" icon={<Bell className="w-4 h-4" />}>
          <div className="space-y-3">
            <Toggle
              label="إشعار عند تسجيل مسوق جديد"
              description="تنبيه للإدارة عند انضمام مسوق جديد"
              checked={!!form.notifyOnSignup}
              onChange={(v) => update("notifyOnSignup", v)}
            />
            <Toggle
              label="إشعار عند صرف العمولات"
              description="تنبيه للإدارة عند إتمام صرف العمولات"
              checked={!!form.notifyOnPayout}
              onChange={(v) => update("notifyOnPayout", v)}
            />
          </div>
        </Section>

        {/* Section 5: Email templates */}
        <Section title="قوالب البريد الإلكتروني" icon={<Mail className="w-4 h-4" />}>
          <div className="space-y-3">
            <Field label="قالب رسالة الترحيب">
              <Textarea
                rows={3}
                value={form.emailTemplateWelcome || ""}
                onChange={(e) => update("emailTemplateWelcome", e.target.value)}
                placeholder="مرحبًا {{name}}، نرحب بانضمامك كمسوق..."
              />
            </Field>
            <Field label="قالب رسالة الدفع">
              <Textarea
                rows={3}
                value={form.emailTemplatePayout || ""}
                onChange={(e) => update("emailTemplatePayout", e.target.value)}
                placeholder="عزيزي {{name}}، تم تحويل {{amount}} ج.م..."
              />
            </Field>
          </div>
        </Section>

        {dirty && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            توجد تغييرات غير محفوظة
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tiers Card
// ---------------------------------------------------------------------------

function TiersCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliate-tiers"],
    queryFn: () => affiliateApi.listTiers(),
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AffiliateTierRule | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AffiliateTierRule | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => affiliateApi.deleteTier(id),
    onSuccess: () => {
      toast.success("تم حذف الفئة");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-tiers"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("فشل الحذف"),
  });

  const columns = React.useMemo<ColumnDef<AffiliateTierRule>[]>(
    () => [
      {
        id: "tier",
        header: "الفئة",
        cell: ({ row }) => (
          <Badge className={`bg-${TIER_COLOR[row.original.tier]}-500/15 text-${TIER_COLOR[row.original.tier]}-700`}>
            {TIER_LABEL_AR[row.original.tier]} · {row.original.tier}
          </Badge>
        ),
      },
      {
        id: "nameAr",
        header: "الاسم",
        accessorKey: "nameAr",
      },
      {
        id: "rate",
        header: "العمولة + البونص",
        cell: ({ row }) => (
          <div className="text-sm">
            <span className="font-bold">{row.original.commissionRate}%</span>
            {row.original.bonusRate > 0 && (
              <span className="text-xs text-green-600 mr-1">+ {row.original.bonusRate}% بونص</span>
            )}
          </div>
        ),
      },
      {
        id: "qualification",
        header: "متطلبات التأهيل",
        cell: ({ row }) => (
          <div className="text-xs space-y-0.5">
            <div>إيرادات ≥ {row.original.minRevenue} ج.م</div>
            <div>إحالات ≥ {row.original.minReferrals}</div>
          </div>
        ),
      },
      {
        id: "active",
        header: "مفعلة",
        cell: ({ row }) =>
          row.original.active ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-zinc-400" />
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            onEdit={() => {
              setEditing(row.original);
              setFormOpen(true);
            }}
            onDelete={() => setDeleteTarget(row.original)}
            extraActions={[
              {
                label: "تعديل",
                icon: Pencil,
                onClick: () => {
                  setEditing(row.original);
                  setFormOpen(true);
                },
              },
              {
                label: "حذف",
                icon: Trash2,
                variant: "destructive" as const,
                onClick: () => setDeleteTarget(row.original),
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4" /> فئات المسوقين
            </CardTitle>
            <CardDescription>قواعد العمولة ومتطلبات الترقية لكل فئة</CardDescription>
          </div>
          <AdminButton
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" /> فئة جديدة
          </AdminButton>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AdminDataTable columns={columns} data={data ?? []} emptyMessage={{ title: "لا توجد فئات", description: "لم يتم العثور على فئات للمسوقين" }} />
        )}
      </CardContent>

      <TierFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        tier={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف الفئة"
        description={`هل تريد حذف فئة "${deleteTarget?.nameAr}" ?`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}

function TierFormDialog({
  open,
  onOpenChange,
  tier,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tier: AffiliateTierRule | null;
}) {
  const qc = useQueryClient();

  const [form, setForm] = React.useState({
    tier: "BRONZE" as AffiliateTier,
    nameAr: "",
    commissionRate: "10",
    minRevenue: "0",
    minReferrals: "0",
    bonusRate: "0",
    color: "amber",
    sortOrder: "0",
    active: true,
  });

  React.useEffect(() => {
    if (tier) {
      setForm({
        tier: tier.tier,
        nameAr: tier.nameAr,
        commissionRate: tier.commissionRate.toString(),
        minRevenue: tier.minRevenue.toString(),
        minReferrals: tier.minReferrals.toString(),
        bonusRate: tier.bonusRate.toString(),
        color: tier.color,
        sortOrder: tier.sortOrder.toString(),
        active: tier.active,
      });
    } else {
      setForm({
        tier: "BRONZE",
        nameAr: "",
        commissionRate: "10",
        minRevenue: "0",
        minReferrals: "0",
        bonusRate: "0",
        color: "amber",
        sortOrder: "0",
        active: true,
      });
    }
  }, [tier, open]);

  const saveMutation = useMutation({
    mutationFn: () =>
      affiliateApi.upsertTier({
        tier: form.tier,
        nameAr: form.nameAr,
        commissionRate: Number(form.commissionRate),
        minRevenue: Number(form.minRevenue),
        minReferrals: Number(form.minReferrals),
        bonusRate: Number(form.bonusRate),
        color: form.color,
        sortOrder: Number(form.sortOrder),
        active: form.active,
      }),
    onSuccess: () => {
      toast.success(tier ? "تم التحديث" : "تم إنشاء الفئة");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-tiers"] });
      onOpenChange(false);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل الحفظ"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tier ? "تعديل فئة" : "فئة جديدة"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="الفئة">
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value as AffiliateTier })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                disabled={!!tier}
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABEL_AR[t]} ({t})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="الاسم بالعربية">
              <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </Field>
            <Field label="نسبة العمولة (%)">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
              />
            </Field>
            <Field label="البونص (%)">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.bonusRate}
                onChange={(e) => setForm({ ...form, bonusRate: e.target.value })}
              />
            </Field>
            <Field label="حد الإيرادات">
              <Input
                type="number"
                min="0"
                value={form.minRevenue}
                onChange={(e) => setForm({ ...form, minRevenue: e.target.value })}
              />
            </Field>
            <Field label="حد الإحالات">
              <Input
                type="number"
                min="0"
                value={form.minReferrals}
                onChange={(e) => setForm({ ...form, minReferrals: e.target.value })}
              />
            </Field>
            <Field label="اللون">
              <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </Field>
            <Field label="الترتيب">
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="text-sm font-medium">مفعلة</div>
              <div className="text-xs text-muted-foreground">هل الفئة متاحة للتعيين؟</div>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            disabled={!form.nameAr || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "جارٍ الحفظ..." : tier ? "حفظ" : "إنشاء"}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b pb-5 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}