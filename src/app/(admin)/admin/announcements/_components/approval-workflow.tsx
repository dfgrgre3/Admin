"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Send,
  PenLine,
  History,
  AlertTriangle,
  Info,
  User,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import {
  Announcement,
  APPROVAL_STATUS_CONFIG,
  ApprovalAction,
  ApprovalStatus,
} from "./types";

interface ApprovalPanelProps {
  announcement: Announcement;
  onUpdate: () => void;
}

export function ApprovalPanel({ announcement, onUpdate }: ApprovalPanelProps) {
  const [submitDialog, setSubmitDialog] = React.useState(false);
  const [rejectDialog, setRejectDialog] = React.useState(false);
  const [approveDialog, setApproveDialog] = React.useState(false);
  const [signDialog, setSignDialog] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const status: ApprovalStatus = announcement.approvalStatus || "draft";
  const config = APPROVAL_STATUS_CONFIG[status];

  const Icon = config.icon;

  const callAction = async (
    action: ApprovalAction["action"],
    extra: Record<string, unknown> = {}
  ) => {
    setSubmitting(true);
    try {
      const res = await adminFetch(
        `/api/admin/announcements/${announcement.id}/approval`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, comment, ...extra }),
        }
      );
      if (res.ok) {
        toast.success("تم تنفيذ الإجراء بنجاح");
        onUpdate();
        setComment("");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string })?.error || "فشل تنفيذ الإجراء");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = status === "draft" || status === "rejected";
  const canApprove = status === "pending_review";
  const canPublish = status === "approved" && !announcement.isActive;

  return (
    <div className="space-y-4">
      {/* بطاقة الحالة */}
      <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                حالة الموافقة
              </p>
              <p className="text-base font-black">{config.label}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("border", config.color)}>
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-bold">{config.description}</p>

        {/* التوقيع الإلكتروني */}
        {announcement.signature && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <PenLine className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                موقّع إلكترونياً
              </p>
            </div>
            <div className="space-y-1 text-[11px]">
              <p className="text-muted-foreground">
                <span className="font-bold">الموقّع:</span>{" "}
                {announcement.signature.signedByName}
              </p>
              <p className="text-muted-foreground">
                <span className="font-bold">التاريخ:</span>{" "}
                {formatDateTime(announcement.signature.signedAt)}
              </p>
              {announcement.signature.confirmation && (
                <p className="text-muted-foreground italic">
                  "{announcement.signature.confirmation}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* معلومات المراجعة */}
        {announcement.approvedBy && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              معتمد بواسطة <strong>{announcement.approvedByName}</strong> في{" "}
              {formatDateTime(announcement.approvedAt || "")}
            </span>
          </div>
        )}

        {/* الأزرار */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {canSubmit && (
            <AdminButton
              size="sm"
              icon={Send}
              onClick={() => setSubmitDialog(true)}
            >
              إرسال للمراجعة
            </AdminButton>
          )}
          {canApprove && (
            <>
              <AdminButton
                size="sm"
                icon={CheckCircle}
                variant="success"
                onClick={() => setApproveDialog(true)}
              >
                اعتماد
              </AdminButton>
              <AdminButton
                size="sm"
                icon={XCircle}
                variant="destructive"
                onClick={() => setRejectDialog(true)}
              >
                رفض
              </AdminButton>
            </>
          )}
          {status === "approved" && announcement.requiresApproval && !announcement.signature && (
            <AdminButton
              size="sm"
              icon={PenLine}
              variant="outline"
              onClick={() => setSignDialog(true)}
            >
              توقيع إلكتروني
            </AdminButton>
          )}
          {canPublish && (
            <AdminButton
              size="sm"
              icon={Send}
              onClick={() => callAction("publish")}
              loading={submitting}
            >
              نشر
            </AdminButton>
          )}
        </div>
      </div>

      {/* سجل الموافقات */}
      <ApprovalHistory announcementId={announcement.id} />

      {/* نوافذ الحوار */}
      <AdminConfirm
        open={submitDialog}
        onOpenChange={setSubmitDialog}
        title="إرسال للمراجعة؟"
        description="سيتم إرسال الإعلان إلى المسؤول الأعلى لمراجعته واعتماده قبل النشر."
        confirmText="إرسال"
        onConfirm={() => {
          setSubmitDialog(false);
          callAction("submit_for_review");
        }}
      />

      <AdminConfirm
        open={approveDialog}
        onOpenChange={setApproveDialog}
        title="اعتماد الإعلان؟"
        description="بمجرد الاعتماد، سيكون الإعلان جاهزاً للنشر."
        confirmText="اعتماد"
        variant="success"
        onConfirm={() => {
          setApproveDialog(false);
          callAction("approve");
        }}
      />

      <AdminConfirm
        open={rejectDialog}
        onOpenChange={setRejectDialog}
        title="رفض الإعلان؟"
        description="سيتم إرجاع الإعلان للكاتب لإجراء التعديلات."
        confirmText="رفض"
        variant="destructive"
        onConfirm={() => {
          setRejectDialog(false);
          callAction("reject");
        }}
      />

      <SignatureDialog
        open={signDialog}
        onOpenChange={setSignDialog}
        announcement={announcement}
        onComplete={() => {
          setSignDialog(false);
          onUpdate();
        }}
      />
    </div>
  );
}

function ApprovalHistory({ announcementId }: { announcementId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "approval-history", announcementId],
    queryFn: async () => {
      try {
        const res = await adminFetch(
          `/api/admin/announcements/${announcementId}/approval-history`
        );
        if (!res.ok) return { actions: [] as ApprovalAction[] };
        const json = await res.json();
        return {
          actions:
            (json?.data?.actions as ApprovalAction[]) ||
            (json?.actions as ApprovalAction[]) ||
            [],
        };
      } catch {
        return { actions: [] as ApprovalAction[] };
      }
    },
    staleTime: 60000,
  });

  const actions = data?.actions || [];

  if (isLoading) return null;
  if (actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-violet-500" />
        <p className="text-xs font-black uppercase tracking-wider">
          سجل الموافقات
        </p>
      </div>
      <ol className="space-y-2">
        {actions.map((action) => (
          <li
            key={action.id}
            className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/2.5 p-2.5"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black">{action.actorName}</p>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(action.createdAt)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {action.action}
              </p>
              {action.comment && (
                <p className="mt-1 text-[11px] italic text-foreground/70">
                  "{action.comment}"
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** نافذة التوقيع الإلكتروني */
function SignatureDialog({
  open,
  onOpenChange,
  announcement,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  announcement: Announcement;
  onComplete: () => void;
}) {
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSign = async () => {
    if (!password) {
      toast.error("يرجى إدخال كلمة المرور للتأكيد");
      return;
    }
    if (!confirmation.trim()) {
      toast.error("يرجى كتابة جملة التأكيد");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch(
        `/api/admin/announcements/${announcement.id}/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmation }),
        }
      );
      if (res.ok) {
        toast.success("تم التوقيع الإلكتروني بنجاح");
        setPassword("");
        setConfirmation("");
        onComplete();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string })?.error || "فشل التوقيع");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <PenLine className="h-5 w-5 text-emerald-500" />
              التوقيع الإلكتروني
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              وقّع الإعلان لتأكيد مسؤوليتك الشخصية عن المحتوى قبل النشر
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                التوقيع الإلكتروني يُسجَّل في السجلات مع التاريخ والوقت وعنوان
                IP الخاص بك. لا يمكن التراجع عنه.
              </p>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                جملة التأكيد
              </label>
              <Input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="مثال: أؤكد أن المحتوى صحيح ومسؤولي عنه"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                كلمة المرور للتأكيد
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 justify-end">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              إلغاء
            </AdminButton>
            <AdminButton
              icon={PenLine}
              size="sm"
              onClick={handleSign}
              loading={submitting}
            >
              توقيع ونشر
            </AdminButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** بطاقة تفعيل سير الموافقة في النموذج */
export function ApprovalToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/2.5 p-4 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
          <ShieldCheck className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-black">يتطلب موافقة</p>
          <p className="text-[10px] text-muted-foreground font-bold">
            يجب اعتماد الإعلان من مسؤول أعلى قبل النشر
          </p>
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}