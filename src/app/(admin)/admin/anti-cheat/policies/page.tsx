"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ListChecks,
  Plus,
  Power,
  PowerOff,
  Edit,
  Trash2,
  Zap,
  Shield,
  Bell,
  FileText,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  Eye,
  Settings2,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, formatNumber } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { m, AnimatePresence } from "framer-motion";

import {
  type AntiCheatRule,
  type AntiCheatPolicy,
  type AntiCheatRuleAction,
  type AntiCheatSeverity,
  EVENT_TYPE_CONFIG,
  EVENT_TYPE_ORDER,
  RULE_ACTION_CONFIG,
  SEVERITY_CONFIG,
  SEVERITY_ORDER,
} from "../_components/types";
import { POLICY_PRESETS, DEFAULT_RULE_TEMPLATES } from "../_lib/constants";
import { REFRESH_INTERVALS } from "../_lib/constants";

// ─────────────────────────────────────────────
//  بطاقات التنقل الفرعي (نفسها في كل الصفحات)
// ─────────────────────────────────────────────
const SUB_PAGES = [
  {
    href: "/admin/anti-cheat",
    label: "الحالات",
    icon: Shield,
    color: "text-red-500",
    description: "مراجعة حالات الغش",
  },
  {
    href: "/admin/anti-cheat/policies",
    label: "السياسات والقواعد",
    icon: ListChecks,
    color: "text-blue-500",
    description: "إدارة قواعد الكشف",
  },
  {
    href: "/admin/anti-cheat/analytics",
    label: "التحليلات",
    icon: Sparkles,
    color: "text-purple-500",
    description: "إحصاءات وتقارير متقدمة",
  },
  {
    href: "/admin/anti-cheat/whitelist",
    label: "القائمة البيضاء",
    icon: Shield,
    color: "text-emerald-500",
    description: "الاستثناءات والتصاريح",
  },
];

function SubPageNav({ current }: { current: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SUB_PAGES.map((p) => {
        const isActive = current === p.href;
        const Icon = p.icon;
        return (
          <Link
            key={p.href}
            href={p.href}
            className={cn(
              "admin-glass group relative overflow-hidden rounded-2xl border p-4 transition-all",
              "hover:scale-[1.02] hover:shadow-xl",
              isActive
                ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10",
                    p.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black">{p.label}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className={cn(
                  "h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
                  isActive && "opacity-100"
                )}
              />
            </div>
            {isActive && (
              <m.div
                layoutId="subnav-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-transparent"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  الصفحة الرئيسية للسياسات
// ─────────────────────────────────────────────
export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.LIVE_MONITOR_VIEW);

  const [tab, setTab] = React.useState<"policies" | "rules">("policies");
  const [editingRule, setEditingRule] = React.useState<AntiCheatRule | null>(null);
  const [editingPolicy, setEditingPolicy] = React.useState<AntiCheatPolicy | null>(null);
  const [createRuleOpen, setCreateRuleOpen] = React.useState(false);

  // ── جلب القواعد ──
  const rulesQuery = useQuery({
    queryKey: ["admin", "anti-cheat", "rules"],
    queryFn: async () => {
      const response = await adminFetch("/api/admin/anti-cheat/rules");
      if (!response.ok) {
        // إذا لم تتوفر API، أرجع بيانات افتراضية
        return DEFAULT_RULE_TEMPLATES as AntiCheatRule[];
      }
      const json = await response.json();
      return (json.data || json.rules || DEFAULT_RULE_TEMPLATES) as AntiCheatRule[];
    },
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  // ── جلب السياسات ──
  const policiesQuery = useQuery({
    queryKey: ["admin", "anti-cheat", "policies"],
    queryFn: async () => {
      const response = await adminFetch("/api/admin/anti-cheat/policies");
      if (!response.ok) {
        return POLICY_PRESETS.map((p, i) => ({
          id: `preset-${i}`,
          ...p,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rulesCount: 0,
        })) as AntiCheatPolicy[];
      }
      const json = await response.json();
      return (json.data || json.policies || []) as AntiCheatPolicy[];
    },
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  const rules = rulesQuery.data || [];
  const policies = policiesQuery.data || [];

  // ── تبديل حالة قاعدة ──
  const toggleRule = useMutation({
    mutationFn: async (rule: AntiCheatRule) => {
      const response = await adminFetch(`/api/admin/anti-cheat/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      if (!response.ok) throw new Error("فشل تحديث القاعدة");
      return response.json();
    },
    onSuccess: (_data, rule) => {
      toast.success(rule.isActive ? "تم إيقاف القاعدة" : "تم تفعيل القاعدة");
      queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat", "rules"] });
      logAdminAction("UPDATE", "anti_cheat_rule", {
        entityId: rule.id,
        entityName: rule.name,
        details: { isActive: !rule.isActive },
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(`/api/admin/anti-cheat/rules/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل حذف القاعدة");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم حذف القاعدة");
      queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat", "rules"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── أعمدة جدول القواعد ──
  const ruleColumns: ColumnDef<AntiCheatRule>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "القاعدة",
        cell: ({ row }) => {
          const rule = row.original;
          const eventCfg =
            EVENT_TYPE_CONFIG[rule.eventType as keyof typeof EVENT_TYPE_CONFIG];
          const Icon = eventCfg?.icon || AlertTriangle;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  eventCfg?.border || "border-white/10 bg-white/5"
                )}
              >
                <Icon className={cn("h-4 w-4", eventCfg?.text || "text-muted-foreground")} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black">{rule.name}</p>
                <p className="truncate text-[10px] font-bold text-muted-foreground">
                  {eventCfg?.label || rule.eventType}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "severity",
        header: "الخطورة",
        cell: ({ row }) => {
          const cfg = SEVERITY_CONFIG[row.original.severity];
          return (
            <Badge
              variant="outline"
              className={cn("border-2 px-2.5 py-0.5 text-[10px] font-black", cfg.border, cfg.text)}
            >
              {cfg.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "threshold",
        header: "العتبة",
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-black">
              {row.original.threshold} حدث
            </p>
            <p className="text-[10px] text-muted-foreground">
              خلال {row.original.windowMinutes} دقيقة
            </p>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "الإجراء",
        cell: ({ row }) => {
          const cfg = RULE_ACTION_CONFIG[row.original.action];
          return (
            <Badge variant="outline" className={cn("border-2 px-2.5 py-0.5 text-[10px] font-black", cfg.border, cfg.text)}>
              <span className={cn("ml-1 h-1.5 w-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "triggeredCount",
        header: "مرات التفعيل",
        cell: ({ row }) => (
          <span className="text-xs font-black">
            {formatNumber(row.original.triggeredCount || 0)}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "الحالة",
        cell: ({ row }) => (
          <button
            onClick={() => canManage && toggleRule.mutate(row.original)}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-2.5 py-1 text-[10px] font-black transition",
              row.original.isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-slate-500/30 bg-slate-500/10 text-slate-500"
            )}
          >
            {row.original.isActive ? (
              <>
                <Power className="h-3 w-3" /> مفعّلة
              </>
            ) : (
              <>
                <PowerOff className="h-3 w-3" /> معطلة
              </>
            )}
          </button>
        ),
      },
      {
        id: "actions",
        header: "إجراءات",
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            onView={() => setEditingRule(row.original)}
            extraActions={[
              {
                icon: Edit,
                label: "تعديل",
                onClick: (rule) => setEditingRule(rule as AntiCheatRule),
              },
              {
                icon: Power,
                label: row.original.isActive ? "إيقاف" : "تفعيل",
                onClick: (rule) => toggleRule.mutate(rule as AntiCheatRule),
              },
              {
                icon: Trash2,
                label: "حذف",
                variant: "destructive",
                onClick: (rule) => {
                  if (confirm(`هل تريد حذف القاعدة «${rule.name}»؟`)) {
                    deleteRule.mutate(rule.id);
                  }
                },
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, toggleRule.mutate, deleteRule.mutate]
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat"] });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="السياسات والقواعد"
        description="إدارة سياسات الكشف عن الغش والقواعد التلقائية."
        eyebrow="مكافحة الغش"
        badge={`${formatNumber(rules.length)} قاعدة`}
        meta={
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <ListChecks className="h-4 w-4 text-blue-500" />
            مفعّلة: {formatNumber(rules.filter((r) => r.isActive).length)} من {formatNumber(rules.length)}
          </div>
        }
      >
        <Link
          href="/admin/anti-cheat"
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-black text-muted-foreground transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة للحالات
        </Link>
        {canManage && (
          <AdminButton
            icon={Plus}
            size="sm"
            onClick={() => setCreateRuleOpen(true)}
          >
            قاعدة جديدة
          </AdminButton>
        )}
      </PageHeader>

      <SubPageNav current="/admin/anti-cheat/policies" />

      {/* بطاقات الإحصاء السريع */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="إجمالي القواعد"
          value={rules.length}
          icon={ListChecks}
          color="text-blue-500"
          loading={rulesQuery.isLoading}
        />
        <SummaryCard
          label="قواعد مفعّلة"
          value={rules.filter((r) => r.isActive).length}
          icon={Power}
          color="text-emerald-500"
          loading={rulesQuery.isLoading}
        />
        <SummaryCard
          label="قواعد حرجة"
          value={rules.filter((r) => r.severity === "CRITICAL").length}
          icon={AlertTriangle}
          color="text-red-500"
          loading={rulesQuery.isLoading}
        />
        <SummaryCard
          label="حظر تلقائي"
          value={rules.filter((r) => r.action === "AUTO_BLOCK").length}
          icon={Zap}
          color="text-amber-500"
          loading={rulesQuery.isLoading}
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "policies" | "rules")}>
        <div className="admin-glass rounded-[2rem] border border-white/10 p-1 shadow-2xl">
          <div className="flex items-center justify-between p-4">
            <TabsList>
              <TabsTrigger value="policies">
                <FileText className="ml-1.5 h-3.5 w-3.5" />
                السياسات
              </TabsTrigger>
              <TabsTrigger value="rules">
                <ListChecks className="ml-1.5 h-3.5 w-3.5" />
                القواعد
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <m.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="rules" className="p-4 pt-0">
                <AdminDataTable
                  columns={ruleColumns}
                  data={rules}
                  loading={rulesQuery.isLoading}
                  columnLabels={{
                    name: "القاعدة",
                    severity: "الخطورة",
                    threshold: "العتبة",
                    action: "الإجراء",
                    triggeredCount: "مرات التفعيل",
                    isActive: "الحالة",
                    actions: "إجراءات",
                  }}
                  emptyMessage={{
                    title: "لا توجد قواعد",
                    description: "أضف قواعد لاكتشاف السلوك المشبوه تلقائياً.",
                  }}
                />
              </TabsContent>

              <TabsContent value="policies" className="p-4 pt-0">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {policiesQuery.isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                        />
                      ))
                    : policies.map((policy) => (
                        <PolicyCard
                          key={policy.id}
                          policy={policy}
                          onEdit={() => setEditingPolicy(policy)}
                          canManage={canManage}
                        />
                      ))}
                </div>
              </TabsContent>
            </m.div>
          </AnimatePresence>
        </div>
      </Tabs>

      {/* ── نوافذ التعديل ── */}
      <RuleDialog
        open={createRuleOpen || !!editingRule}
        onOpenChange={(o) => {
          if (!o) {
            setCreateRuleOpen(false);
            setEditingRule(null);
          }
        }}
        rule={editingRule}
        onSaved={refresh}
      />

      <PolicyDialog
        open={!!editingPolicy}
        onOpenChange={(o) => !o && setEditingPolicy(null)}
        policy={editingPolicy}
        onSaved={refresh}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  بطاقة إحصاء سريع
// ─────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="admin-glass flex items-center gap-3 rounded-2xl border border-white/10 p-4">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          "bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-5 w-12 animate-pulse rounded bg-white/10" />
        ) : (
          <p className="text-xl font-black">{formatNumber(value)}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  بطاقة السياسة
// ─────────────────────────────────────────────
function PolicyCard({
  policy,
  onEdit,
  canManage,
}: {
  policy: AntiCheatPolicy;
  onEdit: () => void;
  canManage: boolean;
}) {
  const features = [
    { key: "blockCameraOff", label: "حظر إيقاف الكاميرا", icon: Eye },
    { key: "blockTabSwitch", label: "حظر تبديل التبويبات", icon: Settings2 },
    { key: "blockCopyPaste", label: "حظر النسخ/اللصق", icon: FileText },
    { key: "blockMultipleDevices", label: "حظر أجهزة متعددة", icon: Shield },
    { key: "requireFullscreen", label: "طلب ملء الشاشة", icon: Settings2 },
    { key: "requireWebcam", label: "طلب الكاميرا", icon: Eye },
    { key: "requireMicrophone", label: "طلب الميكروفون", icon: Bell },
    { key: "recordSession", label: "تسجيل الجلسة", icon: FileText },
    { key: "fingerprintCheck", label: "بصمة الجهاز", icon: Shield },
    { key: "randomChecks", label: "فحوصات عشوائية", icon: Sparkles },
  ];

  const enabledCount = features.filter((f) =>
    Boolean((policy as unknown as Record<string, boolean>)[f.key])
  ).length;

  return (
    <m.div
      whileHover={{ y: -4 }}
      className={cn(
        "admin-glass group relative overflow-hidden rounded-2xl border p-5 transition-all",
        policy.isEnabled
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-white/10 bg-white/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black">{policy.name}</h3>
          <p className="mt-1 text-[10px] font-bold text-muted-foreground">
            {policy.description}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "border-2 px-2 py-0.5 text-[10px] font-black",
            policy.isEnabled
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border-slate-500/30 bg-slate-500/10 text-slate-500"
          )}
        >
          {policy.isEnabled ? "مفعّلة" : "معطلة"}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {features.slice(0, 6).map((f) => {
          const enabled = Boolean(
            (policy as unknown as Record<string, boolean>)[f.key]
          );
          const Icon = f.icon;
          return (
            <div
              key={f.key}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[10px] font-black",
                enabled
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-white/5 bg-white/5 text-muted-foreground line-through"
              )}
            >
              <Icon className="h-3 w-3" />
              {f.label}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="text-[10px] font-bold text-muted-foreground">
          {enabledCount} من {features.length} ميزة مفعّلة
          {policy.maxWarnings > 0 && (
            <span className="block">
              تحذيرات قصوى: {policy.maxWarnings}
            </span>
          )}
        </div>
        {canManage && (
          <AdminButton variant="ghost" size="sm" icon={Edit} onClick={onEdit}>
            تعديل
          </AdminButton>
        )}
      </div>
    </m.div>
  );
}

// ─────────────────────────────────────────────
//  نموذج تعديل/إنشاء قاعدة
// ─────────────────────────────────────────────
function RuleDialog({
  open,
  onOpenChange,
  rule,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: AntiCheatRule | null;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    eventType: "TAB_SWITCH",
    threshold: 3,
    windowMinutes: 5,
    action: "FLAG" as AntiCheatRuleAction,
    severity: "MEDIUM" as AntiCheatSeverity,
    isActive: true,
    autoBlock: false,
    notifyAdmin: true,
  });

  React.useEffect(() => {
    if (rule) {
      setForm({
        name: rule.name,
        description: rule.description,
        eventType: rule.eventType,
        threshold: rule.threshold,
        windowMinutes: rule.windowMinutes,
        action: rule.action,
        severity: rule.severity,
        isActive: rule.isActive,
        autoBlock: rule.autoBlock,
        notifyAdmin: rule.notifyAdmin,
      });
    } else {
      setForm({
        name: "",
        description: "",
        eventType: "TAB_SWITCH",
        threshold: 3,
        windowMinutes: 5,
        action: "FLAG",
        severity: "MEDIUM",
        isActive: true,
        autoBlock: false,
        notifyAdmin: true,
      });
    }
  }, [rule, open]);

  const save = useMutation({
    mutationFn: async () => {
      const url = rule
        ? `/api/admin/anti-cheat/rules/${rule.id}`
        : "/api/admin/anti-cheat/rules";
      const method = rule ? "PATCH" : "POST";
      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("فشل حفظ القاعدة");
      return response.json();
    },
    onSuccess: () => {
      toast.success(rule ? "تم تحديث القاعدة" : "تم إنشاء القاعدة");
      onSaved();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            {rule ? "تعديل قاعدة" : "قاعدة جديدة"}
          </DialogTitle>
          <DialogDescription>
            قواعد الكشف عن السلوك المشبوه والإجراءات التلقائية
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>اسم القاعدة</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: تبديل تبويبات متكرر"
            />
          </div>

          <div>
            <Label>الوصف</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف القاعدة..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>نوع الحدث</Label>
              <Select
                value={form.eventType}
                onValueChange={(v) => setForm({ ...form, eventType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_ORDER.map((et) => {
                    const cfg = EVENT_TYPE_CONFIG[et];
                    return (
                      <SelectItem key={et} value={et}>
                        {cfg.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الخطورة</Label>
              <Select
                value={form.severity}
                onValueChange={(v) =>
                  setForm({ ...form, severity: v as AntiCheatSeverity })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>العتبة (عدد الأحداث)</Label>
              <Input
                type="number"
                min={1}
                value={form.threshold}
                onChange={(e) =>
                  setForm({ ...form, threshold: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>نافذة زمنية (دقيقة)</Label>
              <Input
                type="number"
                min={1}
                value={form.windowMinutes}
                onChange={(e) =>
                  setForm({ ...form, windowMinutes: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <Label>الإجراء التلقائي</Label>
            <Select
              value={form.action}
              onValueChange={(v) =>
                setForm({ ...form, action: v as AntiCheatRuleAction })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RULE_ACTION_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 rounded-xl border border-white/5 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">تفعيل القاعدة</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">حظر تلقائي عند التفعيل</Label>
              <Switch
                checked={form.autoBlock}
                onCheckedChange={(v) => setForm({ ...form, autoBlock: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">إشعار المدير</Label>
              <Switch
                checked={form.notifyAdmin}
                onCheckedChange={(v) => setForm({ ...form, notifyAdmin: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <AdminButton variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            icon={Zap}
            onClick={() => save.mutate()}
            loading={save.isPending}
          >
            {rule ? "حفظ التغييرات" : "إنشاء القاعدة"}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
//  نموذج تعديل سياسة
// ─────────────────────────────────────────────
function PolicyDialog({
  open,
  onOpenChange,
  policy,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: AntiCheatPolicy | null;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<Partial<AntiCheatPolicy>>({});

  React.useEffect(() => {
    if (policy) setForm(policy);
  }, [policy, open]);

  const save = useMutation({
    mutationFn: async () => {
      if (!policy) return;
      const response = await adminFetch(
        `/api/admin/anti-cheat/policies/${policy.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!response.ok) throw new Error("فشل حفظ السياسة");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم حفظ السياسة");
      onSaved();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!policy) return null;

  const toggles = [
    { key: "blockCameraOff", label: "حظر إيقاف الكاميرا" },
    { key: "blockTabSwitch", label: "حظر تبديل التبويبات" },
    { key: "blockCopyPaste", label: "حظر النسخ/اللصق" },
    { key: "blockMultipleDevices", label: "حظر أجهزة متعددة" },
    { key: "blockVoiceDetected", label: "حظر كشف الصوت" },
    { key: "requireFullscreen", label: "طلب ملء الشاشة" },
    { key: "requireWebcam", label: "طلب الكاميرا" },
    { key: "requireMicrophone", label: "طلب الميكروفون" },
    { key: "recordSession", label: "تسجيل الجلسة" },
    { key: "fingerprintCheck", label: "بصمة الجهاز" },
    { key: "randomChecks", label: "فحوصات عشوائية" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            تعديل السياسة: {policy.name}
          </DialogTitle>
          <DialogDescription>{policy.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-black">تفعيل السياسة</Label>
              <Switch
                checked={Boolean(form.isEnabled)}
                onCheckedChange={(v) => setForm({ ...form, isEnabled: v })}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black">الإجراءات التقييدية</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {toggles.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2"
                >
                  <Label className="cursor-pointer text-[11px] font-bold">
                    {t.label}
                  </Label>
                  <Switch
                    checked={Boolean(
                      (form as Record<string, boolean>)[t.key]
                    )}
                    onCheckedChange={(v) =>
                      setForm({ ...form, [t.key]: v })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>عدد التحذيرات قبل الحظر</Label>
              <Input
                type="number"
                min={0}
                value={form.maxWarnings ?? 0}
                onChange={(e) =>
                  setForm({ ...form, maxWarnings: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>عتبة التنبيه (درجة المخاطر)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.warningThreshold ?? 50}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warningThreshold: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <AdminButton variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            icon={Settings2}
            onClick={() => save.mutate()}
            loading={save.isPending}
          >
            حفظ السياسة
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
