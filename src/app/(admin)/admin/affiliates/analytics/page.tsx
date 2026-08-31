"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ChartLine, ChartBar, ChartDonut, ChartMultiBar } from "@/components/shared/charts";
import { useQuery } from "@tanstack/react-query";
import { affiliateApi, type AffiliateAnalytics } from "@/lib/api/affiliate-api";
import { Loader2, Activity, Users, DollarSign, Megaphone, Receipt, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { tierLabels, statusLabels } from "../types";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n) + " ج.م";

const formatNum = (n: number) => new Intl.NumberFormat("ar-EG").format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

export default function AffiliateAnalyticsPage() {
  const [days, setDays] = React.useState(30);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "affiliate-analytics", days],
    queryFn: () => affiliateApi.analytics(days),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="تحليلات المسوقين"
        description="نظرة شاملة على الأداء والعمولات والحملات خلال الفترة المحددة"
      >
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            <TabsTrigger value="7">7 أيام</TabsTrigger>
            <TabsTrigger value="30">30 يوم</TabsTrigger>
            <TabsTrigger value="90">90 يوم</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      {isError ? (
        <Card>
          <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground">فشل تحميل التحليلات</p>
            <AdminButton onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 ml-2" /> إعادة المحاولة
            </AdminButton>
          </CardContent>
        </Card>
      ) : isLoading || !data ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AnalyticsContent data={data} />
      )}
    </div>
  );
}

function AnalyticsContent({ data }: { data: AffiliateAnalytics }) {
  const h = data.headline;

  const clicksData = data.clicksSeries.map((d) => ({
    name: d.day,
    value: d.clicks,
  }));

  const conversionsData = data.clicksSeries.map((d) => ({
    name: d.day,
    value: d.conversions,
  }));

  const earningsData = data.earningsSeries.map((d) => ({
    name: d.day,
    pending: d.pending,
    paid: d.paid,
  }));

  const tierData = data.tierDistribution.map((t) => ({
    name: (tierLabels as any)[t.tier]?.label || t.tier,
    value: t.count,
  }));

  const statusData = data.statusDistribution.map((s) => ({
    name: (statusLabels as any)[s.status]?.label || s.status,
    value: s.count,
  }));

  const conversionRate =
    h.totalClicks > 0 ? ((h.totalConversions / h.totalClicks) * 100).toFixed(2) : "0.00";

  return (
    <>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <KpiCard
          title="إجمالي المسوقين"
          value={formatNum(h.totalAffiliates)}
          hint={`${h.activeAffiliates} نشط · ${h.pendingAffiliates} قيد المراجعة`}
          icon={<Users className="w-4 h-4" />}
          color="blue"
        />
        <KpiCard
          title="إجمالي العمولات"
          value={formatCurrency(h.totalCommission)}
          hint={`${formatCurrency(h.paidCommission)} مدفوع`}
          icon={<DollarSign className="w-4 h-4" />}
          color="green"
        />
        <KpiCard
          title="النقرات"
          value={formatNum(h.totalClicks)}
          hint={`${conversionRate}% معدل التحويل`}
          icon={<Activity className="w-4 h-4" />}
          color="violet"
        />
        <KpiCard
          title="الحملات النشطة"
          value={`${h.activeCampaigns} / ${h.totalCampaigns}`}
          hint={`${formatNum(h.totalLinks)} رابط`}
          icon={<Megaphone className="w-4 h-4" />}
          color="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">النقرات (يومي)</CardTitle>
            <CardDescription>إجمالي النقرات على الروابط التابعة</CardDescription>
          </CardHeader>
          <CardContent>
            {clicksData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartLine data={clicksData} dataKey="value" color="#3b82f6" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">التحويلات (يومي)</CardTitle>
            <CardDescription>إجمالي التحويلات لكل يوم</CardDescription>
          </CardHeader>
          <CardContent>
            {conversionsData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartLine data={conversionsData} dataKey="value" color="#10b981" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">العمولات المتراكمة (يومي)</CardTitle>
            <CardDescription>مقارنة بين المعلقة والمدفوعة</CardDescription>
          </CardHeader>
          <CardContent>
            {earningsData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartMultiBar
                data={earningsData}
                bars={[
                  { dataKey: "pending", color: "#f59e0b", name: "معلقة" },
                  { dataKey: "paid", color: "#10b981", name: "مدفوعة" },
                ]}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المدفوعات</CardTitle>
            <CardDescription>ملخص المدفوعات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PaymentStat label="إجمالي المدفوعات" value={formatNum(h.totalPayouts)} icon={<Receipt className="w-4 h-4" />} />
            <PaymentStat label="مدفوعات معلقة" value={formatNum(h.pendingPayouts)} icon={<Receipt className="w-4 h-4 text-amber-500" />} />
            <PaymentStat label="مدفوعات مكتملة" value={formatNum(h.paidPayouts)} icon={<Receipt className="w-4 h-4 text-green-500" />} />
            <PaymentStat label="عمولات معلقة" value={formatCurrency(h.pendingCommission)} icon={<DollarSign className="w-4 h-4 text-amber-500" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع الفئات</CardTitle>
            <CardDescription>عدد المسوقين حسب الفئة</CardDescription>
          </CardHeader>
          <CardContent>
            {tierData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartDonut data={tierData} dataKey="value" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">حالات المسوقين</CardTitle>
            <CardDescription>توزيع الحالات الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartDonut data={statusData} dataKey="value" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أفضل المسوقين</CardTitle>
            <CardDescription>حسب إجمالي الأرباح</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topAffiliates.length === 0 ? (
              <EmptyChart />
            ) : (
              <ul className="space-y-3">
                {data.topAffiliates.map((a, i) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {a.user?.name || a.user?.username || a.user?.email || a.code}
                        </div>
                        <div className="text-xs text-muted-foreground">{a.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(a.totalEarned)}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {(tierLabels as any)[a.tier]?.label || a.tier}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أفضل الحملات</CardTitle>
            <CardDescription>حسب الإنفاق</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCampaigns.length === 0 ? (
              <EmptyChart />
            ) : (
              <ul className="space-y-3">
                {data.topCampaigns.map((c, i) => (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.startDate ? formatDate(c.startDate) : "—"} → {c.endDate ? formatDate(c.endDate) : "مستمرة"}
                        </div>
                      </div>
                    </div>
                    <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiCard({
  title,
  value,
  hint,
  icon,
  color,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "violet" | "red";
}) {
  const colorClass: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600",
    green: "from-green-500/10 to-green-500/5 text-green-600",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600",
    red: "from-red-500/10 to-red-500/5 text-red-600",
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colorClass[color]} mb-2`}>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{title}</div>
        {hint && <div className="text-[11px] text-muted-foreground/70 mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function PaymentStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="text-center text-sm text-muted-foreground py-10">لا توجد بيانات</div>
  );
}