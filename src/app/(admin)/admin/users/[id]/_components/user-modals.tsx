"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Ban,
  UserX,
  UserCheck,
  Lock,
  Mail,
  LogIn,
  Trash2,
  AlertTriangle,
  Shield,
  RefreshCw,
  Send,
  Merge,
} from "lucide-react";
import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { UserDetails } from "./types";
import { roleOptions } from "./types";

// ─── BanUserModal ─────────────────────────────────────────────────────────────

const banSchema = z.object({
  reason: z.string().min(5, "السبب مطلوب ويجب أن يكون 5 أحرف على الأقل"),
  permanent: z.boolean(),
  expiresAt: z.string().optional(),
  notifyUser: z.boolean(),
  hideContent: z.boolean(),
});
type BanFormValues = z.infer<typeof banSchema>;

interface BanUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserDetails | AdminUserListItem, "id" | "name" | "email"> | null;
  onSuccess?: () => void;
}

export function BanUserModal({ open, onOpenChange, user, onSuccess }: BanUserModalProps) {
  const form = useForm<BanFormValues>({
    resolver: zodResolver(banSchema),
    defaultValues: { reason: "", permanent: true, notifyUser: true, hideContent: false },
  });
  const [submitting, setSubmitting] = React.useState(false);
  const isPermanent = form.watch("permanent");

  React.useEffect(() => { if (!open) form.reset(); }, [open, form]);

  const handleSubmit = async (values: BanFormValues) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await adminUsersApi.ban(user.id, {
        reason: values.reason,
        permanent: values.permanent,
        expiresAt: values.permanent ? undefined : values.expiresAt,
        notifyUser: values.notifyUser,
        hideContent: values.hideContent,
      });
      toast.success(`تم حظر ${user.name || user.email} بنجاح`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل تنفيذ الحظر، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-red-500/20 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <Ban className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-red-500">حظر المستخدم</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            حظر <span className="font-bold text-foreground">{user?.name || user?.email}</span>. سيتم إنهاء جلساته ومنعه من الدخول.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField control={form.control} name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الحظر *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="اكتب سبب الحظر بوضوح..." rows={3} className="rounded-xl resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="permanent"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-3 bg-muted/30">
                  <div>
                    <FormLabel className="font-bold">حظر دائم</FormLabel>
                    <FormDescription className="text-xs">إذا أوقفت هذا الخيار يمكنك تحديد تاريخ انتهاء</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            {!isPermanent && (
              <FormField control={form.control} name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ انتهاء الحظر</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex gap-4">
              <FormField control={form.control} name="notifyUser"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">إشعار المستخدم بالبريد</FormLabel>
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="hideContent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">إخفاء محتواه</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
              <AdminButton type="submit" variant="destructive" loading={submitting} icon={Ban} className="flex-1 rounded-xl">تأكيد الحظر</AdminButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── SuspendUserModal ─────────────────────────────────────────────────────────

interface SuspendUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserDetails | AdminUserListItem, "id" | "name" | "email"> | null;
  onSuccess?: () => void;
}

export function SuspendUserModal({ open, onOpenChange, user, onSuccess }: SuspendUserModalProps) {
  const [reason, setReason] = React.useState("");
  const [durationHours, setDurationHours] = React.useState(24);
  const [notifyUser, setNotifyUser] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { if (!open) { setReason(""); setDurationHours(24); } }, [open]);

  const handleSubmit = async () => {
    if (!user || !reason.trim()) return toast.error("السبب مطلوب");
    setSubmitting(true);
    try {
      await adminUsersApi.suspend(user.id, { reason, durationHours, notifyUser });
      toast.success(`تم إيقاف ${user.name || user.email} مؤقتاً`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل تنفيذ الإيقاف");
    } finally {
      setSubmitting(false);
    }
  };

  const presets = [{ label: "ساعة", h: 1 }, { label: "يوم", h: 24 }, { label: "أسبوع", h: 168 }, { label: "شهر", h: 720 }];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-amber-500/20 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <UserX className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-amber-500">إيقاف مؤقت</DialogTitle>
          <DialogDescription className="text-center">إيقاف <span className="font-bold text-foreground">{user?.name || user?.email}</span> مؤقتاً عن الدخول.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="font-bold">السبب *</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="سبب الإيقاف..." rows={2} className="rounded-xl resize-none" />
          </div>
          <div>
            <Label className="font-bold mb-2 block">المدة</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button key={p.h} type="button" onClick={() => setDurationHours(p.h)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${durationHours === p.h ? "bg-amber-500 text-white border-amber-500" : "border-border hover:border-amber-300"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="notify-suspend" checked={notifyUser} onCheckedChange={v => setNotifyUser(!!v)} />
            <Label htmlFor="notify-suspend" className="text-sm cursor-pointer">إشعار المستخدم بالبريد</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="warning" loading={submitting} icon={UserX} className="flex-1 rounded-xl" onClick={handleSubmit}>تأكيد الإيقاف</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ChangeRoleModal ──────────────────────────────────────────────────────────

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserDetails | AdminUserListItem, "id" | "name" | "email" | "role"> | null;
  onSuccess?: () => void;
}

export function ChangeRoleModal({ open, onOpenChange, user, onSuccess }: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = React.useState("STUDENT");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { if (open && user) setSelectedRole(user.role || "STUDENT"); }, [open, user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await adminUsersApi.changeRole(user.id, { role: selectedRole, reason });
      toast.success(`تم تغيير دور ${user.name || user.email}`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل تغيير الدور");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <Shield className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-black">تغيير دور المستخدم</DialogTitle>
          <DialogDescription className="text-center">تغيير دور <span className="font-bold text-foreground">{user?.name || user?.email}</span></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="font-bold mb-2 block">الدور الجديد</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map(r => <SelectItem key={r.value} value={r.value} className="font-bold">{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="font-bold">سبب التغيير</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="اكتب سبب تغيير الدور..." rows={2} className="rounded-xl resize-none" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="default" loading={submitting} icon={Shield} className="flex-1 rounded-xl" onClick={handleSubmit}>حفظ الدور</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ResetPasswordModal ───────────────────────────────────────────────────────

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string | null;
  onSuccess?: () => void;
}

export function ResetPasswordModal({ open, onOpenChange, userId, userName, onSuccess }: ResetPasswordModalProps) {
  const [sendLink, setSendLink] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [forceChange, setForceChange] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { if (!open) { setSendLink(false); setNewPassword(""); } }, [open]);

  const handleSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      if (sendLink) {
        await adminUsersApi.sendPasswordReset(userId);
        toast.success("تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني");
      } else if (newPassword && newPassword.length >= 8) {
        await adminUsersApi.resetPassword(userId, newPassword);
        toast.success("تم تعيين كلمة المرور الجديدة بنجاح");
      } else {
        return toast.error("أدخل كلمة مرور صالحة (8 أحرف على الأقل)");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل إعادة تعيين كلمة المرور");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Lock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-xl font-black">إعادة تعيين كلمة المرور</DialogTitle>
          <DialogDescription className="text-center">للمستخدم: <span className="font-bold text-foreground">{userName}</span></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-xl border p-3 bg-blue-500/5">
            <div>
              <p className="font-bold text-sm">إرسال رابط إعادة التعيين</p>
              <p className="text-xs text-muted-foreground">سيُرسل رابط آمن إلى بريد المستخدم</p>
            </div>
            <Switch checked={sendLink} onCheckedChange={setSendLink} />
          </div>
          {!sendLink && (
            <div className="space-y-1.5">
              <Label className="font-bold">كلمة مرور جديدة</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} dir="ltr" className="rounded-xl h-11" placeholder="أدخل 8 أحرف على الأقل..." />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox id="force-change" checked={forceChange} onCheckedChange={v => setForceChange(!!v)} />
            <Label htmlFor="force-change" className="text-sm cursor-pointer">إجبار المستخدم على تغيير كلمة مرور عند أول دخول</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="default" loading={submitting} icon={RefreshCw} className="flex-1 rounded-xl" onClick={handleSubmit}>تأكيد</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── InviteUserModal ──────────────────────────────────────────────────────────

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillEmail?: string;
  onSuccess?: () => void;
}

export function InviteUserModal({ open, onOpenChange, prefillEmail, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = React.useState(prefillEmail || "");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("STUDENT");
  const [message, setMessage] = React.useState("");
  const [expiresInHours, setExpiresInHours] = React.useState(72);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { if (!open) { setEmail(""); setName(""); setMessage(""); } }, [open]);
  React.useEffect(() => { if (prefillEmail) setEmail(prefillEmail); }, [prefillEmail]);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return toast.error("بريد إلكتروني غير صالح");
    setSubmitting(true);
    try {
      await adminUsersApi.invite({ email, name: name || undefined, role, message: message || undefined, expiresInHours });
      toast.success(`تم إرسال الدعوة إلى ${email}`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل إرسال الدعوة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
            <Mail className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-black">دعوة مستخدم جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="font-bold">البريد الإلكتروني *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" className="rounded-xl h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-bold">الاسم</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold">الدور</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-bold">رسالة (اختياري)</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} className="rounded-xl resize-none" placeholder="رسالة ترحيب..." />
          </div>
          <div>
            <Label className="font-bold mb-2 block">صلاحية الدعوة</Label>
            <div className="flex gap-2">
              {[{ l: "يوم", h: 24 }, { l: "3 أيام", h: 72 }, { l: "أسبوع", h: 168 }].map(p => (
                <button key={p.h} type="button" onClick={() => setExpiresInHours(p.h)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${expiresInHours === p.h ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton loading={submitting} icon={Send} className="flex-1 rounded-xl" onClick={handleSubmit}>إرسال الدعوة</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── MergeUsersModal ──────────────────────────────────────────────────────────

interface MergeUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryUserId: string | null;
  primaryUserName?: string | null;
  onSuccess?: () => void;
}

export function MergeUsersModal({ open, onOpenChange, primaryUserId, primaryUserName, onSuccess }: MergeUsersModalProps) {
  const [secondaryId, setSecondaryId] = React.useState("");
  const [confirmText, setConfirmText] = React.useState("");
  const [mergeOrders, setMergeOrders] = React.useState(true);
  const [mergeEnrollments, setMergeEnrollments] = React.useState(true);
  const [mergeCertificates, setMergeCertificates] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { if (!open) { setSecondaryId(""); setConfirmText(""); } }, [open]);

  const handleMerge = async () => {
    if (!primaryUserId || !secondaryId) return toast.error("أدخل ID الحساب الثانوي");
    if (confirmText !== "MERGE") return toast.error("الرجاء كتابة MERGE للتأكيد");
    setSubmitting(true);
    try {
      await adminUsersApi.merge(primaryUserId, secondaryId, { mergeOrders, mergeEnrollments, mergeCertificates });
      toast.success("تم دمج الحسابين بنجاح");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل دمج الحسابين");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-destructive/20 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <Merge className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-black">دمج الحسابين</DialogTitle>
          <DialogDescription className="text-center text-destructive font-medium">⚠️ هذه العملية لا يمكن التراجع عنها بسهولة</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-xl bg-muted/50 border p-3 text-sm">
            <p className="font-bold mb-1">الحساب الرئيسي (سيُحتفظ به):</p>
            <p className="text-muted-foreground font-mono text-xs">{primaryUserName || primaryUserId}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="font-bold">ID الحساب الثانوي (سيُدمج ويُحذف)</Label>
            <Input value={secondaryId} onChange={e => setSecondaryId(e.target.value)} placeholder="أدخل User ID..." className="rounded-xl h-11" dir="ltr" />
          </div>
          <div>
            <Label className="font-bold mb-2 block">ما الذي سيُدمج؟</Label>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "الطلبات", val: mergeOrders, set: setMergeOrders },
                { label: "التسجيلات", val: mergeEnrollments, set: setMergeEnrollments },
                { label: "الشهادات", val: mergeCertificates, set: setMergeCertificates },
              ].map(o => (
                <label key={o.label} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Checkbox checked={o.val} onCheckedChange={v => o.set(!!v)} />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 border border-destructive/30 rounded-xl p-3 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive text-sm font-bold">
              <AlertTriangle className="h-4 w-4" /> اكتب MERGE للتأكيد
            </div>
            <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="MERGE" dir="ltr" className="rounded-xl border-destructive/30" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="destructive" loading={submitting} icon={Merge} className="flex-1 rounded-xl" onClick={handleMerge} disabled={confirmText !== "MERGE" || !secondaryId}>تأكيد الدمج</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DeleteAnonymizeModal ─────────────────────────────────────────────────────

interface DeleteAnonymizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserDetails | AdminUserListItem, "id" | "name" | "email"> | null;
  onSuccess?: () => void;
}

export function DeleteAnonymizeModal({ open, onOpenChange, user, onSuccess }: DeleteAnonymizeModalProps) {
  const [action, setAction] = React.useState<"soft-delete" | "anonymize">("soft-delete");
  const [reason, setReason] = React.useState("");
  const [keepFinancials, setKeepFinancials] = React.useState(true);
  const [confirmText, setConfirmText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { if (!open) { setReason(""); setConfirmText(""); setAction("soft-delete"); } }, [open]);

  const handleSubmit = async () => {
    if (!user) return;
    if (confirmText !== "DELETE") return toast.error("الرجاء كتابة DELETE للتأكيد");
    setSubmitting(true);
    try {
      if (action === "anonymize") {
        await adminUsersApi.anonymize(user.id, { reason, keepFinancials });
        toast.success("تم إخفاء هوية المستخدم بنجاح (GDPR Anonymization)");
      } else {
        await adminUsersApi.remove(user.id);
        toast.success("تم حذف الحساب بنجاح (Soft Delete)");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل تنفيذ الإجراء");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-destructive/20 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <Trash2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-destructive">حذف / إخفاء الحساب</DialogTitle>
          <DialogDescription className="text-center"><span className="font-bold text-foreground">{user?.name || user?.email}</span></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setAction("soft-delete")} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${action === "soft-delete" ? "border-destructive bg-destructive/10 text-destructive" : "border-border"}`}>
              حذف مؤقت
            </button>
            <button onClick={() => setAction("anonymize")} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${action === "anonymize" ? "border-purple-500 bg-purple-500/10 text-purple-500" : "border-border"}`}>
              إخفاء هوية (GDPR)
            </button>
          </div>
          {action === "anonymize" && (
            <div className="flex items-center gap-2">
              <Checkbox id="keep-fin" checked={keepFinancials} onCheckedChange={v => setKeepFinancials(!!v)} />
              <Label htmlFor="keep-fin" className="text-sm cursor-pointer">الاحتفاظ بالفواتير لأسباب قانونية / ضريبية</Label>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="font-bold">السبب</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="rounded-xl resize-none" />
          </div>
          <div className="space-y-1.5 border border-destructive/30 rounded-xl p-3 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive text-sm font-bold mb-1">
              <AlertTriangle className="h-4 w-4" /> اكتب DELETE للتأكيد
            </div>
            <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" dir="ltr" className="rounded-xl border-destructive/30" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="destructive" loading={submitting} icon={Trash2} className="flex-1 rounded-xl" onClick={handleSubmit} disabled={confirmText !== "DELETE"}>
            {action === "anonymize" ? "إخفاء الهوية" : "حذف الحساب"}
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ImpersonateModal ─────────────────────────────────────────────────────────

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserDetails | AdminUserListItem, "id" | "name" | "email"> | null;
  onConfirm: (userId: string, reason: string) => void;
  loading?: boolean;
}

export function ImpersonateModal({ open, onOpenChange, user, onConfirm, loading }: ImpersonateModalProps) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => { if (!open) setReason(""); }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-amber-500/20 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <LogIn className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-amber-500">تبديل الهوية (Impersonate)</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground px-4">
            أنت على وشك الدخول بهوية <span className="font-bold text-foreground">{user?.name || user?.email}</span>. سيُسجَّل هذا الإجراء في سجل التدقيق.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
            <p className="font-bold mb-1 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> تنبيه أمني</p>
            <p>ستظهر المنصة كما يراها هذا المستخدم. كل إجراء تنفذه سيُسجَّل باسمك.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="font-bold">سبب الدخول (مطلوب)</Label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="مثال: حل مشكلة دعم فني..." className="rounded-xl h-11" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="warning" loading={loading} icon={LogIn} className="flex-1 rounded-xl" onClick={() => user && onConfirm(user.id, reason)} disabled={reason.trim().length < 10}>
            تأكيد الدخول
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ActivateUserModal (quick) ────────────────────────────────────────────────

interface ActivateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Pick<UserDetails | AdminUserListItem, "id" | "name" | "email"> | null;
  onSuccess?: () => void;
}

export function ActivateUserModal({ open, onOpenChange, user, onSuccess }: ActivateUserModalProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const handleActivate = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await adminUsersApi.activate(user.id);
      toast.success(`تم إعادة تفعيل ${user.name || user.email}`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("فشل إعادة التفعيل");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] border-green-500/20 bg-card/95 backdrop-blur-xl max-w-sm" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
            <UserCheck className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-green-500">إعادة تفعيل الحساب</DialogTitle>
          <DialogDescription className="text-center">
            هل تريد إعادة تفعيل <span className="font-bold text-foreground">{user?.name || user?.email}</span>؟
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <AdminButton variant="success" loading={submitting} icon={UserCheck} className="flex-1 rounded-xl" onClick={handleActivate}>تأكيد التفعيل</AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
