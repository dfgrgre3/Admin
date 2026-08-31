"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { affiliateApi, type AffiliateCampaign, type CampaignStatus } from "@/lib/api/affiliate-api";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Download,
  Megaphone,
  Calendar,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusLabels: Record<CampaignStatus, { label: string; color: string }> = {
  DRAFT: { label: "مسودة", color: "bg-gray-500/15 text-gray-600" },
  ACTIVE: { label: "نشطة", color: "bg-green-500/15 text-green-700" },
  PAUSED: { label: "متوقفة", color: "bg-amber-500/15 text-amber-700" },
  ARCHIVED: { label: "مؤرشفة", color: "bg-zinc-500/15 text-zinc-600" },
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }) : "—";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n) + " ج.م";

type StatusFilter = "ALL" | CampaignStatus;

export default function AffiliateCampaignsPage() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AffiliateCampaign | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AffiliateCampaign | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliate-campaigns", statusFilter, search],
    queryFn: () =>
      affiliateApi.listCampaigns({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        q: search || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => affiliateApi.deleteCampaign(id),
    onSuccess: () => {
      toast.success("تم حذف الحملة");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-campaigns"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("فشل حذف الحملة"),
  });

  const filtered = data ?? [];

  const columns = React.useMemo<ColumnDef<AffiliateCampaign>[]>(
    () => [
      {
        id: "name",
        header: "الحملة",
        accessorKey: "name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">/{row.original.slug}</div>
          </div>
        ),
      },
      {
        id: "status",
        header: "الحالة",
        accessorKey: "status",
        cell: ({ row }) => {
          const s = row.original.status;
          const meta = statusLabels[s];
          return <Badge className={meta.color}>{meta.label}</Badge>;
        },
      },
      {
        id: "period",
        header: "الفترة",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(row.original.startDate)} → {formatDate(row.original.endDate)}
          </div>
        ),
      },
      {
        id: "commission",
        header: "العمولة",
        cell: ({ row }) =>
          row.original.commissionRate != null
            ? `${row.original.commissionRate}%`
            : "—",
      },
      {
        id: "budget",
        header: "الميزانية",
        cell: ({ row }) =>
          row.original.budget != null
            ? `${formatCurrency(row.original.budget)}`
            : "—",
      },
      {
        id: "spent",
        header: "الإنفاق",
        cell: ({ row }) => formatCurrency(row.original.spent),
      },
      {
        id: "promo",
        header: "كود الخصم",
        cell: ({ row }) => row.original.promoCode || "—",
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
            ]}
          />
        ),
      },
    ],
    []
  );

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const cols: ExportColumn<AffiliateCampaign>[] = [
      { header: "الاسم", accessor: (c) => c.name },
      { header: "المعرف", accessor: (c) => c.slug },
      { header: "الحالة", accessor: (c) => statusLabels[c.status]?.label || c.status },
      { header: "تاريخ البدء", accessor: (c) => formatDate(c.startDate) },
      { header: "تاريخ الانتهاء", accessor: (c) => formatDate(c.endDate) },
      { header: "العمولة %", accessor: (c) => c.commissionRate ?? "" },
      { header: "الميزانية", accessor: (c) => c.budget ?? "" },
      { header: "الإنفاق", accessor: (c) => c.spent },
      { header: "كود الخصم", accessor: (c) => c.promoCode || "" },
    ];
    exportToCSV(filtered, cols, "affiliate-campaigns");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحملات التسويقية"
        description="إدارة الحملات التي ينضم إليها المسوقون بالعمولة"
      >
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" /> تصدير
          </AdminButton>
          <AdminButton onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" /> حملة جديدة
          </AdminButton>
        </div>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="ALL">الكل</TabsTrigger>
            <TabsTrigger value="DRAFT">مسودة</TabsTrigger>
            <TabsTrigger value="ACTIVE">نشطة</TabsTrigger>
            <TabsTrigger value="PAUSED">متوقفة</TabsTrigger>
            <TabsTrigger value="ARCHIVED">مؤرشفة</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الكود..."
            className="pr-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => { setEditing(null); setFormOpen(true); }} />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          emptyMessage={{ title: "لا توجد حملات", description: "لم يتم العثور على حملات بالمعايير المحددة" }}
        />
      )}

      <CampaignFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        campaign={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف الحملة"
        description={`هل أنت متأكد من حذف حملة "${deleteTarget?.name}" ?`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed rounded-xl p-10 text-center">
      <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground mb-4">لا توجد حملات حتى الآن</p>
      <AdminButton onClick={onAdd}>
        <Plus className="w-4 h-4 ml-2" /> إنشاء أول حملة
      </AdminButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Form Dialog
// ---------------------------------------------------------------------------

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: AffiliateCampaign | null;
}

function CampaignFormDialog({ open, onOpenChange, campaign }: CampaignFormDialogProps) {
  const qc = useQueryClient();

  const [form, setForm] = React.useState({
    name: "",
    slug: "",
    description: "",
    status: "DRAFT" as CampaignStatus,
    startDate: "",
    endDate: "",
    commissionRate: "",
    budget: "",
    bannerUrl: "",
    landingUrl: "",
    promoCode: "",
  });

  React.useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description || "",
        status: campaign.status,
        startDate: campaign.startDate ? campaign.startDate.substring(0, 10) : "",
        endDate: campaign.endDate ? campaign.endDate.substring(0, 10) : "",
        commissionRate: campaign.commissionRate?.toString() || "",
        budget: campaign.budget?.toString() || "",
        bannerUrl: campaign.bannerUrl || "",
        landingUrl: campaign.landingUrl || "",
        promoCode: campaign.promoCode || "",
      });
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        status: "DRAFT",
        startDate: "",
        endDate: "",
        commissionRate: "",
        budget: "",
        bannerUrl: "",
        landingUrl: "",
        promoCode: "",
      });
    }
  }, [campaign, open]);

  const createMutation = useMutation({
    mutationFn: (body: Partial<AffiliateCampaign>) => affiliateApi.createCampaign(body),
    onSuccess: () => {
      toast.success("تم إنشاء الحملة");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-campaigns"] });
      onOpenChange(false);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل إنشاء الحملة"),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<AffiliateCampaign>) =>
      affiliateApi.updateCampaign(campaign!.id, body),
    onSuccess: () => {
      toast.success("تم تحديث الحملة");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-campaigns"] });
      onOpenChange(false);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل التحديث"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    const body: Partial<AffiliateCampaign> = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      commissionRate: form.commissionRate ? Number(form.commissionRate) : undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      bannerUrl: form.bannerUrl || undefined,
      landingUrl: form.landingUrl || undefined,
      promoCode: form.promoCode || undefined,
    };
    if (campaign) {
      updateMutation.mutate(body);
    } else {
      createMutation.mutate(body);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "تعديل الحملة" : "حملة جديدة"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم *" full>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="المعرف (slug)">
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto من الاسم"
              />
            </Field>
            <Field label="الحالة" full>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                <option value="DRAFT">مسودة</option>
                <option value="ACTIVE">نشطة</option>
                <option value="PAUSED">متوقفة</option>
                <option value="ARCHIVED">مؤرشفة</option>
              </select>
            </Field>
            <Field label="تاريخ البدء">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="تاريخ الانتهاء">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
            <Field label="نسبة العمولة %">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
              />
            </Field>
            <Field label="الميزانية (ج.م)">
              <Input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </Field>
            <Field label="كود الخصم">
              <Input value={form.promoCode} onChange={(e) => setForm({ ...form, promoCode: e.target.value })} />
            </Field>
            <Field label="رابط البنر" full>
              <Input value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} />
            </Field>
            <Field label="رابط صفحة الهبوط" full>
              <Input value={form.landingUrl} onChange={(e) => setForm({ ...form, landingUrl: e.target.value })} />
            </Field>
            <Field label="الوصف" full>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter>
            <AdminButton variant="outline" type="button" onClick={() => onOpenChange(false)}>
              إلغاء
            </AdminButton>
            <AdminButton type="submit" disabled={isPending}>
              {isPending ? "جارٍ الحفظ..." : campaign ? "حفظ التغييرات" : "إنشاء الحملة"}
            </AdminButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}