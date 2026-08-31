"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ScrollText,
  Filter,
  Calendar,
  User,
  Activity,
  Download,
  Search,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";

export interface AuditEntry {
  id: string;
  /** نوع الكيان: announcement / template / webhook / ... */
  entity: string;
  /** معرّف الكيان */
  entityId: string;
  /** نوع الإجراء: create / update / delete / publish / ... */
  action: string;
  /** عنوان الكيان للعرض */
  entityTitle?: string;
  /** اسم الفاعل */
  actorName?: string;
  actorId?: string;
  actorAvatar?: string | null;
  /** عنوان IP */
  ip?: string;
  /** User Agent */
  userAgent?: string;
  /** التفاصيل الإضافية */
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogProps {
  className?: string;
  /** تقييد السجل لكيان معين */
  entityFilter?: string;
  /** معرّف الكيان */
  entityId?: string;
}

/**
 * مكوّن سجل المراجعة المتقدم - يعرض كل التغييرات على الإعلانات
 * مع إمكانية الفلترة والتصدير
 */
export function AuditLog({ className, entityFilter, entityId }: AuditLogProps) {
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("all");
  const [actorFilter, setActorFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const params = React.useMemo(() => {
    const p = new URLSearchParams();
    if (entityFilter) p.set("entity", entityFilter);
    if (entityId) p.set("entityId", entityId);
    if (search) p.set("search", search);
    if (actionFilter !== "all") p.set("action", actionFilter);
    if (actorFilter !== "all") p.set("actorId", actorFilter);
    p.set("page", page.toString());
    p.set("limit", "30");
    return p.toString();
  }, [entityFilter, entityId, search, actionFilter, actorFilter, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "audit", params],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/announcements/audit?${params}`);
      if (!res.ok) return { items: [] as AuditEntry[], total: 0 };
      const json = await res.json();
      return {
        items:
          (json?.data?.items as AuditEntry[]) ||
          (json?.data?.entries as AuditEntry[]) ||
          (json?.items as AuditEntry[]) ||
          [],
        total: (json?.data?.total as number) || (json?.total as number) || 0,
      };
    },
    staleTime: 30000,
  });

  const entries = data?.items || [];

  const exportLog = () => {
    const csv = [
      ["التاريخ", "الفاعل", "الإجراء", "الكيان", "العنوان", "IP"].join(","),
      ...entries.map((e) =>
        [
          new Date(e.createdAt).toISOString(),
          e.actorName || "",
          e.action,
          e.entity,
          `"${(e.entityTitle || "").replace(/"/g, '""')}"`,
          e.ip || "",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // استخراج قائمة الفاعلين والأجراءات للفلاتر
  const actors = React.useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => {
      if (e.actorId && e.actorName) {
        map.set(e.actorId, e.actorName);
      }
    });
    return Array.from(map.entries());
  }, [entries]);

  const actions = React.useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.action));
    return Array.from(set);
  }, [entries]);

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
            <ScrollText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">سجل المراجعة (Audit Log)</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              {data?.total ?? 0} عملية مسجلة
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="outline"
          size="sm"
          icon={Download}
          onClick={exportLog}
          disabled={entries.length === 0}
        >
          تصدير CSV
        </AdminButton>
      </div>

      {/* فلاتر */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث في السجل..."
            className="pr-9 text-xs"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="كل الإجراءات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الإجراءات</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actorFilter} onValueChange={(v) => { setActorFilter(v); setPage(1); }}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="كل الفاعلين" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفاعلين</SelectItem>
            {actors.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-8 text-center text-xs font-bold text-muted-foreground">
          <Activity className="h-6 w-6 opacity-40" />
          لا توجد سجلات تطابق الفلاتر
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group rounded-lg border border-white/5 bg-white/2.5 p-2 transition hover:bg-white/5"
            >
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-[10px] font-black">
                  {entry.actorAvatar ? (
                    <img src={entry.actorAvatar} alt="" className="h-7 w-7 rounded-full" />
                  ) : (
                    (entry.actorName || "ن").slice(0, 1)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] font-black">
                      {entry.action}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px] font-bold">
                      {entry.entity}
                    </Badge>
                    {entry.entityTitle && (
                      <span className="truncate text-[11px] font-black">{entry.entityTitle}</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />
                      {entry.actorName || "النظام"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDateTime(entry.createdAt)}
                    </span>
                    {entry.ip && (
                      <span className="font-mono" dir="ltr">IP: {entry.ip}</span>
                    )}
                  </div>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[9px] font-bold text-blue-500 hover:underline">
                        تفاصيل إضافية ({Object.keys(entry.metadata).length})
                      </summary>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-black/20 p-2 text-[9px] font-mono text-muted-foreground" dir="ltr">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination بسيط */}
      {data && data.total > 30 && (
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-muted-foreground">
            صفحة {page} من {Math.ceil(data.total / 30)}
          </span>
          <div className="flex gap-1">
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              السابق
            </AdminButton>
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 30 >= data.total}
            >
              التالي
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}