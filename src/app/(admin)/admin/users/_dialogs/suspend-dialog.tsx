"use client";

import { Ban } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SuspendDialogState } from "../_components/list-types";

interface SuspendDialogProps {
  state: SuspendDialogState;
  setState: (s: SuspendDialogState) => void;
  onSuspend: (ids: string[], reason?: string) => void;
  loading: boolean;
}

export function SuspendDialog({ state, setState, onSuspend, loading }: SuspendDialogProps) {
  return (
    <Dialog
      open={state.open}
      onOpenChange={(open) => setState({ open, ids: [], reason: undefined })}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-warning" />
            {state.ids.length > 1 ? `تعليق ${state.ids.length} مستخدم` : "تعليق حساب مستخدم"}
          </DialogTitle>
          <DialogDescription>
            سيتم إغلاق جميع الجلسات وإلغاء التوكنات، وتسجيل العملية في سجل التدقق,
            وإرسال إشعار للمستخدم.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="suspend-reason" className="text-sm font-bold">سبب التعليق (اختياري)</Label>
          <Textarea
            id="suspend-reason"
            placeholder="أدخل سبب التعليق..."
            value={state.reason || ""}
            onChange={(e) => setState({ ...state, reason: e.target.value })}
            rows={3}
          />
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => setState({ open: false, ids: [], reason: undefined })}>
            إلغاء
          </AdminButton>
          <AdminButton
            variant="warning"
            onClick={() => onSuspend(state.ids, state.reason)}
            loading={loading}
          >
            تأكيد التعليق
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}