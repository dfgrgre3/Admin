"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  Plus,
  X,
  ExternalLink,
  Search,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trash2,
  Link2Off,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Announcement } from "./types";

export type LinkRelation = "RELATED" | "PREREQUISITE" | "FOLLOWUP" | "REPLACES" | "DUPLICATE";

export interface LinkedAnnouncement {
  id: string;
  title: string;
  type: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
}

export interface AnnouncementLink {
  id: string;
  sourceId: string;
  targetId: string;
  relation: LinkRelation;
  createdAt: string;
  /** populated بعد fetch */
  target?: LinkedAnnouncement;
}

interface LinkedAnnouncementsProps {
  announcementId: string;
  className?: string;
}

const RELATION_META: Record<LinkRelation, { label: string; icon: React.ElementType; color: string; description: string }> = {
  RELATED: {
    label: "ذو صلة",
    icon: Link2,
    color: "bg-blue-500/15 text-blue-500",
    description: "إعلان مرتبط بنفس الموضوع أو السياق",
  },
  PREREQUISITE: {
    label: "متطلب سابق",
    icon: ArrowRight,
    color: "bg-amber-500/15 text-amber-500",
    description: "يجب قراءة هذا الإعلان أولاً",
  },
  FOLLOWUP: {
    label: "متابعة",
    icon: ArrowDownRight,
    color: "bg-violet-500/15 text-violet-500",
    description: "يأتي بعد/تكملة للإعلان الحالي",
  },
  REPLACES: {
    label: "يحل محل",
    icon: ArrowUpRight,
    color: "bg-red-500/15 text-red-500",
    description: "يحل محل إعلان قديم (للأرشفة)",
  },
  DUPLICATE: {
    label: "مكرر",
    icon: Link2Off,
    color: "bg-slate-500/15 text-slate-500",
    description: "إعلان مكرر عن إعلان آخر",
  },
};

/**
 * مكوّن إدارة الإعلانات المرتبطة - يربط إعلان بإعلانات أخرى
 * بأنواع مختلفة من العلاقات (ذو صلة، متطلب سابق، متابعة، إلخ)
 */
export function LinkedAnnouncements({ announcementId, className }: LinkedAnnouncementsProps) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", announcementId, "links"],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/announcements/${announcementId}/links`);
      if (!res.ok) return { items: [] as AnnouncementLink[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.links as AnnouncementLink[]) ||
          (json?.links as AnnouncementLink[]) ||
          [],
      };
    },
    staleTime: 30000,
  });

  const removeLink = useMutation({
    mutationFn: async (linkId: string) => {
      const res = await adminFetch(`/api/admin/announcements/${announcementId}/links/${linkId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم فك الربط");
      qc.invalidateQueries({ queryKey: ["admin", "announcements", announcementId, "links"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const links = data?.items || [];
  // تجميع حسب نوع العلاقة
  const grouped = React.useMemo(() => {
    const map: Partial<Record<LinkRelation, AnnouncementLink[]>> = {};
    links.forEach((l) => {
      if (!map[l.relation]) map[l.relation] = [];
      map[l.relation]!.push(l);
    });
    return map;
  }, [links]);

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">الإعلانات المرتبطة</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              اربط هذا الإعلان بإعلانات أخرى (متطلب سابق، متابعة، ذو صلة)
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={() => setAddOpen(true)}
        >
          ربط إعلان
        </AdminButton>
      </div>

      {isLoading && <Skeleton className="h-16 w-full rounded-xl" />}

      {!isLoading && links.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-8 text-center text-xs font-bold text-muted-foreground">
          <Link2 className="h-6 w-6 opacity-40" />
          لا توجد إعلانات مرتبطة بعد
        </div>
      )}

      {!isLoading && links.length > 0 && (
        <div className="space-y-2">
          {(Object.keys(grouped) as LinkRelation[]).map((rel) => {
            const meta = RELATION_META[rel];
            const items = grouped[rel] || [];
            const Icon = meta.icon;
            return (
              <div key={rel} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black", meta.color)}>
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.map((link) => (
                    <div
                      key={link.id}
                      className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/2.5 p-2 transition hover:bg-white/5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5">
                        <Icon className="h-3 w-3 opacity-70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[11px] font-black">{link.target?.title || `إعلان #${link.targetId}`}</p>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          {link.target?.createdAt ? formatDate(link.target.createdAt) : "—"}
                          {link.target && !link.target.isActive && " • متوقف"}
                        </p>
                      </div>
                      <AdminButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => removeLink.mutate(link.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                        aria-label="فك الربط"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddLinkDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        announcementId={announcementId}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["admin", "announcements", announcementId, "links"] });
          setAddOpen(false);
        }}
      />
    </div>
  );
}

/* ───────── Dialog لإضافة ربط ───────── */

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: string;
  onCreated: () => void;
}

function AddLinkDialog({ open, onOpenChange, announcementId, onCreated }: AddLinkDialogProps) {
  const [search, setSearch] = React.useState("");
  const [relation, setRelation] = React.useState<LinkRelation>("RELATED");
  const [selected, setSelected] = React.useState<Announcement | null>(null);

  React.useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(null);
      setRelation("RELATED");
    }
  }, [open]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "search", search],
    queryFn: async () => {
      const url = `/api/admin/announcements?search=${encodeURIComponent(search)}&limit=10&exclude=${announcementId}`;
      const res = await adminFetch(url);
      if (!res.ok) return { items: [] as Announcement[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.items as Announcement[]) ||
          (json?.data?.announcements as Announcement[]) ||
          (json?.items as Announcement[]) ||
          [],
      };
    },
    enabled: open,
    staleTime: 10000,
  });

  const items = data?.items || [];

  const create = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("اختر إعلان أولاً");
      const res = await adminFetch(`/api/admin/announcements/${announcementId}/links`, {
        method: "POST",
        body: JSON.stringify({ targetId: selected.id, relation }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "فشل إنشاء الربط");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم ربط الإعلان بنجاح");
      onCreated();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-500" />
            ربط إعلان آخر
          </DialogTitle>
          <DialogDescription>
            اختر الإعلان الذي تريد ربطه ونوع العلاقة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              نوع العلاقة
            </label>
            <Select value={relation} onValueChange={(v) => setRelation(v as LinkRelation)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RELATION_META) as LinkRelation[]).map((rel) => {
                  const meta = RELATION_META[rel];
                  return (
                    <SelectItem key={rel} value={rel}>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-black">{meta.label}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{meta.description}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              بحث عن إعلان
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالعنوان..."
                className="pr-9"
              />
            </div>
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-white/2.5 p-2">
            {isLoading && (
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            )}
            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-xs font-bold text-muted-foreground">
                <Search className="h-5 w-5 opacity-40" />
                لا توجد نتائج
              </div>
            )}
            {!isLoading &&
              items.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md p-2 text-right transition",
                    selected?.id === a.id
                      ? "bg-blue-500/15 ring-1 ring-blue-500"
                      : "hover:bg-white/5"
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5">
                    <Link2 className="h-3 w-3 opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[11px] font-black">{a.title}</p>
                    <p className="text-[9px] font-bold text-muted-foreground">
                      {a.type} • {a.priority} • {a.isActive ? "نشط" : "متوقف"}
                    </p>
                  </div>
                  {selected?.id === a.id && (
                    <span className="rounded-md bg-blue-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                      مختار
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <AdminButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </AdminButton>
          <AdminButton
            type="button"
            variant="gradient"
            icon={create.isPending ? Loader2 : Link2}
            disabled={!selected || create.isPending}
            onClick={() => create.mutate()}
            className={create.isPending ? "animate-spin" : ""}
          >
            {create.isPending ? "جاري الربط..." : "تأكيد الربط"}
          </AdminButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * مكوّن عرض الإعلانات المرتبطة (Read-only) - يظهر للمستخدم النهائي
 */
export function LinkedAnnouncementsViewer({
  announcementId,
  className,
}: {
  announcementId: string;
  className?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["public", "announcements", announcementId, "links"],
    queryFn: async () => {
      const res = await adminFetch(`/api/public/announcements/${announcementId}/links`);
      if (!res.ok) return { items: [] as AnnouncementLink[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.links as AnnouncementLink[]) ||
          (json?.links as AnnouncementLink[]) ||
          [],
      };
    },
    staleTime: 60000,
  });

  const links = data?.items || [];

  if (isLoading) return null;
  if (links.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)} dir="rtl">
      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        <Link2 className="h-3 w-3" />
        إعلانات مرتبطة
      </p>
      <div className="space-y-1">
        {links.map((link) => {
          const meta = RELATION_META[link.relation];
          const Icon = meta.icon;
          return (
            <a
              key={link.id}
              href={`/announcements/${link.targetId}`}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/2.5 p-2 transition hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <Icon className={cn("h-4 w-4", meta.color.split(" ")[1])} />
              <span className="flex-1 truncate text-[11px] font-black">{link.target?.title}</span>
              <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
            </a>
          );
        })}
      </div>
    </div>
  );
}