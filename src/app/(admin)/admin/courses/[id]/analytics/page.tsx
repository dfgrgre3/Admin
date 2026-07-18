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
    if (analyticsData?.data?.monthlyData) {
      return analyticsData.data.monthlyData;
    }
    return [
      { name: "يناير", revenue: 4000, students: 240 },
      { name: "فبراير", revenue: 3000, students: 198 },
      { name: "مارس", revenue: 2000, students: 980 },
      { name: "أبريل", revenue: 2780, students: 390 },
      { name: "مايو", revenue: 1890, students: 480 },
      { name: "يونيو", revenue: 2390, students: 380 },
    ];
  }, [analyticsData]);

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
    conversionRate: analyticsData?.data?.stats?.conversionRate ?? 0,
    watchTime: analyticsData?.data?.stats?.watchTime ?? 0,
  }), [analyticsData]);

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
          { label: "إجمالي المبيعات", value: formatCurrency(stats.totalRevenue), change: "+12.5%", trend: "up", icon: DollarSign, color: "text-emerald-500" },
          { label: "تسجيلات جديدة", value: stats.newStudents.toString(), change: "+18%", trend: "up", icon: Users, color: "text-blue-500" },
          { label: "معدل التحويل", value: formatPercent(stats.conversionRate), change: "-2.4%", trend: "down", icon: TrendingUp, color: "text-violet-500" },
          { label: "وقت المشاهدة", value: formatHours(stats.watchTime), change: "+5.4%", trend: "up", icon: BarChart3, color: "text-amber-500" },
        ].map((stat, i) => (
          <AdminCard key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl bg-muted/50", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                {stat.change}
              </div>
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
            {mounted && !isLoading ? (
              <RevenueAreaChart data={performanceData} />
            ) : (
              <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" />
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
      <AdminCard className="p-6">
        <h3 className="text-lg font-black mb-8">التفاعل مع الدروس</h3>
        <div className="h-[300px]">
          {mounted && !isLoading ? (
            <EngagementBarChart data={performanceData} />
          ) : (
            <div className="h-full w-full animate-pulse bg-muted/30 rounded-3xl" />
          )}
        </div>
      </AdminCard>
    </div>
  );
}