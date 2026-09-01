"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { RowActions } from "@/components/admin/ui/admin-table";
import {
  Check,
  Copy,
  DollarSign,
  Layers,
  Package,
} from "lucide-react";
import type { SubscriptionPlan } from "../_lib/types";
import { INTERVAL_COLORS, INTERVAL_LABELS } from "../_lib/constants";
import { formatPlanDate, isPlanGrouped } from "../_lib/utils";

export interface PlanColumnHandlers {
  plans: SubscriptionPlan[];
  onView?: (plan: SubscriptionPlan) => void;
  onEdit?: (plan: SubscriptionPlan) => void;
  onDelete?: (plan: SubscriptionPlan) => void;
  onDuplicate?: (plan: SubscriptionPlan) => void;
  onToggle?: (plan: SubscriptionPlan) => void;
}

// عدد الخطط التي تشارك نفس المجموعة
function groupSize(plans: SubscriptionPlan[], plan: SubscriptionPlan): number {
  const key = plan.groupKey || plan.id;
  return plans.filter((p) => (p.groupKey || p.id) === key).length;
}

export function buildPlanColumns({
  plans,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
}: PlanColumnHandlers): ColumnDef<SubscriptionPlan>[] {
  return [
    {
      accessorKey: "nameAr",
      header: "الخطة",
      cell: ({ row }) => {
        const plan = row.original;
        const grouped = isPlanGrouped(plan);
        return (
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-orange-500/20 bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-transform hover:scale-105">
              <Package className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-black text-sm">{plan.nameAr}</p>
                {grouped && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-sky-500/20 bg-sky-500/10 px-2 py-0 text-[9px] font-black text-sky-500"
                  >
                    <Layers className="ml-1 h-2.5 w-2.5" />
                    مجموعة
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase opacity-60">
                {plan.name}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="text-lg font-black">{plan.price.toLocaleString("ar-EG")}</span>
            <span className="text-[10px] font-bold text-muted-foreground">{plan.currency}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "interval",
      header: "المدة",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <Badge
            variant="outline"
            className={`rounded-lg px-3 py-1 text-xs font-black ${
              INTERVAL_COLORS[plan.interval] || "bg-gray-500/10 text-gray-500"
            }`}
          >
            {INTERVAL_LABELS[plan.interval] || plan.interval}
          </Badge>
        );
      },
    },
    {
      accessorKey: "groupKey",
      header: "المجموعة",
      enableSorting: false,
      cell: ({ row }) => {
        const plan = row.original;
        const size = groupSize(plans, plan);
        if (!isPlanGrouped(plan)) {
          return (
            <span className="text-[10px] font-bold text-muted-foreground italic">مستقلة</span>
          );
        }
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1">
            <Layers className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] font-black text-sky-500">{size} خطط</span>
          </div>
        );
      },
    },
    {
      accessorKey: "features",
      header: "المميزات",
      cell: ({ row }) => {
        const features = row.original.features;
        const displayFeatures = Array.isArray(features) ? features.slice(0, 2) : [];
        const remaining = Array.isArray(features) ? features.length - 2 : 0;
        return (
          <div className="flex flex-col gap-1">
            {displayFeatures.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
              >
                <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                <span className="max-w-[150px] truncate">{f}</span>
              </div>
            ))}
            {remaining > 0 && (
              <span className="text-[10px] font-bold text-primary">+{remaining} مميزات أخرى</span>
            )}
            {displayFeatures.length === 0 && (
              <span className="text-[10px] italic text-muted-foreground">لا توجد مميزات</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <button
            onClick={() => onToggle?.(plan)}
            className="group"
            aria-label={plan.isActive ? "تعطيل الخطة" : "تفعيل الخطة"}
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  plan.isActive
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-red-500/30"
                }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-widest group-hover:underline ${
                  plan.isActive ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {plan.isActive ? "مفعّلة" : "معطّلة"}
              </span>
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => (
        <span className="text-[11px] font-bold text-muted-foreground">
          {formatPlanDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "التحكم",
      enableSorting: false,
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          extraActions={[
            {
              icon: Copy,
              label: "نسخ الخطة",
              onClick: (plan) => onDuplicate?.(plan),
            },
          ]}
        />
      ),
    },
  ];
}
