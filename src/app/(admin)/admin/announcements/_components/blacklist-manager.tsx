"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Plus,
  Trash2,
  Search,
  Upload,
  Download,
  Users,
  ShieldOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export type BlacklistType = "USER" | "ROLE" | "GRADE" | "EMAIL_DOMAIN" | "DEVICE";

export interface BlacklistEntry {
  id: string;
  type: BlacklistType;
  value: string;
  /** اسم المستخدم (إن أمكن) */
  userName?: string;
  reason?: string;
  addedBy?: string;
  addedByName?: string;
  expiresAt?: string | null;
  createdAt: string;
}

interface BlacklistManagerProps {
  /** تقييد على إعلان معين */
  announcementId?: string;
  className?: string;
}

const TYPE_META: Record<BlacklistType, { label: string; icon: React.ElementType; color: string; placeholder: string }> = {
  USER: {
    label: "مستخدم",
    icon: Users,
    color: "bg-blue-500/15 text-blue-500",
    placeholder: "معرّف المستخدم (User ID)",
  },
  ROLE: {
    label: "دور",
    icon: ShieldOff,
    color: "bg-violet-500/15 text-violet-500",
    placeholder: "اسم الدور (مثل: students, instructors)",
  },
  GRADE: {
    label: "صف/مستوى",
    icon: ShieldOff,
    color: "bg-amber-500/15 text-amber-500",
    placeholder: "اسم الصف (e.g. grade-10)",
  },
  EMAIL_DOMAIN: {
    label: "نطاق بريد",
    icon: ShieldOff,
    color: "bg-rose-500/15 text-rose-500",
    placeholder: "النطاق (مثل: spam.com)",
  },
  DEVICE: {
    label: "جهاز",
    icon: ShieldOff,
    color: "bg-cyan-500/15 text-cyan-500",
    placeholder: "نوع الجهاز (mobile, tablet, desktop)",
  },
};

/**
 * مكوّن إدارة القائمة السوداء - يستثني مستخدمين/أدوار/نطاقات بريد
 * من استقبال إعلانات معينة أو كل الإعلانات
 */
export function BlacklistManager({ announcementId, className }: BlacklistManagerProps) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "blacklist", announcementId, search, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (announcementId) params.set("announcementId", announcementId);
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      params.set("limit", "50");
      const res = await adminFetch(`/api/admin/announcements/blacklist?${params.toString()}`);
      if (!res.ok) return { items: [] as BlacklistEntry[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.items as BlacklistEntry[]) ||
          (json?.data?.entries as BlacklistEntry[]) ||
          (json?.items as BlacklistEntry[]) ||
          [],
      };
    },
    staleTime: 30000,
  });

  const entries = data?.items || [];

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/announcements/blacklist/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم رفع الحظر");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "blacklist"] });
      setDeletingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // إحصائيات
  const stats = React.useMemo(() => {
    const map: Record<BlacklistType, number> = {
      USER: 0,
      ROLE: 0,
      GRADE: 0,
      EMAIL_DOMAIN: 0,
      DEVICE: 0,
    };
    entries.forEach((e) => {
      map[e.type]++;
    });
    return map;
  }, [entries]);

  const exportBlacklist = () => {
    const csv = [
      ["النوع", "القيمة", "السبب", "أضيف بواسطة", "تاريخ الإضافة"].join(","),
      ...entries.map((e) =>
        [
          e.type,
          `"${(e.value || "").replace(/"/g, '""')}"`,
          `"${(e.reason || "").replace(/"/g, '""')}"`,
          e.addedByName || "",
          e.createdAt,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blacklist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تصدير ${entries.length} عنصر`);
  };

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-500">
            <Ban className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">القائمة السوداء</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              {entries.length} عنصر محظور
              {announcementId && " (لهذا الإعلان فقط)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <AdminButton
            type="button"
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={exportBlacklist}
            disabled={entries.length === 0}
          >
            تصدير
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            icon={Upload}
            onClick={() => setBulkOpen(true)}
          >
            استيراد
          </AdminButton>
          <AdminButton
            type="button"
            variant="gradient"
            size="sm"
            icon={Plus}
            onClick={() => setAddOpen(true)}
          >
            إضافة
          </AdminButton>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-5 gap-1">
        {(Object.keys(TYPE_META) as BlacklistType[]).map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          const active = typeFilter === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(active ? "all" : t)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 transition",
                active
                  ? "border-red-500 bg-red-500/10"
                  : "border-white/10 bg-white/2.5 hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-3 w-3", active ? "text-red-500" : meta.color.split(" ")[1])} />
              <span className="text-[9px] font-black">{meta.label}</span>
              <span className="font-mono text-xs font-black">{stats[t]}</span>
            </button>
          );
        })}
      </div>

      {/* بحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في القائمة السوداء..."
          className="pr-9 text-xs"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-8 text-center text-xs font-bold text-muted-foreground">
          <Ban className="h-6 w-6 opacity-40" />
          القائمة السوداء فارغة
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="space-y-1.5">
          {entries.map((entry) => {
            const meta = TYPE_META[entry.type];
            const Icon = meta.icon;
            const isExpired = entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now();
            return (
              <div
                key={entry.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border bg-white/2.5 p-2 transition",
                  isExpired ? "border-slate-500/30 opacity-60" : "border-white/10 hover:bg-white/5"
                )}
              >
                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", meta.color)}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[9px] font-black">
                      {meta.label}
                    </Badge>
                    <p className="truncate font-mono text-[10px] font-black" dir="ltr">
                      {entry.value}
                    </p>
                    {isExpired && (
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        منتهي الصلاحية
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[9px] font-bold text-muted-foreground">
                    {entry.reason && `السبب: ${entry.reason} • `}
                    أضيف {formatDateTime(entry.createdAt)}
                    {entry.expiresAt && !isExpired && ` • ينتهي ${formatDateTime(entry.expiresAt)}`}
                  </p>
                </div>
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setDeletingId(entry.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                  aria-label="رفع الحظر"
                />
              </div>
            );
          })}
        </div>
      )}

      <AddBlacklistDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        announcementId={announcementId}
      />

      <BulkImportDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        announcementId={announcementId}
      />

      <AdminConfirm
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title="رفع الحظر"
        description="هل تريد رفع الحظر عن هذا العنصر؟"
        confirmText="رفع الحظر"
        variant="destructive"
        onConfirm={() => deletingId && remove.mutate(deletingId)}
        loading={remove.isPending}
      />
    </div>
  );
}

/* ───────── Dialog إضافة ───────── */

function AddBlacklistDialog({
  open,
  onOpenChange,
  announcementId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId?: string;
}) {
  const qc = useQueryClient();
  const [type, setType] = React.useState<BlacklistType>("USER");
  const [value, setValue] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setType("USER");
      setValue("");
      setReason("");
      setExpiresAt("");
    }
  }, [open]);

  const submit = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`/api/admin/announcements/blacklist`, {
        method: "POST",
        body: JSON.stringify({
          type,
          value: value.trim(),
          reason: reason.trim() || undefined,
          expiresAt: expiresAt || undefined,
          announcementId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "فشل الإضافة");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم إضافة العنصر للقائمة السوداء");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "blacklist"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const meta = TYPE_META[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            إضافة للقائمة السوداء
          </DialogTitle>
          <DialogDescription>
            سيتم استثناء هذا العنصر من استقبال الإعلانات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              نوع الحظر
            </label>
            <Select value={type} onValueChange={(v) => setType(v as BlacklistType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_META) as BlacklistType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              القيمة
            </label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={meta.placeholder}
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              السبب (اختياري)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="سبب إضافة هذا العنصر..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              ينتهي في (اختياري)
            </label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              dir="ltr"
            />
            <p className="text-[9px] font-bold text-muted-foreground">
              اتركه فارغاً إذا كان الحظر دائماً
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <AdminButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            type="button"
            variant="destructive"
            icon={submit.isPending ? Loader2 : Ban}
            disabled={!value.trim() || submit.isPending}
            onClick={() => submit.mutate()}
            className={submit.isPending ? "animate-spin" : ""}
          >
            {submit.isPending ? "جاري الإضافة..." : "إضافة"}
          </AdminButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Dialog استيراد جماعي ───────── */

function BulkImportDialog({
  open,
  onOpenChange,
  announcementId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId?: string;
}) {
  const qc = useQueryClient();
  const [type, setType] = React.useState<BlacklistType>("USER");
  const [pasted, setPasted] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setType("USER");
      setPasted("");
    }
  }, [open]);

  const submit = useMutation({
    mutationFn: async (items: Array<{ type: BlacklistType; value: string }>) => {
      const res = await adminFetch(`/api/admin/announcements/blacklist/bulk`, {
        method: "POST",
        body: JSON.stringify({ items, announcementId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "فشل الاستيراد");
      }
      return res.json();
    },
    onSuccess: (data: { added?: number; skipped?: number }) => {
      toast.success(`تم إضافة ${data?.added || 0} عنصر${data?.skipped ? ` (تم تخطي ${data.skipped})` : ""}`);
      qc.invalidateQueries({ queryKey: ["admin", "announcements", "blacklist"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const parse = (): Array<{ type: BlacklistType; value: string }> => {
    return pasted
      .split(/[\n,;\t]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((value) => ({ type, value }));
  };

  const items = parse();

  const handleFile = async (file: File) => {
    const text = await file.text();
    setPasted(text);
    toast.info(`تم تحميل ${file.name} - راجع المحتوى ثم اضغط استيراد`);
  };

  const downloadTemplate = () => {
    const csv = `type,value,reason\nUSER,user-123,سبب الحظر\nROLE,students,\nEMAIL_DOMAIN,spam.com,`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blacklist-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            استيراد جماعي
          </DialogTitle>
          <DialogDescription>
            ألصق قائمة بالقيم (كل قيمة في سطر) أو ارفع ملف CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Select value={type} onValueChange={(v) => setType(v as BlacklistType)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_META) as BlacklistType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={downloadTemplate}
            >
              قالب CSV
            </AdminButton>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <AdminButton
            type="button"
            variant="outline"
            icon={Upload}
            onClick={() => fileRef.current?.click()}
          >
            اختر ملف CSV
          </AdminButton>

          <Textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="ألصق القيم هنا (سطر لكل قيمة)..."
            rows={6}
            className="font-mono text-xs"
            dir="ltr"
          />

          {items.length > 0 && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-xs font-bold text-blue-700">
              سيتم استيراد <span className="font-black">{items.length}</span> عنصر من نوع {TYPE_META[type].label}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <AdminButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            type="button"
            variant="gradient"
            icon={submit.isPending ? Loader2 : Upload}
            disabled={items.length === 0 || submit.isPending}
            onClick={() => submit.mutate(items)}
            className={submit.isPending ? "animate-spin" : ""}
          >
            {submit.isPending ? "جاري الاستيراد..." : `استيراد ${items.length} عنصر`}
          </AdminButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook للتحقق من حالة الحظر لمستخدم/جهاز معين
 */
export function useBlacklistCheck() {
  return React.useCallback(async (params: { type: BlacklistType; value: string }) => {
    const res = await adminFetch(
      `/api/admin/announcements/blacklist/check?type=${params.type}&value=${encodeURIComponent(params.value)}`
    );
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json?.data?.blocked);
  }, []);
}