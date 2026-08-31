"use client";

import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import type {
  ActivateDialogState, DeleteDialogState, RestoreDialogState, VerifyDialogState,
} from "../_components/list-types";

interface DeleteConfirmProps {
  state: DeleteDialogState;
  setState: (s: DeleteDialogState) => void;
  onConfirm: (ids: string[]) => void;
  loading: boolean;
}

export function DeleteConfirm({ state, setState, onConfirm, loading }: DeleteConfirmProps) {
  return (
    <AdminConfirm
      open={state.open}
      onOpenChange={(open) => setState({ open, ids: [] })}
      title={state.ids.length > 1 ? `حذف ${state.ids.length} مستخدم؟` : "حذف حساب مستخدم؟"}
      description="سيتم الحذف الناعم (Soft Delete) — لا تُحذف البيانات نهائياً ويمكن استعادتها لاحقاً."
      confirmText="تأكيد الحذف الناعم"
      variant="destructive"
      onConfirm={() => onConfirm(state.ids)}
      loading={loading}
    />
  );
}

interface RestoreConfirmProps {
  state: RestoreDialogState;
  setState: (s: RestoreDialogState) => void;
  onConfirm: (ids: string[]) => void;
  loading: boolean;
}

export function RestoreConfirm({ state, setState, onConfirm, loading }: RestoreConfirmProps) {
  return (
    <AdminConfirm
      open={state.open}
      onOpenChange={(open) => setState({ open, ids: [] })}
      title={state.ids.length > 1 ? `استعادة ${state.ids.length} مستخدم؟` : "استعادة حساب مستخدم؟"}
      description="سيتم استعادة الحساب المحذوف وجميع بياناته المرتبطة."
      confirmText="تأكيد الاستعادة"
      variant="success"
      onConfirm={() => onConfirm(state.ids)}
      loading={loading}
    />
  );
}

interface ActivateConfirmProps {
  state: ActivateDialogState;
  setState: (s: ActivateDialogState) => void;
  onConfirm: (ids: string[]) => void;
  loading: boolean;
}

export function ActivateConfirm({ state, setState, onConfirm, loading }: ActivateConfirmProps) {
  return (
    <AdminConfirm
      open={state.open}
      onOpenChange={(open) => setState({ open, ids: [] })}
      title={state.ids.length > 1 ? `تفعيل ${state.ids.length} مستخدم؟` : "تفعيل حساب مستخدم؟"}
      description="سيتم إعادة تفعيل الحساب والسماح بتسجيل الدخول واستخدام API."
      confirmText="تأكيد التفعيل"
      variant="success"
      onConfirm={() => onConfirm(state.ids)}
      loading={loading}
    />
  );
}

interface VerifyConfirmProps {
  state: VerifyDialogState;
  setState: (s: VerifyDialogState) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function VerifyConfirm({ state, setState, onConfirm, loading }: VerifyConfirmProps) {
  const type = state.type === "email" ? "البريد الإلكتروني" : "رقم الهاتف";
  return (
    <AdminConfirm
      open={state.open}
      onOpenChange={(open) => setState({ open, user: null, type: state.type })}
      title={state.type === "email" ? "توثيق البريد الإلكتروني" : "توثيق رقم الهاتف"}
      description={`هل أنت متأكد من توثيق ${type} للمستخدم ${state.user?.name || state.user?.email || ""}؟`}
      confirmText="تأكيد التوثيق"
      variant="success"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}