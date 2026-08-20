"use client";

import * as React from "react";
import { Bell, RefreshCw, RotateCcw, Send, XCircle, Info, Plus, Users, Hash, Clock, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useUnifiedNotifications } from "@/hooks/use-unified-notifications";
import { ANNOUNCEMENT_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { adminApi } from "@/lib/api/admin-api";
import { toast } from "sonner";

interface BroadcastDetail {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  stats?: { total?: number; sent?: number; failed?: number };
  createdAt?: string;
}

export default function AdminNotificationsPage() {
  const {
    broadcasts,
    stats,
    isLoading,
    refetch,
    cancelBroadcast,
    resendFailed,
    isCancelling,
    isResending,
  } = useUnifiedNotifications();

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = React.useState<BroadcastDetail | null>(null);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [composeForm, setComposeForm] = React.useState({
    title: "", message: "", type: "push" as "push" | "email" | "sms", targetAudience: "all",
  });

  const handleSendNotification = async () => {
    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      toast.error("يرجى ملء العنوان والرسالة");
      return;
    }
    setIsSending(true);
    try {
      const response = await adminApi.fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeForm),
      });
      if (response.ok) {
        toast.success("تم إرسال الإشعار بنجاح");
        setComposeOpen(false);
        setComposeForm({ title: "", message: "", type: "push", targetAudience: "all" });
        void requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(() => {});
        refetch();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.error || "فشل إرسال الإشعار");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelBroadcast = (broadcastId: string) => {
    cancelBroadcast(broadcastId);
    void requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(() => {});
  };

  const handleResendFailed = (broadcastId: string) => {
    resendFailed(broadcastId);
    void requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(() => {});
  };

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <PageHeader
        title="إدارة الإشعارات"
        description="متابعة البث الجماعي، الإحصاءات، وإعادة محاولة الرسائل الفاشلة."
      >
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={RefreshCw} onClick={refetch} loading={isLoading}>تحديث</AdminButton>
          <AdminButton icon={Plus} onClick={() => setComposeOpen(true)}>إشعار جديد</AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminCard className="p-5">
          <p className="text-xs font-bold text-muted-foreground">إجمالي البث</p>
          <h3 className="mt-2 text-3xl font-black">{broadcasts.length}</h3>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-xs font-bold text-muted-foreground">تم الإرسال</p>
          <h3 className="mt-2 text-3xl font-black">{stats?.sent || stats?.totalSent || 0}</h3>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-xs font-bold text-muted-foreground">فشل</p>
          <h3 className="mt-2 text-3xl font-black">{stats?.failed || stats?.totalFailed || 0}</h3>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-xs font-bold text-muted-foreground">قيد الجدولة</p>
          <h3 className="mt-2 text-3xl font-black">
            {broadcasts.filter((broadcast) => broadcast.status === "scheduled").length}
          </h3>
        </AdminCard>
      </div>

      <AdminCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-black">سجل البث</h2>
          </div>
          <AdminButton variant="outline" icon={RefreshCw} onClick={refetch} loading={isLoading}>
            تحديث
          </AdminButton>
        </div>

        <div className="divide-y">
          {broadcasts.length === 0 && (
            <div className="p-8 text-center text-sm font-bold text-muted-foreground">
              لا توجد حملات إشعارات حتى الآن.
            </div>
          )}

          {broadcasts.map((broadcast) => (
            <div key={broadcast.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black">{broadcast.title}</h3>
                  <Badge variant="outline">{broadcast.status}</Badge>
                  <Badge variant="secondary">{broadcast.type}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{broadcast.message}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>الإجمالي: {broadcast.stats?.total ?? 0}</span>
                  <span>تم: {broadcast.stats?.sent ?? 0}</span>
                  <span>فشل: {broadcast.stats?.failed ?? 0}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {broadcast.status === "scheduled" && (
                  <AdminButton
                    variant="outline"
                    size="sm"
                    icon={XCircle}
                    loading={isCancelling}
                    onClick={() => handleCancelBroadcast(broadcast.id)}
                  >
                    إلغاء
                  </AdminButton>
                )}
                {(broadcast.stats?.failed || 0) > 0 && (
                  <AdminButton
                    variant="outline"
                    size="sm"
                    icon={RotateCcw}
                    loading={isResending}
                    onClick={() => handleResendFailed(broadcast.id)}
                    className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  >
                    إعادة إرسال الإشعار الجماعي
                  </AdminButton>
                )}
                <AdminButton
                  variant="ghost"
                  size="sm"
                  icon={Info}
                  onClick={() => { setSelectedBroadcast(broadcast as BroadcastDetail); setDetailsOpen(true); }}
                >
                  التفاصيل
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
      {/* Broadcast Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              تفاصيل الإشعار
            </DialogTitle>
          </DialogHeader>
          {selectedBroadcast && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-bold mb-1">النوع</p>
                  <Badge variant="outline" className="font-black text-xs">{selectedBroadcast.type}</Badge>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-bold mb-1">الحالة</p>
                  <Badge variant="outline" className="font-black text-xs">{selectedBroadcast.status}</Badge>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">تم الإرسال</p>
                    <p className="font-black">{selectedBroadcast.stats?.sent ?? 0}</p>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">فشل</p>
                    <p className="font-black">{selectedBroadcast.stats?.failed ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-xs font-black text-muted-foreground mb-2">العنوان</p>
                <p className="font-bold">{selectedBroadcast.title}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-xs font-black text-muted-foreground mb-2">الرسالة</p>
                <p className="text-sm leading-relaxed">{selectedBroadcast.message}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setDetailsOpen(false)} className="px-4 py-2 text-sm font-bold rounded-xl border border-border hover:bg-accent transition-colors">
              إغلاق
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose New Notification Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              إشعار جماعي جديد
            </DialogTitle>
            <DialogDescription>أرسل إشعاراً لجميع المستخدمين أو مجموعة محددة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-bold mb-2 block">العنوان</label>
              <Input
                value={composeForm.title}
                onChange={(e) => setComposeForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="عنوان الإشعار..."
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">الرسالة</label>
              <Textarea
                value={composeForm.message}
                onChange={(e) => setComposeForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="محتوى الإشعار..."
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold mb-2 block">نوع الإشعار</label>
                <select
                  value={composeForm.type}
                  onChange={(e) => setComposeForm((p) => ({ ...p, type: e.target.value as "push" | "email" | "sms" }))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm font-bold"
                >
                  <option value="push">Push</option>
                  <option value="email">بريد إلكتروني</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">الجمهور المستهدف</label>
                <select
                  value={composeForm.targetAudience}
                  onChange={(e) => setComposeForm((p) => ({ ...p, targetAudience: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm font-bold"
                >
                  <option value="all">الكل</option>
                  <option value="students">الطلاب</option>
                  <option value="teachers">المعلمون</option>
                  <option value="admins">المديرون</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setComposeOpen(false)} className="px-4 py-2 text-sm font-bold rounded-xl border border-border hover:bg-accent transition-colors">
              إلغاء
            </button>
            <button
              onClick={handleSendNotification}
              disabled={isSending}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
