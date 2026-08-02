"use client";

import * as React from "react";
import {
  PERMISSION_CATEGORIES,
  getStaffRoles,
  roleHasPermission,
  getDangerLevelStyle,
  type PermissionMeta,
} from "@/lib/permission-matrix-config";
import { PERMISSIONS } from "@/lib/permissions";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Minus,
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RoleMatrixProps {
  /** Called when a role-permission toggle changes (for future backend integration) */
  onPermissionChange?: (role: UserRole, permission: string, granted: boolean) => void;
  /** Called when a whole category is toggled for a role */
  onCategoryToggle?: (role: UserRole, categoryId: string, permissionKeys: string[], granted: boolean) => void;
  /** Whether editing is allowed */
  editable?: boolean;
}

type DangerFilter = "all" | "safe" | "elevated" | "dangerous";

export function RoleMatrix({ onPermissionChange, onCategoryToggle, editable = false }: RoleMatrixProps) {
  const staffRoles = getStaffRoles();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dangerFilter, setDangerFilter] = React.useState<DangerFilter>("all");
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PERMISSION_CATEGORIES.forEach((cat) => (initial[cat.id] = true));
    return initial;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    PERMISSION_CATEGORIES.forEach((cat) => (all[cat.id] = true));
    setExpandedCategories(all);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    PERMISSION_CATEGORIES.forEach((cat) => (all[cat.id] = false));
    setExpandedCategories(all);
  };

  const filteredCategories = React.useMemo(() => {
    return PERMISSION_CATEGORIES.map((cat) => ({
      ...cat,
      permissions: cat.permissions.filter((p) => {
        if (dangerFilter !== "all" && p.dangerLevel !== dangerFilter) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          p.label.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query)
        );
      }),
    })).filter((cat) => cat.permissions.length > 0);
  }, [searchQuery, dangerFilter]);

  const getCellState = (role: UserRole, permissionKey: string): "granted" | "default" | "denied" => {
    const isBypass = roleHasPermission(role, PERMISSIONS.ADMIN_BYPASS);
    if (isBypass) return "granted";
    const rolePerms = roleHasPermission(role, permissionKey);
    if (rolePerms) return "default";
    return "denied";
  };

  const getCategoryState = (role: UserRole, permissions: PermissionMeta[]): "all" | "partial" | "none" => {
    const isBypass = roleHasPermission(role, PERMISSIONS.ADMIN_BYPASS);
    if (isBypass) return "all";
    const granted = permissions.filter((p) => roleHasPermission(role, p.key)).length;
    if (granted === 0) return "none";
    if (granted === permissions.length) return "all";
    return "partial";
  };

  const handleExport = () => {
    const headers = ["الصلاحية", "الوصف", "مستوى الخطر", ...staffRoles.map((r) => r.label)];
    const rows: string[][] = [];
    PERMISSION_CATEGORIES.forEach((cat) => {
      cat.permissions.forEach((perm) => {
        const dangerStyle = getDangerLevelStyle(perm.dangerLevel);
        const row = [
          perm.label,
          perm.description,
          dangerStyle.label,
          ...staffRoles.map((r) => {
            const state = getCellState(r.role, perm.key);
            return state === "granted" || state === "default" ? "✓" : "—";
          }),
        ];
        rows.push(row);
      });
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "permission-matrix.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const dangerFilters: { value: DangerFilter; label: string; color: string }[] = [
    { value: "all", label: "الكل", color: "bg-muted/40 text-muted-foreground border-border/50" },
    { value: "safe", label: "آمن", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    { value: "elevated", label: "مرتفع", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    { value: "dangerous", label: "خطر", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search + Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن صلاحية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 rounded-xl bg-muted/40 border-border/50"
          />
        </div>

        {/* Danger level filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1 rounded-xl bg-muted/30 p-1">
            {dangerFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setDangerFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                  dangerFilter === f.value
                    ? f.color + " shadow-sm"
                    : "text-muted-foreground border-transparent hover:bg-muted/50",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expand/Collapse all */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={expandAll} className="rounded-xl gap-1.5 h-9">
            <ChevronsUpDown className="h-3.5 w-3.5" />
            توسيع الكل
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="rounded-xl gap-1.5 h-9">
            <ChevronsDownUp className="h-3.5 w-3.5" />
            طي الكل
          </Button>
        </div>

        {/* Export */}
        <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl gap-1.5 h-9">
          <Download className="h-3.5 w-3.5" />
          تصدير CSV
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-bold text-muted-foreground">ممنوحة</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-[8px] font-black text-primary">D</span>
          </div>
          <span className="font-bold text-muted-foreground">افتراضية (من الدور)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md bg-muted/40 border border-border/50 flex items-center justify-center">
            <Minus className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="font-bold text-muted-foreground">غير ممنوحة</span>
        </div>
        {editable && (
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-amber-600 dark:text-amber-400">التعديل متاح</span>
          </div>
        )}
      </div>

      {/* Matrix Table */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/50">
              <tr>
                <th className="text-right p-4 font-black text-xs uppercase tracking-wider text-muted-foreground min-w-[280px]">
                  الصلاحية
                </th>
                {staffRoles.map((role) => (
                  <th key={role.role} className="p-3 min-w-[120px] text-center">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-1 cursor-help">
                            <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black border", role.badgeClass)}>
                              {role.label}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs text-center">
                          <p className="font-bold">{role.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => {
                const isExpanded = expandedCategories[category.id];
                return (
                  <React.Fragment key={category.id}>
                    {/* Category header row */}
                    <tr className="bg-muted/30 border-b border-border/30">
                      <td
                        colSpan={staffRoles.length + 1}
                        className="p-3 cursor-pointer select-none"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-black text-sm">{category.label}</span>
                          <Badge variant="outline" className="text-[10px] font-bold opacity-60">
                            {category.permissions.length}
                          </Badge>
                        </div>
                      </td>
                    </tr>

                    {/* Permission rows */}
                    {isExpanded &&
                      category.permissions.map((perm) => {
                        const dangerStyle = getDangerLevelStyle(perm.dangerLevel);
                        return (
                          <tr
                            key={perm.key}
                            className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">{perm.label}</span>
                                  <Badge
                                    className={cn(
                                      "text-[8px] font-black border h-4 rounded-full px-1.5",
                                      dangerStyle.badgeClass,
                                    )}
                                  >
                                    {dangerStyle.label}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{perm.description}</p>
                                <code className="text-[9px] text-muted-foreground/60 font-mono" dir="ltr">
                                  {perm.key}
                                </code>
                              </div>
                            </td>
                            {staffRoles.map((role) => {
                              const cellState = getCellState(role.role, perm.key);
                              const isBypass = roleHasPermission(role.role, PERMISSIONS.ADMIN_BYPASS);
                              return (
                                <td key={role.role} className="p-3 text-center">
                                  <TooltipProvider delayDuration={300}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center justify-center">
                                          {editable && !isBypass ? (
                                            <Switch
                                              checked={cellState !== "denied"}
                                              onCheckedChange={(checked) =>
                                                onPermissionChange?.(role.role, perm.key, checked)
                                              }
                                              className="scale-90"
                                            />
                                          ) : (
                                            <div
                                              className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center mx-auto transition-all",
                                                cellState === "granted" &&
                                                  "bg-emerald-500/20 border border-emerald-500/30",
                                                cellState === "default" &&
                                                  "bg-primary/10 border border-primary/20",
                                                cellState === "denied" &&
                                                  "bg-muted/30 border border-border/30",
                                              )}
                                            >
                                              {cellState === "granted" && (
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                              )}
                                              {cellState === "default" && (
                                                <span className="text-[10px] font-black text-primary">D</span>
                                              )}
                                              {cellState === "denied" && (
                                                <Minus className="h-3 w-3 text-muted-foreground/50" />
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        {isBypass ? (
                                          <span>تجاوز كامل (Admin Bypass)</span>
                                        ) : cellState === "granted" ? (
                                          <span>ممنوحة كصلاحية إضافية</span>
                                        ) : cellState === "default" ? (
                                          <span>ممنوحة افتراضياً مع الدور</span>
                                        ) : (
                                          <span>غير ممنوحة</span>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                    {/* Category bulk toggle row (editable only) */}
                    {editable && isExpanded && (
                      <tr className="bg-muted/20 border-b border-border/30">
                        <td className="p-2 text-right">
                          <span className="text-[10px] font-bold text-muted-foreground">إجراءات جماعية:</span>
                        </td>
                        {staffRoles.map((role) => {
                          const isBypass = roleHasPermission(role.role, PERMISSIONS.ADMIN_BYPASS);
                          const catState = getCategoryState(role.role, category.permissions);
                          if (isBypass) {
                            return <td key={role.role} className="p-2 text-center text-[10px] text-muted-foreground/40">—</td>;
                          }
                          return (
                            <td key={role.role} className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/10"
                                  onClick={() =>
                                    onCategoryToggle?.(
                                      role.role,
                                      category.id,
                                      category.permissions.map((p) => p.key),
                                      true,
                                    )
                                  }
                                >
                                  الكل
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] font-bold text-red-600 hover:bg-red-500/10"
                                  onClick={() =>
                                    onCategoryToggle?.(
                                      role.role,
                                      category.id,
                                      category.permissions.map((p) => p.key),
                                      false,
                                    )
                                  }
                                >
                                  لا شيء
                                </Button>
                              </div>
                              {catState === "partial" && (
                                <Badge className="mt-0.5 bg-amber-500/10 text-amber-600 text-[7px] font-bold border-none h-3">
                                  جزئي
                                </Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {staffRoles.map((role) => {
          const grantedCount = PERMISSION_CATEGORIES.reduce((acc, cat) => {
            return (
              acc +
              cat.permissions.filter((p) => {
                const state = getCellState(role.role, p.key);
                return state === "granted" || state === "default";
              }).length
            );
          }, 0);
          const totalCount = PERMISSION_CATEGORIES.reduce((acc, cat) => acc + cat.permissions.length, 0);
          const percentage = Math.round((grantedCount / totalCount) * 100);
          return (
            <div
              key={role.role}
              className={cn(
                "rounded-2xl border p-4 space-y-2 transition-all hover:shadow-lg",
                role.badgeClass,
                "border",
              )}
            >
              <p className="font-black text-sm">{role.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">{grantedCount}</span>
                <span className="text-xs text-muted-foreground">/ {totalCount}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-current opacity-60 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[10px] font-bold opacity-70">{percentage}% من الصلاحيات</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}