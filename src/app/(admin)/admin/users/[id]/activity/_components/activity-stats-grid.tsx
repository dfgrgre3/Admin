"use client";

import { Activity, AlertTriangle, Filter, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ActivityStatsGridProps {
  total: number;
  logins: number;
  failed: number;
  filtered: number;
}

export function ActivityStatsGrid({ total, logins, failed, filtered }: ActivityStatsGridProps) {
  const stats = [
    { label: "إجمالي الأحداث", value: total, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "تسجيلات الدخول", value: logins, icon: LogIn, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "محاولات فاشلة", value: failed, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "النتائج المعروضة", value: filtered, icon: Filter, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(s => (
        <Card key={s.label} className="border-white/10 bg-card/50 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black">{s.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}