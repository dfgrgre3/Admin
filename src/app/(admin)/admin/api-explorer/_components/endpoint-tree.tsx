"use client";

/**
 * شجرة كتالوج المسارات (مستكشف API).
 * تعرض كل مسارات الـ backend مقسّمة على مجموعات قابلة للطي.
 * النقر على أي مسار يستدعي onSelect.
 */

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  Search,
  X,
  Braces,
  Globe,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiEndpointNode } from "../_types/api-explorer";
import { groupCatalog, searchEndpoints } from "../_lib/endpoint-catalog";

interface EndpointTreeProps {
  onSelect: (node: ApiEndpointNode) => void;
  selectedId?: string;
}

/** أيقونة مجموعة المسار */
function groupIcon(group: string): React.ElementType {
  if (group === "auth") return Sparkles;
  if (group === "admin") return Braces;
  return Globe;
}

/** لون شارة المجموعة */
function groupColor(group: string): string {
  const palette: Record<string, string> = {
    health: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    auth: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    users: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    progress: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    analytics: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    notifications: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    activities: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    settings: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    billing: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    subscriptions: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    coupons: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    gamification: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    ai: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    library: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    admin: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return palette[group] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

export function EndpointTree({ onSelect, selectedId }: EndpointTreeProps): React.ReactElement {
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () => new Set(["auth", "admin", "users", "billing", "health"])
  );
  const [expandedSubgroups, setExpandedSubgroups] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(
    () => searchEndpoints(deferredQuery),
    [deferredQuery]
  );
  const tree = React.useMemo(() => groupCatalog(filtered), [filtered]);

  const toggleGroup = React.useCallback((group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }, []);

  const toggleSubgroup = React.useCallback((key: string) => {
    setExpandedSubgroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في المسارات، المجموعات، الوسوم…"
          className="h-10 rounded-xl border-white/10 bg-white/5 pr-10 pl-10 text-sm placeholder:text-muted-foreground/70"
          aria-label="بحث في كتالوج المسارات"
        />
        {query.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuery("")}
            className="absolute left-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="مسح البحث"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length.toLocaleString("ar-EG")} مسار في {tree.length} مجموعة
        </span>
        <button
          type="button"
          onClick={() =>
            setExpandedGroups(new Set(tree.map((t) => t.group)))
          }
          className="text-xs font-medium text-primary hover:underline"
        >
          توسيع الكل
        </button>
      </div>

      <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1 pl-1">
        {tree.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
            لا توجد مسارات مطابقة للبحث
          </div>
        ) : (
          tree.map((branch) => {
            const GroupIcon = groupIcon(branch.group);
            const isOpen = expandedGroups.has(branch.group);
            return (
              <div key={branch.group} className="rounded-xl">
                <button
                  type="button"
                  onClick={() => toggleGroup(branch.group)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                    "hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                    )}
                    <GroupIcon className="h-4 w-4 text-primary" />
                    <span className="font-black tracking-wide">{branch.group}</span>
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("h-5 border px-1.5 text-[10px]", groupColor(branch.group))}
                  >
                    {branch.totalCount}
                  </Badge>
                </button>

                {isOpen ? (
                  <div className="ms-3 mt-1 space-y-1 border-r border-white/5 pr-2">
                    {branch.subgroups.map((sub) => {
                      const subKey = `${branch.group}:${sub.name}`;
                      const isSubOpen =
                        sub.name === "__root__" ? true : expandedSubgroups.has(subKey);
                      return (
                        <div key={subKey}>
                          {sub.name !== "__root__" ? (
                            <button
                              type="button"
                              onClick={() => toggleSubgroup(subKey)}
                              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-white/5"
                            >
                              <span className="flex items-center gap-1.5">
                                {isSubOpen ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronLeft className="h-3 w-3 rotate-180" />
                                )}
                                {sub.name}
                              </span>
                              <span className="text-[10px] opacity-70">{sub.count}</span>
                            </button>
                          ) : null}

                          {isSubOpen ? (
                            <ul className="ms-3 space-y-0.5">
                              {sub.nodes.map((node) => {
                                const active = node.id === selectedId;
                                return (
                                  <li key={node.id}>
                                    <button
                                      type="button"
                                      onClick={() => onSelect(node)}
                                      className={cn(
                                        "group flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-start text-xs transition-colors",
                                        active
                                          ? "bg-primary/15 text-primary"
                                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                      )}
                                    >
                                      <span className="truncate font-mono text-[11px]">{node.path}</span>
                                      {node.isDynamic ? (
                                        <Badge
                                          variant="outline"
                                          className="h-4 border-amber-500/30 bg-amber-500/10 px-1 text-[9px] text-amber-300"
                                        >
                                          ديناميكي
                                        </Badge>
                                      ) : null}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
