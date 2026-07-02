"use client";

import * as React from "react";
import type { UserDetails } from "./types";
import type { WalletTransaction } from "@/types/wallet";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Loader2,
  Receipt,
  Wallet,
  Coins,
  Bot,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  MinusCircle,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string | null;
  transactionId?: string | null;
  createdAt: string;
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-success/10 text-success border-success/20",
  PENDING: "bg-warning/10 text-warning border-warning/20",
  FAILED: "bg-danger/10 text-danger border-danger/20",
  REFUNDED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  COMPLETED: "مكتملة",
  PENDING: "قيد المعالجة",
  FAILED: "فاشلة",
  REFUNDED: "مستردة",
};

export function BillingTab({
  user,
  canManage,
}: {
  user: UserDetails;
  canManage: boolean;
}) {
  const [payments, setPayments] = React.useState<AdminPayment[]>([]);
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [refundPayment, setRefundPayment] = React.useState<AdminPayment | null>(null);
  const [refundAmount, setRefundAmount] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsResponse, walletResponse] = await Promise.all([
        adminFetch(`/admin/payments?userId=${encodeURIComponent(user.id)}&limit=100`),
        adminFetch(apiRoutes.admin.wallet(user.id)),
      ]);
      if (paymentsResponse.ok) {
        const payload = await paymentsResponse.json();
        setPayments(payload.data?.payments || payload.payments || []);
      }
      if (walletResponse.ok) {
        const payload = await walletResponse.json();
        setTransactions(
          payload.data?.transactions || payload.transactions || payload.data || []
        );
      }
    } catch {
      toast.error("تعذر تحميل البيانات المالية");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const adjustBalance = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value === 0)
      return toast.error("أدخل مبلغًا صحيحًا");
    if (reason.trim().length < 5)
      return toast.error("سبب التعديل إلزامي ويجب أن يكون واضحًا");
    setSaving(true);
    try {
      const response = await adminFetch(apiRoutes.admin.wallet(user.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          reason: reason.trim(),
          type: "ADJUSTMENT",
        }),
      });
      if (!response.ok) throw new Error();
      toast.success("تم تعديل الرصيد وتسجيل السبب");
      setAdjustOpen(false);
      setAmount("");
      setReason("");
      await load();
    } catch {
      toast.error("فشل تعديل الرصيد");
    } finally {
      setSaving(false);
    }
  };

  const refund = async () => {
    if (!refundPayment) return;
    const value = Number(refundAmount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      value > refundPayment.amount
    )
      return toast.error("قيمة الاسترداد غير صحيحة");
    if (refundReason.trim().length < 5)
      return toast.error("سبب الاسترداد إلزامي");
    setSaving(true);
    try {
      const response = await adminFetch("/admin/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: refundPayment.id,
          amount: value,
          reason: refundReason.trim(),
        }),
      });
      if (!response.ok) throw new Error();
      toast.success("تم تنفيذ الاسترداد وتسجيل سببه");
      setRefundPayment(null);
      setRefundReason("");
      await load();
    } catch {
      toast.error("فشل تنفيذ الاسترداد");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">جاري تحميل البيانات المالية...</p>
      </div>
    );

  const totalPaid = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                رصيد المحفظة
              </span>
            </div>
            <p className="text-3xl font-black">
              {(user.balance || 0).toLocaleString()}
              <span className="text-sm font-bold text-muted-foreground mr-1">ج.م</span>
            </p>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-8 rounded-xl text-xs font-bold gap-1.5 w-full border-primary/20 hover:bg-primary/5"
                onClick={() => setAdjustOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                تعديل الرصيد
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                رصيد الذكاء الاصطناعي
              </span>
            </div>
            <p className="text-3xl font-black text-blue-500">
              {(user.aiCredits || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">رصيد AI متاح</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500/10 to-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Coins className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                رصيد الاختبارات
              </span>
            </div>
            <p className="text-3xl font-black text-amber-500">
              {(user.examCredits || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">اختبار متاح</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-sm">الاشتراك الحالي</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.activeSubscriptionId || "لا يوجد اشتراك نشط"}
                </p>
              </div>
            </div>
            {user.subscriptionExpiresAt && (
              <div className="text-left">
                <Badge
                  className={`text-xs font-bold rounded-full ${
                    new Date(user.subscriptionExpiresAt) > new Date()
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-danger/10 text-danger border-danger/20"
                  }`}
                >
                  {new Date(user.subscriptionExpiresAt) > new Date()
                    ? "نشط"
                    : "منتهي"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {isValid(new Date(user.subscriptionExpiresAt))
                    ? format(new Date(user.subscriptionExpiresAt), "d MMMM yyyy", {
                        locale: ar,
                      })
                    : "-"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Transactions */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              حركات المحفظة
            </CardTitle>
            <CardDescription>
              كل حركة مالية مع المرجع والوصف
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={load}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              تحديث
            </Button>
            {canManage && (
              <Button
                size="sm"
                className="rounded-xl gap-1.5"
                onClick={() => setAdjustOpen(true)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                تعديل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((item) => {
                const isPositive = item.amount >= 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border p-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isPositive
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {item.description || item.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isValid(new Date(item.createdAt))
                            ? format(new Date(item.createdAt), "d MMM yyyy · HH:mm", {
                                locale: ar,
                              })
                            : new Date(item.createdAt).toLocaleString("ar-EG")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-black text-lg ${
                        isPositive ? "text-success" : "text-danger"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {item.amount.toLocaleString()} {item.currency}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد حركات محفظة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            المدفوعات والفواتير
          </CardTitle>
          <CardDescription>
            {payments.length} دفعة مسجلة · إجمالي مدفوع:{" "}
            <span className="text-success font-bold">
              {totalPaid.toLocaleString()} ج.م
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-xl border p-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {payment.transactionId || payment.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isValid(new Date(payment.createdAt))
                          ? format(new Date(payment.createdAt), "d MMM yyyy · HH:mm", {
                              locale: ar,
                            })
                          : new Date(payment.createdAt).toLocaleString("ar-EG")}
                        {payment.method && ` · ${payment.method}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-black text-base">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <Badge
                        className={`text-[10px] font-bold rounded-full border ${
                          PAYMENT_STATUS_STYLES[payment.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                      </Badge>
                    </div>
                    {canManage && payment.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs h-8 border-danger/20 hover:bg-danger/5 hover:text-danger"
                        onClick={() => {
                          setRefundPayment(payment);
                          setRefundAmount(String(payment.amount));
                        }}
                      >
                        <MinusCircle className="h-3.5 w-3.5 mr-1" />
                        استرداد
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد مدفوعات مسجلة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Balance Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent
          dir="rtl"
          className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md"
        >
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <Wallet className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-xl font-black">
              تعديل رصيد المستخدم
            </DialogTitle>
            <DialogDescription className="text-center">
              أدخل قيمة موجبة للإضافة أو سالبة للخصم من رصيد {user.name || user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-bold">المبلغ (ج.م)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثال: 50 للإضافة أو -30 للخصم"
                className="h-12 rounded-xl"
              />
              {Number(amount) !== 0 && (
                <p className={`text-xs font-bold flex items-center gap-1 ${Number(amount) > 0 ? "text-success" : "text-danger"}`}>
                  {Number(amount) > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {Number(amount) > 0 ? "إضافة" : "خصم"}{" "}
                  {Math.abs(Number(amount)).toLocaleString()} ج.م
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">سبب التعديل *</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: مكافأة على الأداء، تصحيح خطأ..."
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={() => setAdjustOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              className="flex-1 rounded-xl h-11"
              onClick={adjustBalance}
              disabled={saving || !amount || !reason.trim()}
            >
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ التعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog
        open={!!refundPayment}
        onOpenChange={(open) => !open && setRefundPayment(null)}
      >
        <DialogContent
          dir="rtl"
          className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md"
        >
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger border border-danger/20">
              <MinusCircle className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-xl font-black">
              استرداد دفعة
            </DialogTitle>
            <DialogDescription className="text-center">
              حدد المبلغ المراد استرداده (الحد الأقصى:{" "}
              {refundPayment?.amount.toLocaleString()} {refundPayment?.currency})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-bold">مبلغ الاسترداد</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={refundPayment?.amount}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">سبب الاسترداد *</label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="سبب الاسترداد"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={() => setRefundPayment(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl h-11"
              onClick={refund}
              disabled={saving}
            >
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد الاسترداد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
