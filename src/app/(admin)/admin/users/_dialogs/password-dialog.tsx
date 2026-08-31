"use client";

import { Key } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PasswordDialogState } from "../_components/list-types";

interface PasswordDialogProps {
  state: PasswordDialogState;
  setState: (s: PasswordDialogState) => void;
  onSubmit: (userId: string, password: string) => void;
  loading: boolean;
}

export function PasswordDialog({ state, setState, onSubmit, loading }: PasswordDialogProps) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => setState({ open, user: null })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            تغيير كلمة المرور
          </DialogTitle>
          <DialogDescription>
            أدخل كلمة مرور جديدة للمستخدم {state.user?.name || state.user?.email || ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="new-password" className="text-sm font-bold">كلمة المرور الجديدة</Label>
          <Input
            id="new-password"
            type="password"
            dir="ltr"
            placeholder="8 أحرف على الأقل"
            value={state.password || ""}
            onChange={(e) => setState({ ...state, password: e.target.value })}
          />
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => setState({ open: false, user: null })}>
            إلغاء
          </AdminButton>
          <AdminButton
            onClick={() => state.user && state.password && onSubmit(state.user.id, state.password)}
            disabled={!state.password || state.password.length < 8}
            loading={loading}
          >
            حفظ
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}