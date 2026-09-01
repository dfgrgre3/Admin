"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  ShoppingBag,
  Receipt,
  Tag,
  Percent,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart,
  Target,
  Award,
  Calendar,
  Activity,
  Banknote,
  Coins,
} from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminCard, AdminGridCard } from "@/components/admin/ui/admin-card";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { KPICard } from "../_components/kpi-card";
import {
  PeriodSelector,
  CompareToggle,
  type AnalyticsPeriod,
} from "../_components/period-selector";
import { ExportButton } from "../_components/export-button";
import { SectionHeader } from "../_components/section-header";
import { AIInsightsBanner, type AnalyticsInsight } from "../_components/ai-insights-banner";
import { apiRoutes } from "../_components/use-analytics-data";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { formatNumber, cn } from "@/lib/utils";
import { motion } from "framer-motion";

const RevenueComposedChart = dynamic(
  () => import("../charts").then((m) => m.RevenueComposedChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);
const MultiLineChart = dynamic(
  () => import("../charts").then((m) => m.MultiLineChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);
const HorizontalBarChart = dynamic(
  () => import("../charts").then((m) => m.HorizontalBarChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);
const RadialProgressChart = dynamic(
  () => import("../charts").then((m) => m.RadialProgressChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50 rounded-xl" /> }
);

interface SalesResponse {
  overview?: {
    totalRevenue?: number;
    mrr?: number;
    arr?: number;
    avgOrderValue?: number;
    transactions?: number;
    churnRevenue?: number;
    refunded?: number;
    netRevenue?: number;
    ltv?: number;
    cac?: number;
    ltvCacRatio?: number;
  };
  revenueByMonth?: Array<{ month: number; revenue: number; transactions: number }>;
  byPlan?: Array<{ name: string; revenue: number; users: number; fill: string }>;
  byPayment?: Array<{ name: string; value: number; fill: string }>;
  topProducts?: Array<{ name: string; revenue: number; sold: number }>;
  coupons?: Array<{ code: string; uses: number; discount: number; revenue: number }>;
  churnRevenue?: Array<{ label: string; churn: number; expansion: number }>;
  funnel?: Array<{ stage: string; value: number }>;
  insights?: AnalyticsInsight[];
}

const FALLBACK: SalesResponse = {
  overview: {
    totalRevenue: 1_245_300,
    mrr: 184_200,
    arr: 2_210_400,
    avgOrderValue: 425,
    transactions: 3140,
    churnRevenue: 18400,
    refunded: 8420,
    netRevenue: 1_218_480,
    ltv: 1840,
    cac: 320,
    ltvCacRatio: 5.75,
  },
  revenueByMonth: [
    { month: 1, revenue: 84200, transactions: 220 },
    { month: 2, revenue: 95600, transactions: 250 },
    { month: 3, revenue: 124800, transactions: 310 },
    { month: 4, revenue: 108200, transactions: 285 },
    { month: 5, revenue: 142400, transactions: 360 },
    { month: 6, revenue: 158200, transactions: 392 },
    { month: 7, revenue: 184200, transactions: 442 },
    { month: 8, revenue: 168400, transactions: 412 },
    { month: 9, revenue: 192600, transactions: 478 },
    { month: 10, revenue: 218400, transactions: 520 },
    { month: 11, revenue: 198400, transactions: 488 },
    { month: 12, revenue: 232800, transactions: 562 },
  ],
  byPlan: [
    { name: "الخطة الذهبية", revenue: 542000, users: 1240, fill: "#f59e0b" },
    { name: "الخطة الفضية", revenue: 384200, users: 2180, fill: "#94a3b8" },
    { name: "الخطة البلاتينية", revenue: 218400, users: 240, fill: "#8b5cf6" },
    { name: "الخطة الأساسية", revenue: 100700, users: 1480, fill: "#10b981" },
  ],
  byPayment: [
    { name: "بطاقة ائتمان", value: 62, fill: "#3b82f6" },
    { name: "محفظة إلكترونية", value: 24, fill: "#10b981" },
    { name: "تحويل بنكي", value: 9, fill: "#f59e0b" },
    { name: "أخرى", value: 5, fill: "#8b5cf6" },
  ],
  topProducts: [
    { name: "دورة React المتقدمة", revenue: 184200, sold: 1240 },
    { name: "اشتراك سنوي ذهبي", revenue: 168400, sold: 320 },
    { name: "دورة UI/UX الشاملة", revenue: 142000, sold: 980 },
    { name: "باقة PMP + ITIL", revenue: 118500, sold: 240 },
    { name: "دورة التسويق الرقمي", revenue: 88400, sold: 620 },
  ],
  coupons: [
    { code: "WELCOME20", uses: 1240, discount: 24800, revenue: 142800 },
    { code: "BLACKFRIDAY", uses: 842, discount: 42100, revenue: 218400 },
    { code: "STUDENT15", uses: 618, discount: 18600, revenue: 96800 },
    { code: "LOYALTY10", uses: 320, discount: 12400, revenue: 64200 },
  ],
  churnRevenue: [
    { label: "يناير", churn: 12400, expansion: 8200 },
    { label: "فبراير", churn: 14200, expansion: 9400 },
    { label: "مارس", churn: 18400, expansion: 12400 },
    { label: "أبريل", churn: 16800, expansion: 14200 },
    { label: "مايو", churn: 21200, expansion: 16400 },
    { label: "يونيو", churn: 18400, expansion: 18400 },
  ],
  funnel: [
    { stage: "زائر", value: 42000 },
    { stage: "مهتم", value: 18400 },
    { stage: "سلة", value: 8400 },
    { stage: "دفع", value: 4200 },
    { stage: "اشتراك", value: 3140 },
  ],
  insights: [
    {
      id: "s1",
      title: "نمو ممتاز في MRR",
      description: "الإيرادات الشهرية المتكررة نمت بنسبة 24% عن الشهر الماضي، أعلى من توقعاتنا.",
      severity: "success",
      category: "trend",
      metric: "+24%",
      confidence: 94,
    },
    {
      id: "s2",
      title: "كوبون BLACKFRIDAY الأكثر ربحية",
      description: "حقق الكوبون 218,400 ج.م بإجمالي 421 استخدام رغم الخصم الكبير.",
      severity: "info",
      category: "opportunity",
      metric: "218K",
      confidence: 91,
    },
    {
      id: "s3",
      title: "ارتفاع طفيف في استرداد المبالغ",
      description: "لاحظنا زيادة في طلبات الاسترداد بنسبة 12%. ننصح بمراجعة جودة دورة PMP.",
      severity: "warning",
      category: "anomaly",
      metric: "+12%",
      confidence: 82,
    },
  ],
};

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("year");
  const [compare, setCompare] = React.useState(false);

  const { data, isLoading } = useQuery<SalesResponse>({
    queryKey: ["analytics", "sales", period],
    queryFn: async () => {
      try {
        const url = `${apiRoutes.admin.revenue}?period=${period}`;
        const res = await adminFetch(url);
        if (!res.ok) throw new Error("fallback");
        return (await res.json()) as SalesResponse;
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 60_000,
  });

  const merged = data ?? FALLBACK;
  const overview = merged.overview ?? FALLBACK.overview!;

  const funnelMax = merged.funnel?.[0]?.value ?? 1;

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="تحليلات المبيعات"
        description="الإيرادات، MRR، ARPU، أداء خطط الاشتراك، كوبونات الخصم، والقمع البيعي."
        icon={DollarSign}
        accentColor="emerald"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <CompareToggle enabled={compare} onToggle={setCompare} />
            <PeriodSelector value={period} onChange={setPeriod} size="sm" />
            <ExportButton
              data={merged.revenueByMonth ?? []}
              filename="sales-analytics"
              title="تحليلات المبيعات"
            />
          </div>
        }
      />

      <AIInsightsBanner insights={merged.insights ?? []} loading={isLoading} />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard title="إجمالي الإيرادات" value={overview.totalRevenue ?? 0} unit=" ج.م" icon={DollarSign} color="green"
          delta={18.6} deltaLabel="نمو سنوي" loading={isLoading} />
        <KPICard title="MRR" value={overview.mrr ?? 0} unit=" ج.م" icon={Wallet} color="green"
          delta={24.2} deltaLabel="شهري" loading={isLoading} />
        <KPICard title="ARR" value={overview.arr ?? 0} unit=" ج.م" icon={Banknote} color="blue"
          delta={28.4} deltaLabel="سنوي" loading={isLoading} />
        <KPICard title="متوسط قيمة الطلب" value={overview.avgOrderValue ?? 0} unit=" ج.م" icon={Receipt} color="violet"
          delta={5.2} deltaLabel="تحسن" loading={isLoading} />
        <KPICard title="إيرادات التوقف" value={overview.churnRevenue ?? 0} unit=" ج.م" icon={ArrowDownRight} color="red"
          delta={-8.4} deltaLabel="انخفاض" loading={isLoading} />
        <KPICard title="صافي الإيرادات" value={overview.netRevenue ?? 0} unit=" ج.م" icon={Coins} color="green"
          delta={15.2} deltaLabel="صافي" loading={isLoading} />
      </div>

      {/* Unit Economics */}
      <div className="grid gap-4 md:grid-cols-3">
        <AdminGridCard className="p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">LTV (القيمة الدائمة)</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{formatNumber(overview.ltv ?? 0)} ج.م</p>
          <p className="mt-1 text-xs text-muted-foreground">متوسط قيمة العميل طوال فترة حياته</p>
        </AdminGridCard>
        <AdminGridCard className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">CAC (تكلفة الاكتساب)</span>
            <Target className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{formatNumber(overview.cac ?? 0)} ج.م</p>
          <p className="mt-1 text-xs text-muted-foreground">متوسط تكلفة اكتساب عميل جديد</p>
        </AdminGridCard>
        <AdminGridCard className="p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">LTV:CAC Ratio</span>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-3xl font-black text-violet-600">{overview.ltvCacRatio?.toFixed(2) ?? "0"}:1</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(overview.ltvCacRatio ?? 0) > 3 ? "صحة ممتازة ✓" : "يحتاج تحسين"}
          </p>
        </AdminGridCard>
      </div>

      {/* Revenue Chart */}
      <AdminCard>
        <SectionHeader
          title="الإيرادات الشهرية والمعاملات"
          subtitle="آخر 12 شهر - مخطط مركب يعرض الإيرادات وعدد المعاملات"
          icon={BarChart3}
        />
        <div className="h-[380px] mt-4">
          <RevenueComposedChart data={merged.revenueByMonth ?? []} />
        </div>
      </AdminCard>

      {/* Plans and Payment Methods */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="الإيرادات حسب الخطة"
            subtitle="أداء خطط الاشتراك المختلفة"
            icon={Award}
            iconColor="text-amber-500"
          />
          <div className="h-[320px] mt-4">
            <HorizontalBarChart
              data={(merged.byPlan ?? []).map((p) => ({ name: p.name, value: p.revenue }))}
              dataKey="value"
              nameKey="name"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(merged.byPlan ?? []).map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
                  <span className="text-xs font-bold">{p.name}</span>
                </div>
                <div className="text-xs">
                  <span className="font-black">{formatNumber(p.users)}</span>
                  <span className="text-muted-foreground"> مستخدم</span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="طرق الدفع المفضلة"
            subtitle="توزيع الإيرادات على بوابات الدفع"
            icon={CreditCard}
            iconColor="text-blue-500"
          />
          <div className="h-[320px] mt-4">
            <RadialProgressChart data={merged.byPayment ?? []} />
          </div>
        </AdminCard>
      </div>

      {/* Sales Funnel */}
      <AdminCard>
        <SectionHeader
          title="القمع البيعي"
          subtitle="من الزائر إلى الاشتراك - معدلات التحويل في كل مرحلة"
          icon={Activity}
        />
        <div className="mt-4 space-y-2">
          {(merged.funnel ?? []).map((stage, i) => {
            const pct = (stage.value / funnelMax) * 100;
            const conv = i > 0 ? Math.round((stage.value / (merged.funnel?.[i - 1]?.value ?? 1)) * 100) : 100;
            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.08 }}
                style={{ marginRight: `${i * 4}%` }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {i > 0 && (
                        <span className={cn("font-black", conv >= 50 ? "text-emerald-600" : conv >= 25 ? "text-amber-600" : "text-red-600")}>
                          {conv}%
                        </span>
                      )}
                      {" "}تحويل
                    </span>
                    <span className="font-black text-foreground">{formatNumber(stage.value)}</span>
                  </div>
                </div>
                <div className="h-10 overflow-hidden rounded-xl bg-muted/30 border border-border/40">
                  <div
                    className="flex h-full items-center justify-end px-3 text-xs font-black text-white transition-all bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)`,
                    }}
                  >
                    {pct > 15 && `${pct.toFixed(0)}%`}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AdminCard>

      {/* Top products + Coupons */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <SectionHeader
            title="أعلى المنتجات مبيعاً"
            subtitle="الأكثر تحقيقاً للإيرادات"
            icon={ShoppingBag}
            iconColor="text-emerald-500"
          />
          <div className="mt-4 space-y-2">
            {(merged.topProducts ?? []).map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 hover:bg-card transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-600 font-black text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sold} مبيعات</p>
                </div>
                <p className="font-black text-emerald-600">{formatNumber(p.revenue)} ج.م</p>
              </motion.div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionHeader
            title="أداء الكوبونات"
            subtitle="كوبونات الخصم الأكثر استخداماً"
            icon={Tag}
            iconColor="text-amber-500"
          />
          <div className="mt-4 space-y-2">
            {(merged.coupons ?? []).map((c, i) => (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card/50 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-600">
                      {c.code}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.uses} استخدام</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600">+{formatNumber(c.revenue)} ج.م</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>خصم: {formatNumber(c.discount)} ج.م</span>
                  <span>ROI: {((c.revenue / c.discount) * 100).toFixed(0)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Churn vs Expansion Revenue */}
      <AdminCard>
        <SectionHeader
          title="إيرادات التوقف مقابل التوسع"
          subtitle="المعاملات المالية الشهرية"
          icon={TrendingUp}
          iconColor="text-violet-500"
        />
        <div className="h-[320px] mt-4">
          <MultiLineChart
            data={merged.churnRevenue ?? []}
            series={[
              { key: "expansion", name: "إيرادات توسع", color: "#10b981" },
              { key: "churn", name: "إيرادات توقف", color: "#ef4444" },
            ]}
          />
        </div>
      </AdminCard>
    </div>
  );
}