"use client";

import dynamic from "next/dynamic";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { CsvImportDialog } from "@/components/admin/ui/csv-import-dialog";
import type { ImpersonateDialogState, MessageDialogState } from "../_components/list-types";

const MessageModal = dynamic(
  () => import("@/components/admin/broadcast/broadcast-modal").then((mod) => ({ default: mod.BroadcastModal })),
  { ssr: false, loading: () => null },
);

interface ImpersonateConfirmProps {
  state: ImpersonateDialogState;
  setState: (s: ImpersonateDialogState) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function ImpersonateConfirm({ state, setState, onConfirm, loading }: ImpersonateConfirmProps) {
  return (
    <AdminConfirm
      open={state.open}
      onOpenChange={(open) => setState({ open, user: null })}
      title="تبديل الهوية (Impersonate)"
      description={`أنت على وشك الدخول بهوية المستخدم ${state.user?.name || "المختار"}. ستتمكن من رؤية المنصة تماماً كما يراها.`}
      confirmText="تأكيد الدخول"
      variant="premium"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

interface MessageDialogProps {
  state: MessageDialogState;
  setState: (s: MessageDialogState) => void;
}

export function MessageDialog({ state, setState }: MessageDialogProps) {
  return (
    <MessageModal
      open={state.open}
      onOpenChange={(open) => setState({ open, users: open ? state.users : [] })}
      users={state.users}
    />
  );
}

interface ImportDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onImport: (rows: Record<string, unknown>[]) => Promise<void>;
}

export function ImportDialog({ open, setOpen, onImport }: ImportDialogProps) {
  return (
    <CsvImportDialog
      open={open}
      onOpenChange={setOpen}
      title="استيراد مستخدمين من CSV"
      description="قم برفع ملف CSV يحتوي على بيانات المستخدمين لإضافتهم دفعة واحدة."
      columns={[
        { key: "email", label: "البريد الإلكتروني", required: true },
        { key: "name", label: "الاسم", required: true },
        { key: "username", label: "اسم المستخدم", required: false },
        { key: "password", label: "كلمة المرور", required: true },
        { key: "role", label: "الدور", required: false },
      ]}
      templateFileName="users-template.csv"
      onImport={onImport}
    />
  );
}