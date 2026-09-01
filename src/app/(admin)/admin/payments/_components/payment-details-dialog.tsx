"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BadgeCheck,
  Banknote,
  CalendarDays,
  Copy,
  CreditCard,
  Fingerprint,
  Hash,
  Receipt,
  RotateCcw,
  User,
} from "lucide-react";
import type { Payment } from "./types";
import { statusConfig, getMethodLabel } from "./constants";
import { formatDateTimeFull, formatEGP, shortId } from "./utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentDetailsDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefund: (payment: Payment) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-[11px] font-black text-muted-foreground">{label}</span>
      </div>
      <span
        className={cn(
          "text-xs font-black text-left break-all",
          mono && "font-mono tracking-tight",
          highlight
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PaymentDetailsDialog({
  payment,
  open,
  onOpenChange,
  onRefund,
}: PaymentDetailsDialogProps) {
  if (!payment) return null;

  const config = statusConfig[payment.status] || statusConfig.COMPLETED;
  const StatusIcon = config.icon;

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => toast.success(`تم نسخ ${label}`),
      () => toast.error("فشل النسخ")
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            تفاصيل المعاملة
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            <span className="font-mono font-black text-xs">
              {payment.transactionId || shortId(payment.id)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black",
                config.bgColor,
                config.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount hero */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div>
              <p className="text-[11px] font-black text-emerald-500/70">المبلغ</p>
              <p className="text-3xl font-black text-emerald-500">
                {formatEGP(payment.amount)}
              </p>
              <p className="text-[11px] font-bold text-muted-foreground">
                عبر {getMethodLabel(payment.method)}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <Banknote className="h-7 w-7 text-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <DetailRow
              icon={User}
              label="المستخدم"
              value={payment.user?.name || "غير معروف"}
              highlight="text-primary"
            />
            <div className="flex items-center gap-2 px-3">
              <Avatar className="h-7 w-7 border border-primary/20">
                <AvatarImage src={payment.user?.avatar || ""} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary text-[10px]">
                  {payment.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-muted-foreground" dir="ltr">
                {payment.user?.email || "-"}
              </span>
            </div>
            <DetailRow
              icon={CreditCard}
              label="طريقة الدفع"
              value={getMethodLabel(payment.method)}
            />
            <DetailRow
              icon={BadgeCheck}
              label="الدورة / المادة"
              value={payment.subject?.nameAr || payment.subject?.name || "عام"}
            />
            <DetailRow
              icon={Hash}
              label="رقم العملية المرجعي"
              value={shortId(payment.transactionId || payment.id, 20)}
              mono
            />
            {payment.externalTxnId && (
              <DetailRow
                icon={Fingerprint}
                label="معرّف مزود الدفع"
                value={shortId(payment.externalTxnId, 20)}
                mono
              />
            )}
            {payment.paymobOrderId ? (
              <DetailRow
                icon={Hash}
                label="رقم طلب Paymob"
                value={String(payment.paymobOrderId)}
                mono
              />
            ) : null}
            <DetailRow
              icon={CalendarDays}
              label="تاريخ الإنشاء"
              value={formatDateTimeFull(payment.createdAt)}
            />
            {payment.completedAt && (
              <DetailRow
                icon={CalendarDays}
                label="تاريخ الإتمام"
                value={formatDateTimeFull(payment.completedAt)}
                highlight="text-emerald-500"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copy(payment.id, "المعرف")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-black transition-colors hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" />
              نسخ المعرف
            </button>
            {payment.status === "COMPLETED" && (
              <button
                onClick={() => {
                  onOpenChange(false);
                  onRefund(payment);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-black text-white transition-colors hover:bg-amber-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                استرداد المبلغ
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
