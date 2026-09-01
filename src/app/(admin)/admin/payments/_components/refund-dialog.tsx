"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import type { Payment } from "./types";
import { formatEGP } from "./utils";

interface RefundDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payment: Payment, amount: number, reason: string) => Promise<void>;
}

export function RefundDialog({ payment, open, onOpenChange, onConfirm }: RefundDialogProps) {
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && payment) {
      setAmount(payment.amount.toString());
      setReason("");
    }
  }, [open, payment]);

  const handleConfirm = async () => {
    if (!payment) return;
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0 || value > payment.amount) {
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(payment, value, reason);
    } finally {
      setSubmitting(false);
    }
  };

  const value = parseFloat(amount);
  const valid = payment && !isNaN(value) && value > 0 && value <= payment.amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-amber-500" />
            استرداد مبلغ
          </DialogTitle>
          <DialogDescription>
            {payment && (
              <span>
                استرداد مبلغ من عملية{" "}
                <strong className="font-mono text-xs">
                  {payment.transactionId || payment.id.slice(0, 8)}
                </strong>{" "}
                للمستخدم{" "}
                <strong>{payment.user?.name || payment.user?.email || "غير معروف"}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-2 block text-sm font-bold">المبلغ الأصلي</label>
            <p className="text-2xl font-black text-emerald-500">
              {payment ? formatEGP(payment.amount) : "-"}
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold">مبلغ الاسترداد</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={payment?.amount}
              min={0}
              step="0.01"
              className="rounded-xl"
              autoFocus
            />
            {payment && !valid && (
              <p className="mt-1.5 text-[11px] font-bold text-red-500">
                أدخل مبلغاً أكبر من صفر وأقل من أو يساوي {formatEGP(payment.amount)}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold">سبب الاسترداد</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: طلب من المستخدم، خطأ في الدفع..."
              className="min-h-20 rounded-xl"
              maxLength={300}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-bold rounded-xl border border-border hover:bg-accent transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !valid}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {submitting ? "جاري الاسترداد..." : "تأكيد الاسترداد"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
