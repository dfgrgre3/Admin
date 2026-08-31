"use client";

import { UserCog } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/enums";
import { ROLE_TABS } from "../_components/list-constants";
import type { BulkRoleDialogState, RoleDialogState } from "../_components/list-types";

interface RoleDialogProps {
  state: RoleDialogState;
  setState: (s: RoleDialogState) => void;
  onAssign: () => void;
  loading: boolean;
}

export function RoleDialog({ state, setState, onAssign, loading }: RoleDialogProps) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => setState({ open, user: null })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            تغيير الدور
          </DialogTitle>
          <DialogDescription>
            اختر الدور الجديد للمستخدم {state.user?.name || state.user?.email || ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label className="text-sm font-bold">الدور</Label>
          <Select value={state.role || ""} onValueChange={(v) => setState({ ...state, role: v as UserRole })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_TABS.filter((r) => r.value !== "all").map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => setState({ open: false, user: null })}>
            إلغاء
          </AdminButton>
          <AdminButton onClick={onAssign} disabled={!state.role} loading={loading}>
            حفظ
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BulkRoleDialogProps {
  state: BulkRoleDialogState;
  setState: (s: BulkRoleDialogState) => void;
  onAssign: () => void;
  loading: boolean;
}

export function BulkRoleDialog({ state, setState, onAssign, loading }: BulkRoleDialogProps) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => setState({ open, ids: [] })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            تعيين دور لـ {state.ids.length} مستخدم
          </DialogTitle>
          <DialogDescription>اختر الدور الجديد للمستخدمين المحددين.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label className="text-sm font-bold">الدور</Label>
          <Select value={state.role || ""} onValueChange={(v) => setState({ ...state, role: v as UserRole })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_TABS.filter((r) => r.value !== "all").map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <AdminButton variant="outline" onClick={() => setState({ open: false, ids: [] })}>
            إلغاء
          </AdminButton>
          <AdminButton onClick={onAssign} disabled={!state.role} loading={loading}>
            تعيين الدور
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}