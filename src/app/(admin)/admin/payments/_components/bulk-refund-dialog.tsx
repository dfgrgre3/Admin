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
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { Payment } from "./types";
import { formatEGP } from "./utils";

interface BulkRefundDialogProps {
  payments: Payment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payments: Payment[], reason: string) => Promise<void>;
}

export function BulkRefundDialog({ payments, open, onOpenChange, onConfirm }: BulkRefundDialogProps) {
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(payments, reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <RotateCcw className="h-5 w-5" />
            استرداد جماعي
          </DialogTitle>
          <DialogDescription>
            سيتم استرداد <strong>{payments.length}</strong> معاملة بقيمة إجمالية{" "}
            <strong className="text-emerald-500">{formatEGP(totalAmount)}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-xs font-bold leading-6 text-amber-600 dark:text-amber-400">
              هذا الإجراء لا يمكن التراجع عنه. تأكد من صحة المعاملات المحددة قبل المتابعة.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold">سبب الاسترداد الجماعي</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: مشكلة تقنية جماعية، خطأ في التسعير..."
              className="min-h-20 rounded-xl"
              maxLength={300}
            />
          </div>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-2 space-y-1">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/5">
                <span className="text-[11px] font-bold text-muted-foreground">
                  {p.user?.name || p.user?.email || "مستخدم"}
                </span>
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  {p.transactionId || p.id.slice(0, 8)}
                </span>
                <span className="text-[11px] font-black text-emerald-500">{formatEGP(p.amount)}</span>
              </div>
            ))}
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
            disabled={submitting || !payments.length}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {submitting ? "جاري الاسترداد..." : "تأكيد الاسترداد الجماعي"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
