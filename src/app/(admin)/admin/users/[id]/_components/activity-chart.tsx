"use client";

import type { UserDetails } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { format, subDays, isWithinInterval, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";

interface ActivityChartProps {
  user: UserDetails;
}

const XP_DISTRIBUTION_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ef4444"];

export function ActivityChart({ user }: ActivityChartProps) {
  const xpDistribution = [
    { name: "الدراسة", value: user.studyXP ?? 0, color: XP_DISTRIBUTION_COLORS[0] },
    { name: "المهام", value: user.taskXP ?? 0, color: XP_DISTRIBUTION_COLORS[1] },
    { name: "الامتحانات", value: user.examXP ?? 0, color: XP_DISTRIBUTION_COLORS[2] },
    { name: "التحديات", value: user.challengeXP ?? 0, color: XP_DISTRIBUTION_COLORS[3] },
    { name: "الموسم", value: user.seasonXP ?? 0, color: XP_DISTRIBUTION_COLORS[4] }
  ].filter(item => item.value > 0);

  const formatTooltipValue = (value: unknown): string => {
    if (typeof value === "number") return `${value.toLocaleString()} XP`;
    if (typeof value === "string") return `${value} XP`;
    return "0 XP";
  };

  const sessions = user.studySessions || [];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return isWithinInterval(sessionDate, { start: dayStart, end: dayEnd });
    });
    
    const totalMinutes = daySessions.reduce((sum, s) => sum + (s.durationMin || 0), 0);
    const avgFocus = daySessions.length > 0 
      ? Math.round(daySessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / daySessions.length)
      : 0;
    
    return {
      day: format(day, "EEE", { locale: ar }).replace("أحد", "أح").replace("اثنين", "اث").replace("ثلاثاء", "ثل").replace("أربعاء", "أر").replace("خميس", "خم").replace("جمعة", "جم").replace("سبت", "سب"),
      minutes: totalMinutes,
      focus: avgFocus
    };
  });

  const weeklyData = last7Days.map(d => ({
    ...d,
    hours: Math.round(d.minutes / 60 * 10) / 10
  }));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* XP Distribution Pie Chart */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            توزيع نقاط الخبرة
          </CardTitle>
          <CardDescription>نسبة كل مصدر من إجمالي XP</CardDescription>
        </CardHeader>
        <CardContent>
          {xpDistribution.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
                <PieChart>
                  <Pie
                    data={xpDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {xpDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={formatTooltipValue}
                    contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", direction: "rtl" }}
                  />
                  <Legend
                    layout="vertical"
                    align="left"
                    verticalAlign="middle"
                    formatter={(value: string) => (
                      <span className="text-xs font-medium">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              لا توجد بيانات XP كافية
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Activity Bar Chart */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            النشاط الأسبوعي
          </CardTitle>
          <CardDescription>ساعات المذاكرة خلال الأسبوع</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.some(d => d.minutes > 0) ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    stroke="rgba(255,255,255,0.1)"
                    label={{ value: "الساعات", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", direction: "rtl" }}
                    formatter={(value: unknown) => [`${value} ساعة`, "مذاكرة"]}
                  />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              لا توجد جلسات مسجلة هذا الأسبوع
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Score Trend */}
      <Card className="border-none shadow-lg md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            مستوى التركيز الأسبوعي
          </CardTitle>
          <CardDescription>متوسط درجة التركيز في جلسات المذاكرة</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.some(d => d.focus > 0) ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1} initialDimension={{ width: 1, height: 1 }}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    stroke="rgba(255,255,255,0.1)"
                    label={{ value: "التركيز %", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", direction: "rtl" }}
                    formatter={(value: unknown) => [`${value}%`, "التركيز"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              لا توجد بيانات تركيز كافية
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
