"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ShieldCheck,
  Shield,
  ListChecks,
  BarChart3,
  Plus,
  Search,
  Trash2,
  Power,
  PowerOff,
  Globe,
  User,
  Smartphone,
  FileText,
  Edit,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  Filter as FilterIcon,
  X,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

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
import { cn, formatNumber } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { logAdminAction } from "@/lib/admin-audit";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

import {
  type AntiCheatWhitelist,
  type AntiCheatWhitelistStatus,
  formatDate,
  formatDateTime,
  timeAgo,
} from "../_components/types";
import { WHITELIST_TYPES } from "../_lib/constants";
import { REFRESH_INTERVALS } from "../_lib/constants";

// ─────────────────────────────────────────────
//  التنقل الفرعي
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
    icon: BarChart3,
    color: "text-purple-500",
    description: "إحصاءات وتقارير متقدمة",
  },
  {
    href: "/admin/anti-cheat/whitelist",
    label: "القائمة البيضاء",
    icon: ShieldCheck,
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
//  أيقونة النوع
// ─────────────────────────────────────────────
const TYPE_ICONS: Record<AntiCheatWhitelist["type"], React.ElementType> = {
  USER: User,
  IP: Globe,
  DEVICE: Smartphone,
  EXAM: FileText,
};

const TYPE_LABELS: Record<AntiCheatWhitelist["type"], string> = {
  USER: "مستخدم",
  IP: "عنوان IP",
  DEVICE: "جهاز",
  EXAM: "امتحان",
};

const TYPE_COLORS: Record<
  AntiCheatWhitelist["type"],
  { text: string; border: string; bg: string; dot: string }
> = {
  USER: {
    text: "text-blue-500",
    border: "border-blue-500/30 bg-blue-500/10",
    bg: "bg-blue-500",
    dot: "bg-blue-500",
  },
  IP: {
    text: "text-purple-500",
    border: "border-purple-500/30 bg-purple-500/10",
    bg: "bg-purple-500",
    dot: "bg-purple-500",
  },
  DEVICE: {
    text: "text-amber-500",
    border: "border-amber-500/30 bg-amber-500/10",
    bg: "bg-amber-500",
    dot: "bg-amber-500",
  },
  EXAM: {
    text: "text-emerald-500",
    border: "border-emerald-500/30 bg-emerald-500/10",
    bg: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
};

const STATUS_CONFIG: Record<
  AntiCheatWhitelistStatus,
  { label: string; text: string; border: string }
> = {
  ACTIVE: {
    label: "فعّال",
    text: "text-emerald-500",
    border: "border-emerald-500/30 bg-emerald-500/10",
  },
  EXPIRED: {
    label: "منتهي",
    text: "text-slate-500",
    border: "border-slate-500/30 bg-slate-500/10",
  },
  REVOKED: {
    label: "ملغي",
    text: "text-red-500",
    border: "border-red-500/30 bg-red-500/10",
  },
};

// ─────────────────────────────────────────────
//  الصفحة الرئيسية
// ─────────────────────────────────────────────
export default function WhitelistPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.LIVE_MONITOR_VIEW);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AntiCheatWhitelist | null>(null);

  // ── جلب البيانات ──
  const listQuery = useQuery({
    queryKey: ["admin", "anti-cheat", "whitelist"],
    queryFn: async () => {
      const response = await adminFetch("/api/admin/anti-cheat/whitelist");
      if (!response.ok) {
        // Fallback: مصفوفة فارغة
        return [] as AntiCheatWhitelist[];
      }
      const json = await response.json();
      return (json.data || json.items || []) as AntiCheatWhitelist[];
    },
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  const items = listQuery.data || [];

  // ── تصفية محلية ──
  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (
        search &&
        !item.targetName.toLowerCase().includes(search.toLowerCase()) &&
        !item.reason.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [items, typeFilter, statusFilter, search]);

  // ── طفرات ──
  const toggleStatus = useMutation({
    mutationFn: async (item: AntiCheatWhitelist) => {
      const newStatus = item.status === "ACTIVE" ? "REVOKED" : "ACTIVE";
      const response = await adminFetch(
        `/api/admin/anti-cheat/whitelist/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("فشل تحديث الحالة");
      return response.json();
    },
    onSuccess: (_data, item) => {
      const newStatus = item.status === "ACTIVE" ? "ملغي" : "فعّال";
      toast.success(`تم تغيير الحالة إلى: ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat", "whitelist"] });
      logAdminAction("UPDATE", "anti_cheat_whitelist", {
        entityId: item.id,
        entityName: item.targetName,
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(
        `/api/admin/anti-cheat/whitelist/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("فشل الحذف");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم الحذف من القائمة البيضاء");
      queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat", "whitelist"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── إحصاءات ──
  const stats = React.useMemo(() => {
    const byType: Record<string, number> = {};
    items.forEach((i) => {
      byType[i.type] = (byType[i.type] || 0) + 1;
    });
    return {
      total: items.length,
      active: items.filter((i) => i.status === "ACTIVE").length,
      expired: items.filter((i) => i.status === "EXPIRED").length,
      users: byType.USER || 0,
      ips: byType.IP || 0,
      devices: byType.DEVICE || 0,
      exams: byType.EXAM || 0,
    };
  }, [items]);

  // ── أعمدة الجدول ──
  const columns: ColumnDef<AntiCheatWhitelist>[] = React.useMemo(
    () => [
      {
        accessorKey: "type",
        header: "النوع",
        cell: ({ row }) => {
          const type = row.original.type;
          const cfg = TYPE_COLORS[type];
          const Icon = TYPE_ICONS[type];
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  cfg.border
                )}
              >
                <Icon className={cn("h-4 w-4", cfg.text)} />
              </div>
              <span className="text-xs font-black">{TYPE_LABELS[type]}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "targetName",
        header: "الهدف",
        cell: ({ row }) => (
          <div>
            <p className="text-xs font-black" dir="ltr">
              {row.original.targetName}
            </p>
            {row.original.targetId && (
              <p className="text-[10px] font-bold text-muted-foreground">
                ID: {row.original.targetId.slice(0, 12)}...
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: "السبب",
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-[200px] text-xs font-bold text-muted-foreground">
            {row.original.reason || "—"}
          </p>
        ),
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status];
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
        accessorKey: "expiresAt",
        header: "الانتهاء",
        cell: ({ row }) => {
          const exp = row.original.expiresAt;
          if (!exp) return <span className="text-[10px] font-bold text-emerald-500">دائم</span>;
          const isExpired = new Date(exp) < new Date();
          return (
            <div>
              <p className="text-[10px] font-black">{formatDate(exp)}</p>
              <p
                className={cn(
                  "text-[9px] font-bold",
                  isExpired ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {isExpired ? "منتهي" : timeAgo(exp)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "createdBy",
        header: "أضافه",
        cell: ({ row }) => (
          <span className="text-[10px] font-bold text-muted-foreground">
            {row.original.createdBy || "—"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "تاريخ الإضافة",
        cell: ({ row }) => (
          <span className="text-[10px] font-bold text-muted-foreground">
            {timeAgo(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "إجراءات",
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            onView={() => setEditingItem(row.original)}
            extraActions={[
              {
                icon: Edit,
                label: "تعديل",
                onClick: (item) => setEditingItem(item as AntiCheatWhitelist),
              },
              {
                icon: row.original.status === "ACTIVE" ? PowerOff : Power,
                label: row.original.status === "ACTIVE" ? "إلغاء" : "تفعيل",
                onClick: (item) => toggleStatus.mutate(item as AntiCheatWhitelist),
              },
              {
                icon: Trash2,
                label: "حذف",
                variant: "destructive",
                onClick: (item) => {
                  if (confirm(`حذف «${item.targetName}» من القائمة البيضاء؟`)) {
                    deleteItem.mutate(item.id);
                  }
                },
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, toggleStatus.mutate, deleteItem.mutate]
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="القائمة البيضاء"
        description="إدارة الاستثناءات والتصاريح المعفاة من كشف الغش."
        eyebrow="مكافحة الغش"
        badge={`${formatNumber(stats.total)} استثناء`}
        meta={
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            فعّال: {formatNumber(stats.active)} — منتهي: {formatNumber(stats.expired)}
          </div>
        }
      >
        <Link
          href="/admin/anti-cheat"
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-black text-muted-foreground transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة
        </Link>
        {canManage && (
          <AdminButton icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
            إضافة جديد
          </AdminButton>
        )}
      </PageHeader>

      <SubPageNav current="/admin/anti-cheat/whitelist" />

      {/* بطاقات الإحصاء */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="إجمالي الاستثناءات"
          value={stats.total}
          icon={ShieldCheck}
          color="text-emerald-500"
          loading={listQuery.isLoading}
        />
        <SummaryCard
          label="فعّالة حالياً"
          value={stats.active}
          icon={Power}
          color="text-blue-500"
          loading={listQuery.isLoading}
        />
        <SummaryCard
          label="مستخدمون"
          value={stats.users}
          icon={User}
          color="text-purple-500"
          loading={listQuery.isLoading}
        />
        <SummaryCard
          label="عناوين IP"
          value={stats.ips}
          icon={Globe}
          color="text-amber-500"
          loading={listQuery.isLoading}
        />
      </div>

      {/* فلاتر سريعة حسب النوع */}
      <div className="admin-glass flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 p-3">
        <span className="text-xs font-black text-muted-foreground ml-2">
          <Sparkles className="inline h-3.5 w-3.5 ml-1" />
          فلتر حسب النوع:
        </span>
        <FilterPill
          active={typeFilter === "all"}
          onClick={() => setTypeFilter("all")}
          label="الكل"
          count={stats.total}
        />
        {WHITELIST_TYPES.map((t) => {
          const Icon = TYPE_ICONS[t.value as keyof typeof TYPE_ICONS];
          const cfg = TYPE_COLORS[t.value as keyof typeof TYPE_COLORS];
          const count = (stats as Record<string, number>)[
            t.value === "USER"
              ? "users"
              : t.value === "IP"
              ? "ips"
              : t.value === "DEVICE"
              ? "devices"
              : "exams"
          ];
          return (
            <FilterPill
              key={t.value}
              active={typeFilter === t.value}
              onClick={() =>
                setTypeFilter(typeFilter === t.value ? "all" : t.value)
              }
              label={t.label}
              count={count ?? 0}
              icon={Icon}
              color={cfg.text}
            />
          );
        })}
      </div>

      {/* شريط البحث + فلاتر */}
      <div className="admin-glass flex flex-col gap-3 rounded-2xl border border-white/10 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الاستثناءات..."
            className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right"
            dir="rtl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="ACTIVE">فعّال</SelectItem>
            <SelectItem value="EXPIRED">منتهي</SelectItem>
            <SelectItem value="REVOKED">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* الجدول */}
      <div className="admin-glass rounded-[2rem] border border-white/10 p-1 shadow-2xl">
        <div className="p-4">
          <AdminDataTable
            columns={columns}
            data={filtered}
            loading={listQuery.isLoading}
            columnLabels={{
              type: "النوع",
              targetName: "الهدف",
              reason: "السبب",
              status: "الحالة",
              expiresAt: "الانتهاء",
              createdBy: "أضافه",
              createdAt: "تاريخ الإضافة",
              actions: "إجراءات",
            }}
            emptyMessage={{
              title: search || typeFilter !== "all" || statusFilter !== "all"
                ? "لا توجد نتائج"
                : "لا توجد استثناءات",
              description: search || typeFilter !== "all" || statusFilter !== "all"
                ? "حاول تعديل الفلاتر."
                : "أضف استثناءات لمنح إذن خاص لطلاب أو أجهزة معينة.",
            }}
          />
        </div>
      </div>

      <WhitelistDialog
        open={createOpen || !!editingItem}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditingItem(null);
          }
        }}
        item={editingItem}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "anti-cheat", "whitelist"] });
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  بطاقة إحصاء
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
//  شريحة فلتر النوع
// ─────────────────────────────────────────────
function FilterPill({
  active,
  onClick,
  label,
  count,
  icon: Icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-all",
        "hover:scale-105 active:scale-95",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
      )}
    >
      {Icon && <Icon className={cn("h-3.5 w-3.5", color)} />}
      {label}
      <span className="rounded-md bg-black/30 px-1.5 text-[10px] font-black">
        {formatNumber(count)}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
//  نموذج إضافة/تعديل استثناء
// ─────────────────────────────────────────────
function WhitelistDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AntiCheatWhitelist | null;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<{
    type: AntiCheatWhitelist["type"];
    targetId: string;
    targetName: string;
    reason: string;
    expiresAt: string;
    status: AntiCheatWhitelistStatus;
  }>({
    type: "USER",
    targetId: "",
    targetName: "",
    reason: "",
    expiresAt: "",
    status: "ACTIVE",
  });

  React.useEffect(() => {
    if (item) {
      setForm({
        type: item.type,
        targetId: item.targetId,
        targetName: item.targetName,
        reason: item.reason,
        expiresAt: item.expiresAt ? (item.expiresAt.split("T")[0] ?? "") : "",
        status: item.status,
      });
    } else {
      setForm({
        type: "USER",
        targetId: "",
        targetName: "",
        reason: "",
        expiresAt: "",
        status: "ACTIVE",
      });
    }
  }, [item, open]);

  const save = useMutation({
    mutationFn: async () => {
      const url = item
        ? `/api/admin/anti-cheat/whitelist/${item.id}`
        : "/api/admin/anti-cheat/whitelist";
      const method = item ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        type: form.type,
        targetId: form.targetId,
        targetName: form.targetName,
        reason: form.reason,
        status: form.status,
      };
      if (form.expiresAt) body.expiresAt = new Date(form.expiresAt).toISOString();

      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("فشل الحفظ");
      return response.json();
    },
    onSuccess: () => {
      toast.success(item ? "تم التحديث" : "تمت الإضافة إلى القائمة البيضاء");
      onSaved();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            {item ? "تعديل استثناء" : "إضافة استثناء جديد"}
          </DialogTitle>
          <DialogDescription>
            إضافة طالب أو جهاز أو عنوان IP إلى القائمة البيضاء
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>نوع الاستثناء</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm({ ...form, type: v as AntiCheatWhitelist["type"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WHITELIST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>المعرّف (ID / IP / Device ID)</Label>
            <Input
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              placeholder="مثال: user_123 أو 192.168.1.1"
              dir="ltr"
            />
          </div>

          <div>
            <Label>اسم وصفي</Label>
            <Input
              value={form.targetName}
              onChange={(e) => setForm({ ...form, targetName: e.target.value })}
              placeholder="اسم يصف هذا الاستثناء"
            />
          </div>

          <div>
            <Label>سبب الإضافة</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="لماذا تمت إضافة هذا الاستثناء؟"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>تاريخ الانتهاء (اختياري)</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as AntiCheatWhitelistStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">فعّال</SelectItem>
                  <SelectItem value="REVOKED">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <AdminButton variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            icon={ShieldCheck}
            onClick={() => save.mutate()}
            loading={save.isPending}
          >
            {item ? "حفظ التغييرات" : "إضافة"}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
