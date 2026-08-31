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
  type AffiliateLink,
  type AffiliateCampaign,
} from "@/lib/api/affiliate-api";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Download,
  Search,
  Link2,
  Copy,
  ExternalLink,
  MousePointerClick,
  TrendingUp,
  Power,
  PowerOff,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("ar-EG", { dateStyle: "short" }) : "—";

export default function AffiliateLinksPage() {
  const qc = useQueryClient();

  const [campaignFilter, setCampaignFilter] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AffiliateLink | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AffiliateLink | null>(null);

  const { data: links, isLoading } = useQuery({
    queryKey: ["admin", "affiliate-links"],
    queryFn: () => affiliateApi.listLinks(),
  });

  const { data: campaigns } = useQuery({
    queryKey: ["admin", "affiliate-campaigns", "all"],
    queryFn: () => affiliateApi.listCampaigns(),
  });

  const { data: affiliates } = useQuery({
    queryKey: ["admin", "affiliates", "all"],
    queryFn: () => affiliateApi.list(),
  });

  const filtered = React.useMemo(() => {
    let list = links ?? [];
    if (campaignFilter !== "ALL") {
      list = list.filter((l) => l.campaignId === campaignFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.slug.toLowerCase().includes(q) ||
          l.destinationUrl.toLowerCase().includes(q)
      );
    }
    return list;
  }, [links, campaignFilter, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => affiliateApi.deleteLink(id),
    onSuccess: () => {
      toast.success("تم حذف الرابط");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-links"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("فشل الحذف"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      affiliateApi.updateLink(id, { active }),
    onSuccess: (_res, vars) => {
      toast.success(vars.active ? "تم تفعيل الرابط" : "تم إيقاف الرابط");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-links"] });
    },
  });

  const copyTrackingUrl = async (link: AffiliateLink) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const aff = link.affiliate?.code || "code";
    const url = `${base}/r/${aff}/${link.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ رابط التتبع");
    } catch {
      toast.error(url);
    }
  };

  const columns = React.useMemo<ColumnDef<AffiliateLink>[]>(
    () => [
      {
        id: "name",
        header: "الاسم",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">/{row.original.slug}</div>
          </div>
        ),
      },
      {
        id: "affiliate",
        header: "المسوق",
        cell: ({ row }) => {
          const a = row.original.affiliate;
          return a ? (
            <div className="text-xs">
              <div className="font-medium">{a.user?.name || a.user?.username || a.code}</div>
              <div className="text-muted-foreground">{a.code}</div>
            </div>
          ) : (
            "—"
          );
        },
      },
      {
        id: "campaign",
        header: "الحملة",
        cell: ({ row }) => row.original.campaign?.name || "—",
      },
      {
        id: "destination",
        header: "الوجهة",
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate text-xs" title={row.original.destinationUrl}>
            <ExternalLink className="w-3 h-3 inline-block ml-1 text-muted-foreground" />
            {row.original.destinationUrl}
          </div>
        ),
      },
      {
        id: "clicks",
        header: "النقرات",
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-bold">{row.original.clicksCount}</div>
            <div className="text-xs text-muted-foreground">
              تحويل: {row.original.conversionsCount}
              {row.original.clicksCount > 0 && (
                <span className="text-green-600">
                  {" "}
                  ({((row.original.conversionsCount / row.original.clicksCount) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "status",
        header: "الحالة",
        cell: ({ row }) =>
          row.original.active ? (
            <Badge className="bg-green-500/15 text-green-700">نشط</Badge>
          ) : (
            <Badge variant="secondary">معطل</Badge>
          ),
      },
      {
        id: "createdAt",
        header: "تاريخ الإنشاء",
        cell: ({ row }) => formatDate(row.original.createdAt),
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
                label: "نسخ رابط التتبع",
                icon: Copy,
                onClick: () => copyTrackingUrl(row.original),
              },
              {
                label: row.original.active ? "إيقاف" : "تفعيل",
                icon: row.original.active ? PowerOff : Power,
                onClick: () =>
                  toggleActive.mutate({ id: row.original.id, active: !row.original.active }),
              },
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
                onClick: () => setDeleteTarget(row.original),
                variant: "destructive" as const,
              },
            ]}
          />
        ),
      },
    ],
    [toggleActive]
  );

  const totals = React.useMemo(() => {
    return {
      links: filtered.length,
      clicks: filtered.reduce((s, l) => s + l.clicksCount, 0),
      conversions: filtered.reduce((s, l) => s + l.conversionsCount, 0),
    };
  }, [filtered]);

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const cols: ExportColumn<AffiliateLink>[] = [
      { header: "الاسم", accessor: (l) => l.name },
      { header: "المعرف", accessor: (l) => l.slug },
      { header: "المسوق", accessor: (l) => l.affiliate?.code || "" },
      { header: "الحملة", accessor: (l) => l.campaign?.name || "" },
      { header: "الوجهة", accessor: (l) => l.destinationUrl },
      { header: "النقرات", accessor: (l) => l.clicksCount },
      { header: "التحويلات", accessor: (l) => l.conversionsCount },
      { header: "الحالة", accessor: (l) => (l.active ? "نشط" : "معطل") },
    ];
    exportToCSV(filtered, cols, "affiliate-links");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="روابط التتبع"
        description="مولّد الروابط القابلة للتتبع لتحليل أداء كل قناة"
      >
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" /> تصدير
          </AdminButton>
          <AdminButton onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" /> رابط جديد
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid gap-4 grid-cols-3">
        <StatCard label="إجمالي الروابط" value={totals.links} icon={<Link2 className="w-4 h-4" />} color="blue" />
        <StatCard label="إجمالي النقرات" value={totals.clicks} icon={<MousePointerClick className="w-4 h-4" />} color="violet" />
        <StatCard
          label="معدل التحويل"
          value={`${totals.clicks > 0 ? ((totals.conversions / totals.clicks) * 100).toFixed(2) : "0"}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="green"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="md:w-[220px]">
            <SelectValue placeholder="كل الحملات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الحملات</SelectItem>
            {(campaigns ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو المعرف..."
            className="pr-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminDataTable columns={columns} data={filtered} emptyMessage={{ title: "لا توجد روابط", description: "لم يتم العثور على روابط بالمعايير المحددة" }} />
      )}

      <LinkFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        link={editing}
        campaigns={campaigns ?? []}
        affiliates={affiliates ?? []}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف الرابط"
        description={`هل تريد حذف الرابط "${deleteTarget?.name}" ?`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "violet";
}) {
  const colorClass: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600",
    green: "from-green-500/10 to-green-500/5 text-green-600",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600",
  };
  return (
    <div className="border rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colorClass[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Link Form Dialog
// ---------------------------------------------------------------------------

interface LinkFormDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  link: AffiliateLink | null;
  campaigns: AffiliateCampaign[];
  affiliates: { id: string; code: string; user?: { name?: string; username?: string; email?: string } }[];
}

function LinkFormDialog({ open, onOpenChange, link, campaigns, affiliates }: LinkFormDialogProps) {
  const qc = useQueryClient();

  const [form, setForm] = React.useState({
    affiliateId: "",
    campaignId: "",
    name: "",
    slug: "",
    destinationUrl: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    active: true,
  });

  React.useEffect(() => {
    if (link) {
      setForm({
        affiliateId: link.affiliateId,
        campaignId: link.campaignId || "",
        name: link.name,
        slug: link.slug,
        destinationUrl: link.destinationUrl,
        utmSource: link.utmSource || "",
        utmMedium: link.utmMedium || "",
        utmCampaign: link.utmCampaign || "",
        active: link.active,
      });
    } else {
      setForm({
        affiliateId: affiliates[0]?.id || "",
        campaignId: "",
        name: "",
        slug: "",
        destinationUrl: "",
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        active: true,
      });
    }
  }, [link, open, affiliates]);

  const createMutation = useMutation({
    mutationFn: () =>
      affiliateApi.createLink({
        affiliateId: form.affiliateId,
        campaignId: form.campaignId || undefined,
        name: form.name,
        slug: form.slug || undefined,
        destinationUrl: form.destinationUrl,
        utmSource: form.utmSource || undefined,
        utmMedium: form.utmMedium || undefined,
        utmCampaign: form.utmCampaign || undefined,
      }),
    onSuccess: () => {
      toast.success("تم إنشاء الرابط");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-links"] });
      onOpenChange(false);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل الإنشاء"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      affiliateApi.updateLink(link!.id, {
        name: form.name,
        destinationUrl: form.destinationUrl,
        utmSource: form.utmSource || undefined,
        utmMedium: form.utmMedium || undefined,
        utmCampaign: form.utmCampaign || undefined,
        active: form.active,
        campaignId: form.campaignId || "",
      }),
    onSuccess: () => {
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["admin", "affiliate-links"] });
      onOpenChange(false);
    },
    onError: (err: any) =>
      toast.error(err?.message || "فشل التحديث"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? "تعديل الرابط" : "رابط تتبع جديد"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="المسوق *">
            <Select
              value={form.affiliateId}
              onValueChange={(v) => setForm({ ...form, affiliateId: v })}
              disabled={!!link}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المسوق" />
              </SelectTrigger>
              <SelectContent>
                {affiliates.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.user?.name || a.user?.username || a.user?.email || a.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="الحملة">
            <Select value={form.campaignId || "NONE"} onValueChange={(v) => setForm({ ...form, campaignId: v === "NONE" ? "" : v })}>
              <SelectTrigger>
                <SelectValue placeholder="بدون حملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">بدون حملة</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="المعرف (slug)">
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="تلقائي من الاسم"
                disabled={!!link}
              />
            </Field>
          </div>
          <Field label="الرابط الوجهة *">
            <Input
              value={form.destinationUrl}
              onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
              placeholder="https://example.com/landing"
              dir="ltr"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="UTM Source">
              <Input value={form.utmSource} onChange={(e) => setForm({ ...form, utmSource: e.target.value })} />
            </Field>
            <Field label="UTM Medium">
              <Input value={form.utmMedium} onChange={(e) => setForm({ ...form, utmMedium: e.target.value })} />
            </Field>
            <Field label="UTM Campaign">
              <Input value={form.utmCampaign} onChange={(e) => setForm({ ...form, utmCampaign: e.target.value })} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            disabled={!form.affiliateId || !form.name || !form.destinationUrl || isPending}
            onClick={() => (link ? updateMutation.mutate() : createMutation.mutate())}
          >
            {isPending ? "جارٍ الحفظ..." : link ? "حفظ" : "إنشاء"}
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