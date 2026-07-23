"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Star, Users, BookOpen, DollarSign, Award } from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { useInstructorPerformance } from "@/hooks/use-instructors";

interface InstructorPerformanceTabProps {
  instructorId: string;
}

export function InstructorPerformanceTab({ instructorId }: InstructorPerformanceTabProps) {
  const { data: metrics = [], isLoading } = useInstructorPerformance(instructorId);

  const getTrendBadge = (value: number) => {
    if (value > 0) return <Badge variant="default" className="text-green-500">+{value}%</Badge>;
    if (value < 0) return <Badge variant="destructive">{value}%</Badge>;
    return <Badge variant="secondary">0%</Badge>;
  };

  if (isLoading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Performance Overview */}
      {metrics.length > 0 && metrics[0] && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الطلاب</p>
                <p className="text-2xl font-black">{formatNumber(metrics[0].students || 0)}</p>
                {metrics[0].comparedToPrevious && getTrendBadge(metrics[0].comparedToPrevious.students)}
              </div>
            </div>
          </AdminCard>
          <AdminCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الإيرادات</p>
                <p className="text-2xl font-black">{formatCurrency(metrics[0].revenue || 0)}</p>
                {metrics[0].comparedToPrevious && getTrendBadge(metrics[0].comparedToPrevious.revenue)}
              </div>
            </div>
          </AdminCard>
          <AdminCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">التقييم</p>
                <p className="text-2xl font-black">{(metrics[0].rating || 0).toFixed(1)}</p>
                {metrics[0].comparedToPrevious && getTrendBadge(metrics[0].comparedToPrevious.rating)}
              </div>
            </div>
          </AdminCard>
          <AdminCard variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">معدل الإكمال</p>
                <p className="text-2xl font-black">{(metrics[0].completionRate || 0).toFixed(1)}%</p>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Performance Details */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          تفاصيل الأداء
        </h3>
        {metrics.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد بيانات أداء</p>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-white">
                    {formatDate(metric.period.startDate)} - {formatDate(metric.period.endDate)}
                  </p>
                  <Badge variant="outline">الفترة الحالية</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground font-bold mb-1">الكورسات</p>
                    <p className="text-lg font-black">{metric.courses}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground font-bold mb-1">معدل الإكمال</p>
                    <p className="text-lg font-black">{metric.completionRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground font-bold mb-1">التفاعل</p>
                    <p className="text-lg font-black">{metric.engagement.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground font-bold mb-1">وقت الاستجابة</p>
                    <p className="text-lg font-black">{metric.responseTime} ساعة</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Performance Summary */}
      {metrics.length > 0 && (
        <AdminCard variant="glass" className="p-6">
          <h3 className="text-xl font-black mb-4">ملخص الأداء</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <p className="font-bold text-green-500">نقاط القوة</p>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• تقييم عالي من الطلاب</li>
                <li>• معدل إكمال ممتاز</li>
                <li>• استجابة سريعة</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
                <p className="font-bold text-yellow-500">مجالات التحسين</p>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• زيادة عدد الكورسات</li>
                <li>• تحسين معدل التفاعل</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-blue-500" />
                <p className="font-bold text-blue-500">التوصيات</p>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• ترشيح لكورس الشهر</li>
                <li>• مكافأة الأداء المتميز</li>
              </ul>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}