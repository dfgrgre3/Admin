"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  affiliateApi,
  type AffiliatePayout,
  type PayoutStatus,
} from "@/lib/api/affiliate-api";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import {
  Plus,
  Trash2,
  Loader2,
  Download,
  Search,
  Receipt,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusLabels: Record<PayoutStatus, { label: string; color: string }> = {
  PENDING: { label: "معلقة", color: "bg-amber-500/15 text-amber-700" },
  PROCESSING: { label: "قيد المعالجة", color: "bg-blue-500/15 text-blue-700" },
  PAID: { label: "مدفوعة", color: "bg-green-500/15 text-green-700" },
  FAILED: { label: "فشلت", color: "bg-red-500/15 text-red-700" },
  CANCELLED: { label: "ملغاة", color: "bg-zinc-500/15 text-zinc-600" },
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) : "—";

const formatCurrency = (n: number, currency = "EGP") =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n) + " " + currency;

type StatusFilter = "ALL" | PayoutStatus;

export default function AffiliatePayoutsPage() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [statusTarget, setStatusTarget] = React.useState<{ payout: AffiliatePayout; next: PayoutStatus } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliate-payouts", statusFilter],
    queryFn: () =>
      affiliateApi.listPayouts({
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status: PayoutStatus; reference?: string; notes?: string } }) =>
      affiliateApi.markPayoutStatus(id, body),
    onSuccess: (_res, vars) => {
      toast.success(`تم تحديث الحالة إلى ${statusLabels[vars.body.status].label}`);
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-payouts"] });
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-analytics"] });
      setStatusTarget(null);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل التحديث"),
  });

  const filtered = data ?? [];

  const columns = React.useMemo<ColumnDef<AffiliatePayout>[]>(
    () => [
      {
        id: "affiliate",
        header: "المسوق",
        cell: ({ row }) => {
          const a = row.original.affiliate;
          if (!a) return <span className="text-muted-foreground text-xs">غير معروف</span>;
          return (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="w-8 h-8">
                <AvatarImage src={a.user?.avatar} />
                <AvatarFallback>
                  {(a.user?.name || a.user?.username || a.code).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {a.user?.name || a.user?.username || a.user?.email || a.code}
                </div>
                <div className="text-xs text-muted-foreground">{a.code}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "amount",
        header: "المبلغ",
        cell: ({ row }) => (
          <div className="font-bold text-green-600">
            {formatCurrency(row.original.amount, row.original.currency)}
          </div>
        ),
      },
      {
        id: "status",
        header: "الحالة",
        cell: ({ row }) => {
          const s = row.original.status;
          return <Badge className={statusLabels[s].color}>{statusLabels[s].label}</Badge>;
        },
      },
      {
        id: "method",
        header: "طريقة الدفع",
        cell: ({ row }) => row.original.method || "—",
      },
      {
        id: "reference",
        header: "المرجع",
        cell: ({ row }) =>
          row.original.reference ? (
            <span className="text-xs font-mono">{row.original.reference}</span>
          ) : (
            "—"
          ),
      },
      {
        id: "processedAt",
        header: "تاريخ المعالجة",
        cell: ({ row }) => formatDate(row.original.processedAt),
      },
      {
        id: "createdAt",
        header: "تاريخ الإنشاء",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          const actions: { label: string; icon: React.ReactNode; onClick: () => void; destructive?: boolean }[] = [];

          if (p.status === "PENDING") {
            actions.push({
              label: "تأكيد كم مدفوعة",
              icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
              onClick: () => setStatusTarget({ payout: p, next: "PAID" }),
            });
            actions.push({
              label: "بدء المعالجة",
              icon: <PlayCircle className="w-4 h-4 text-blue-600" />,
              onClick: () => setStatusTarget({ payout: p, next: "PROCESSING" }),
            });
            actions.push({
              label: "إلغاء",
              icon: <XCircle className="w-4 h-4 text-zinc-600" />,
              onClick: () => setStatusTarget({ payout: p, next: "CANCELLED" }),
            });
          } else if (p.status === "PROCESSING") {
            actions.push({
              label: "تأكيد كم مدفوعة",
              icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
              onClick: () => setStatusTarget({ payout: p, next: "PAID" }),
            });
            actions.push({
              label: "فشل",
              icon: <XCircle className="w-4 h-4 text-red-600" />,
              onClick: () => setStatusTarget({ payout: p, next: "FAILED" }),
            });
          } else if (p.status === "FAILED" || p.status === "CANCELLED") {
            actions.push({
              label: "إعادة كمعلقة",
              icon: <RotateCcw className="w-4 h-4 text-amber-600" />,
              onClick: () => setStatusTarget({ payout: p, next: "PENDING" }),
            });
          }

          return actions.length > 0 ? (
            <RowActions
              row={row.original}
              extraActions={actions.map((a) => ({
                label: a.label,
                icon: a.icon as unknown as React.ElementType,
                onClick: a.onClick,
                variant: a.destructive ? "destructive" : "default",
              }))}
            />
          ) : null;
        },
      },
    ],
    []
  );

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const cols: ExportColumn<AffiliatePayout>[] = [
      { header: "المسوق", accessor: (p) => p.affiliate?.code || p.affiliateId },
      { header: "المبلغ", accessor: (p) => p.amount },
      { header: "العملة", accessor: (p) => p.currency },
      { header: "الحالة", accessor: (p) => statusLabels[p.status].label },
      { header: "الطريقة", accessor: (p) => p.method || "" },
      { header: "المرجع", accessor: (p) => p.reference || "" },
      { header: "تاريخ الإنشاء", accessor: (p) => formatDate(p.createdAt) },
      { header: "تاريخ المعالجة", accessor: (p) => formatDate(p.processedAt) },
    ];
    exportToCSV(filtered, cols, "affiliate-payouts");
  };

  const totals = React.useMemo(() => {
    return {
      total: filtered.reduce((s, p) => s + p.amount, 0),
      pending: filtered.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0),
      paid: filtered.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0),
      count: filtered.length,
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="المدفوعات"
        description="سجل صرف العمولات للمسوقين (معلقة، معالجة، مدفوعة)"
      >
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" /> تصدير
          </AdminButton>
          <AdminButton onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 ml-2" /> مدفوعة يدوية
          </AdminButton>
        </div>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="إجمالي المدفوعات" value={formatCurrency(totals.total)} color="blue" icon={<Receipt className="w-4 h-4" />} />
        <StatCard label="معلقة" value={formatCurrency(totals.pending)} color="amber" icon={<Receipt className="w-4 h-4" />} />
        <StatCard label="مدفوعة" value={formatCurrency(totals.paid)} color="green" icon={<CheckCircle2 className="w-4 h-4" />} />
        <StatCard label="عدد العمليات" value={String(totals.count)} color="violet" icon={<Receipt className="w-4 h-4" />} />
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="ALL">الكل</TabsTrigger>
          <TabsTrigger value="PENDING">معلقة</TabsTrigger>
          <TabsTrigger value="PROCESSING">قيد المعالجة</TabsTrigger>
          <TabsTrigger value="PAID">مدفوعة</TabsTrigger>
          <TabsTrigger value="FAILED">فشلت</TabsTrigger>
          <TabsTrigger value="CANCELLED">ملغاة</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminDataTable columns={columns} data={filtered} emptyMessage={{ title: "لا توجد مدفوعات", description: "لم يتم العثور على مدفوعات بالمعايير المحددة" }} />
      )}

      <CreatePayoutDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={(o) => !o && setStatusTarget(null)}
        title="تأكيد العملية"
        description={
          statusTarget
            ? `هل تريد تغيير حالة المدفوعة ${formatCurrency(statusTarget.payout.amount, statusTarget.payout.currency)} إلى "${statusLabels[statusTarget.next].label}" ?`
            : ""
        }
        onConfirm={() => {
          if (statusTarget) {
            updateStatusMutation.mutate({
              id: statusTarget.payout.id,
              body: { status: statusTarget.next },
            });
          }
        }}
        loading={updateStatusMutation.isPending}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: "blue" | "green" | "amber" | "violet";
  icon: React.ReactNode;
}) {
  const colorClass: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600",
    green: "from-green-500/10 to-green-500/5 text-green-600",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600",
  };
  return (
    <div className="border rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colorClass[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Payout Dialog (manual)
// ---------------------------------------------------------------------------

function CreatePayoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();

  const [affiliateId, setAffiliateId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [currency, setCurrency] = React.useState("EGP");
  const [method, setMethod] = React.useState("BANK");
  const [reference, setReference] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Load affiliates for selector
  const { data: affiliates } = useQuery({
    queryKey: ["admin", "affiliates", "active"],
    queryFn: () => affiliateApi.list(),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      affiliateApi.createPayout({
        affiliateId,
        amount: Number(amount),
        currency,
        method,
        reference: reference || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      toast.success("تم إنشاء المدفوعة");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-payouts"] });
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-analytics"] });
      onOpenChange(false);
      setAffiliateId("");
      setAmount("");
      setReference("");
      setNotes("");
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل إنشاء المدفوعة"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء مدفوعة يدوية</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="المسوق">
            <Select value={affiliateId} onValueChange={setAffiliateId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المسوق" />
              </SelectTrigger>
              <SelectContent>
                {(affiliates ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.user?.name || a.user?.username || a.user?.email || a.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="المبلغ">
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="العملة">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="USD">دولار (USD)</SelectItem>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="طريقة الدفع">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK">تحويل بنكي</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="VODAFONE_CASH">فودافون كاش</SelectItem>
                <SelectItem value="INSTAPAY">InstaPay</SelectItem>
                <SelectItem value="MANUAL">يدوي</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="مرجع (Reference)">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <Field label="ملاحظات">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            disabled={!affiliateId || !amount || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            إنشاء
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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