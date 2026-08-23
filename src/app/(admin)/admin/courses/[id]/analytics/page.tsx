"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { LazySection } from "@/components/admin/ui/lazy-section";

const RevenueAreaChart = dynamic(() => import("../_components/analytics-charts").then(mod => mod.RevenueAreaChart), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" /> });
const EngagementBarChart = dynamic(() => import("../_components/analytics-charts").then(mod => mod.EngagementBarChart), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" /> });
const DevicePieChart = dynamic(() => import("../_components/analytics-charts").then(mod => mod.DevicePieChart), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" /> });

export default function CourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [mounted, setMounted] = React.useState(false);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin", "courses", courseId, "analytics"],
    queryFn: async () => {
      const response = await adminFetch(
        apiRoutes.admin.courseAnalytics(courseId)
      );
      if (!response.ok) throw new Error("فشل تحميل التحليلات");
      return response.json();
    },
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const performanceData = React.useMemo(() => {
    const monthly = analyticsData?.data?.monthlyData;
    return Array.isArray(monthly) ? monthly : [];
  }, [analyticsData]);

  const hasPerformanceData = performanceData.length > 0;

  const deviceData = React.useMemo(() => {
    if (Array.isArray(analyticsData?.data?.deviceData) && analyticsData.data.deviceData.length > 0) {
      return analyticsData.data.deviceData;
    }
    return [];
  }, [analyticsData]);

  const hasDeviceData = deviceData.length > 0;

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!isFinite(num)) return "0 ج.م";
    return `${num.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`;
  };

  const formatHours = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!isFinite(num)) return "0 ساعة";
    return `${num.toLocaleString("ar-EG", { maximumFractionDigits: 1 })} ساعة`;
  };

  const formatPercent = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!isFinite(num)) return "0%";
    return `${num.toLocaleString("ar-EG", { maximumFractionDigits: 1 })}%`;
  };

  const stats = React.useMemo(() => ({
    totalRevenue: analyticsData?.data?.stats?.totalRevenue ?? 0,
    newStudents: analyticsData?.data?.stats?.newStudents ?? 0,
    completionRate: analyticsData?.data?.stats?.completionRate ?? 0,
    watchTime: analyticsData?.data?.stats?.watchTime ?? 0,
    studentsGrowth: analyticsData?.data?.stats?.growth?.students ?? 0,
    revenueGrowth: analyticsData?.data?.stats?.growth?.revenue ?? 0,
  }), [analyticsData]);

  // Growth badges are only meaningful once the aggregates have loaded.
  const formatChange = (value: number) =>
    `${value > 0 ? "+" : ""}${value.toLocaleString("ar-EG", { maximumFractionDigits: 1 })}%`;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 rounded-xl px-4 border-primary/20 bg-primary/5 text-primary font-bold">
            <Calendar className="ml-2 h-4 w-4" />
            آخر 30 يوم
          </Badge>
          <AdminButton variant="outline" size="icon" className="h-10 w-10 rounded-xl">
            <Filter className="h-4 w-4" />
          </AdminButton>
        </div>
        <AdminButton variant="outline" className="gap-2 rounded-xl h-10 px-4 font-bold">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </AdminButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "الإيرادات المقدرة", value: formatCurrency(stats.totalRevenue), change: stats.revenueGrowth, icon: DollarSign, color: "text-emerald-500" },
          { label: "تسجيلات جديدة (30 يوم)", value: stats.newStudents.toLocaleString("ar-EG"), change: stats.studentsGrowth, icon: Users, color: "text-blue-500" },
          { label: "معدل الإكمال", value: formatPercent(stats.completionRate), change: null, icon: TrendingUp, color: "text-violet-500" },
          { label: "وقت المشاهدة", value: formatHours(stats.watchTime), change: null, icon: BarChart3, color: "text-amber-500" },
        ].map((stat, i) => (
          <AdminCard key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl bg-muted/50", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.change !== null && !isLoading && (
                <div className={cn(
                  "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                  stat.change >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {stat.change >= 0 ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                  {formatChange(stat.change)}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</p>
            <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
          </AdminCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Revenue Chart */}
        <AdminCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black">نمو الإيرادات والطلاب</h3>
              <p className="text-xs text-muted-foreground">مقارنة شهرية للأداء المالي والنمو العددي</p>
            </div>
          </div>
          <div className="h-[350px]">
            {isLoading || !mounted ? (
              <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" />
            ) : hasPerformanceData ? (
              <RevenueAreaChart data={performanceData} />
            ) : (
              <div className="h-full w-full flex items-center justify-center rounded-3xl bg-muted/20 text-xs font-bold text-muted-foreground">
                لا توجد تسجيلات في الأشهر الأخيرة
              </div>
            )}
          </div>
        </AdminCard>

        {/* Device Distribution */}
        <AdminCard className="p-6">
          <h3 className="text-lg font-black mb-2">الأجهزة المستخدمة</h3>
          <p className="text-xs text-muted-foreground mb-8">من أين يشاهد طلابك المحتوى؟</p>
          
          <div className="h-[250px] relative">
            {mounted && !isLoading && hasDeviceData ? (
              <DevicePieChart data={deviceData} />
            ) : hasDeviceData ? (
              <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center rounded-3xl bg-muted/20">
                <span className="text-xs font-bold text-muted-foreground">
                  لا توجد بيانات أجهزة متاحة حالياً
                </span>
              </div>
            )}
            {hasDeviceData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{deviceData[0].value}%</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{deviceData[0].name}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6">
            {deviceData.map((item: { name: string; value: number; color: string }, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Student Activity / Engagement */}
      <LazySection minHeight={380} rootMargin="200px">
        <AdminCard className="p-6">
          <h3 className="text-lg font-black mb-8">التسجيلات الشهرية</h3>
          <div className="h-[300px]">
            {isLoading || !mounted ? (
              <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" />
            ) : hasPerformanceData ? (
              <EngagementBarChart data={performanceData} />
            ) : (
              <div className="h-full w-full flex items-center justify-center rounded-3xl bg-muted/20 text-xs font-bold text-muted-foreground">
                لا توجد تسجيلات في الأشهر الأخيرة
              </div>
            )}
          </div>
        </AdminCard>
      </LazySection>
    </div>
  );
}