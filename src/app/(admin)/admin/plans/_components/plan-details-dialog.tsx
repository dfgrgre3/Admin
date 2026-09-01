"use client";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Hash,
  Layers,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlan } from "../_lib/types";
import { INTERVAL_COLORS, INTERVAL_LABELS } from "../_lib/constants";
import { formatPlanDate, formatPrice, isPlanGrouped } from "../_lib/utils";

interface PlanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
}

export function PlanDetailsDialog({
  open,
  onOpenChange,
  plan,
  plans,
}: PlanDetailsDialogProps) {
  if (!plan) return null;

  const grouped = isPlanGrouped(plan);
  const groupMembers = grouped
    ? plans.filter((p) => (p.groupKey || p.id) === (plan.groupKey || plan.id))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] border-white/10 bg-card/80 p-0 shadow-2xl backdrop-blur-xl">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] border border-orange-500/20 bg-orange-500/10 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                <Package className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-2xl font-black">{plan.nameAr}</DialogTitle>
                  <Badge
                    className={`rounded-full px-3 py-1 text-[10px] font-black ${
                      plan.isActive
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                    variant="outline"
                  >
                    {plan.isActive ? "مفعّلة" : "معطّلة"}
                  </Badge>
                  {grouped && (
                    <Badge variant="outline" className="rounded-full border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-black text-sky-500">
                      <Layers className="ml-1 h-3 w-3" />
                      مجموعة
                    </Badge>
                  )}
                </div>
                <DialogDescription className="mt-1 text-sm font-bold" dir="ltr">
                  {plan.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* السعر والمدة */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  السعر
                </p>
                <p className="mt-1 text-3xl font-black text-emerald-500">
                  {plan.price.toLocaleString("ar-EG")}
                  <span className="mr-2 text-sm font-bold text-muted-foreground">
                    {plan.currency}
                  </span>
                </p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  المدة
                </p>
                <Badge
                  variant="outline"
                  className={`mt-2 w-fit rounded-lg px-3 py-1 text-xs font-black ${
                    INTERVAL_COLORS[plan.interval] || ""
                  }`}
                >
                  {INTERVAL_LABELS[plan.interval] || plan.interval}
                </Badge>
              </div>
            </div>

            {/* الوصف */}
            {plan.description && (
              <div>
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  الوصف
                </h4>
                <p className="rounded-2xl border bg-accent/5 p-4 text-sm font-medium leading-7">
                  {plan.description}
                </p>
              </div>
            )}

            {/* المميزات */}
            <div>
              <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                المميزات ({plan.features?.length || 0})
              </h4>
              {plan.features && plan.features.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {plan.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2.5"
                    >
                      <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">لا توجد مميزات مسجلة</p>
              )}
            </div>

            {/* أعضاء المجموعة */}
            {grouped && groupMembers.length > 1 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Layers className="h-3.5 w-3.5 text-sky-500" />
                  خطط نفس المجموعة
                </h4>
                <div className="flex flex-wrap gap-2">
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
                        member.id === plan.id
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-accent/10"
                      }`}
                    >
                      {member.nameAr}
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {INTERVAL_LABELS[member.interval]} · {formatPrice(member.price, member.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* بيانات النظام */}
            <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-accent/5 p-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span className="truncate" dir="ltr">{plan.id}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                أنشئت: {formatPlanDate(plan.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                آخر تحديث: {formatPlanDate(plan.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
