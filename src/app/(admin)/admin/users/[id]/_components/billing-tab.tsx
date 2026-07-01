"use client";

import * as React from "react";
import type { UserDetails } from "./types";
import type { WalletTransaction } from "@/types/wallet";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Loader2, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string | null;
  transactionId?: string | null;
  createdAt: string;
}

export function BillingTab({ user, canManage }: { user: UserDetails; canManage: boolean }) {
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
        setTransactions(payload.data?.transactions || payload.transactions || payload.data || []);
      }
    } catch {
      toast.error("تعذر تحميل البيانات المالية");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  React.useEffect(() => { void load(); }, [load]);

  const adjustBalance = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value === 0) return toast.error("أدخل مبلغًا صحيحًا");
    if (reason.trim().length < 5) return toast.error("سبب التعديل إلزامي ويجب أن يكون واضحًا");
    setSaving(true);
    try {
      const response = await adminFetch(apiRoutes.admin.wallet(user.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, reason: reason.trim(), type: "ADJUSTMENT" }),
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
    if (!Number.isFinite(value) || value <= 0 || value > refundPayment.amount) return toast.error("قيمة الاسترداد غير صحيحة");
    if (refundReason.trim().length < 5) return toast.error("سبب الاسترداد إلزامي");
    setSaving(true);
    try {
      const response = await adminFetch("/admin/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: refundPayment.id, amount: value, reason: refundReason.trim() }),
      });
      if (!response.ok) throw new Error();
      toast.success("تم تنفيذ الاسترداد وتسجيل سببه");
      setRefundPayment(null);
      setRefundReason("");
      await load();
    } catch { toast.error("فشل تنفيذ الاسترداد"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><CardDescription>الرصيد</CardDescription><CardTitle>{(user.balance || 0).toLocaleString()} ج.م</CardTitle></CardHeader></Card>
      <Card><CardHeader><CardDescription>رصيد الذكاء الاصطناعي</CardDescription><CardTitle>{user.aiCredits || 0}</CardTitle></CardHeader></Card>
      <Card><CardHeader><CardDescription>رصيد الاختبارات</CardDescription><CardTitle>{user.examCredits || 0}</CardTitle></CardHeader></Card>
    </div>
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />المحفظة</CardTitle><CardDescription>كل حركة مالية مع المرجع والوصف</CardDescription></div>
        {canManage && <Button onClick={() => setAdjustOpen(true)}>تعديل الرصيد</Button>}
      </CardHeader>
      <CardContent className="space-y-2">
        {transactions.length ? transactions.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border p-3">
          <div><p className="text-sm font-bold">{item.description || item.type}</p><p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("ar-EG")}</p></div>
          <span className={`font-bold ${item.amount >= 0 ? "text-success" : "text-danger"}`}>{item.amount.toLocaleString()} {item.currency}</span>
        </div>) : <p className="py-8 text-center text-muted-foreground">لا توجد حركات محفظة</p>}
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />المدفوعات والفواتير والاستردادات</CardTitle><CardDescription>الاشتراك: {user.activeSubscriptionId || "لا يوجد اشتراك نشط"}{user.subscriptionExpiresAt ? ` · ينتهي ${new Date(user.subscriptionExpiresAt).toLocaleDateString("ar-EG")}` : ""}</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {payments.length ? payments.map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-xl border p-3">
          <div className="flex items-center gap-3"><Receipt className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-bold">{payment.transactionId || payment.id}</p><p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleString("ar-EG")} · {payment.method || "-"}</p></div></div>
          <div className="flex items-center gap-3"><div className="text-left"><p className="font-bold">{payment.amount.toLocaleString()} {payment.currency}</p><Badge variant="outline">{payment.status}</Badge></div>{canManage && payment.status === "COMPLETED" && <Button size="sm" variant="outline" onClick={() => { setRefundPayment(payment); setRefundAmount(String(payment.amount)); }}>استرداد</Button>}</div>
        </div>) : <p className="py-8 text-center text-muted-foreground">لا توجد مدفوعات</p>}
      </CardContent>
    </Card>
    <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>تعديل رصيد المستخدم</DialogTitle><DialogDescription>أدخل قيمة التعديل وسبب إجرائه على رصيد المستخدم.</DialogDescription></DialogHeader><div className="space-y-4"><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مبلغ موجب للإضافة أو سالب للخصم" /><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب التعديل (إلزامي)" /></div><DialogFooter><Button onClick={adjustBalance} disabled={saving}>{saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ التعديل</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={!!refundPayment} onOpenChange={(open) => !open && setRefundPayment(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>استرداد دفعة</DialogTitle><DialogDescription>حدد المبلغ المراد استرداده واكتب سبب الاسترداد.</DialogDescription></DialogHeader><div className="space-y-4"><Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} max={refundPayment?.amount} /><Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="سبب الاسترداد (إلزامي)" /></div><DialogFooter><Button variant="destructive" onClick={refund} disabled={saving}>تأكيد الاسترداد</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
