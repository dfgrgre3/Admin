"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ActivityFeed,
  UpcomingEvents,
} from "@/components/admin/dashboard/widgets";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  TrendingUp,
  Zap,
  Activity,
  Calendar,
  Megaphone,
  Search,
} from "lucide-react";
import type { DashboardGoal } from "@/lib/dashboard-utils";
import { GoalsKPIs } from "@/components/admin/dashboard/goals-kpis";

const CHART_SKELETON = (
  <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-[2rem] border border-white/10" />
);

const UserGrowthChart = dynamic(() => import("@/components/admin/dashboard/user-growth-chart").then(mod => mod.UserGrowthChart), {
  ssr: false,
  loading: () => CHART_SKELETON,
});
const ActivityChart = dynamic(() => import("@/components/admin/dashboard/activity-chart").then(mod => mod.ActivityChart), {
  ssr: false,
  loading: () => CHART_SKELETON,
});

const STYLES = {
  glass: "admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden",
};

interface IntelligenceSectionProps {
  userGrowthData: Array<{ month: string; users: number }>;
  activityData: Array<{ day: string; sessions: number }>;
  recentActivity: Array<{
    id: string;
    type: "user" | "exam" | "achievement" | "task" | "post" | "comment";
    title: string;
    description: string;
    timestamp: Date;
    user?: { name: string; avatar: string };
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: Date;
    type: "exam" | "event" | "deadline" | "meeting" | "challenge" | "announcement";
  }>;
  goals: DashboardGoal[];
  timeFilter: string;
  onTimeFilterChange: (filter: "today" | "week") => void;
  onRefresh: () => void;
  onOpenBroadcast: () => void;
  isFetching: boolean;
  playSound: (sound: string) => void;
}

/**
 * IntelligenceSection — the main intelligence hub containing search, filters,
 * growth/activity charts, recent activity feed, upcoming events, goals KPIs,
 * and the broadcast action card.
 *
 * Extracted from the God Component so it only re-renders when its own data
 * changes. Chart components are dynamically imported for code splitting.
 */
export const IntelligenceSection = React.memo(function IntelligenceSection({
  userGrowthData,
  activityData,
  recentActivity,
  upcomingEvents,
  goals,
  timeFilter,
  onTimeFilterChange,
  onRefresh,
  onOpenBroadcast,
  isFetching,
  playSound,
}: IntelligenceSectionProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("click");
    router.push(`/admin/users?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <div className="flex flex-wrap items-center gap-6">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[300px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مستخدم بالاسم أو البريد الإلكتروني..."
              className="h-16 w-full rounded-2xl bg-card border border-border text-foreground font-bold focus:border-primary/50 pr-12 pl-4 outline-none transition-all focus:ring-2 focus:ring-primary/20"
            />
          </form>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2">
            {[
              { id: "today", label: "اليوم" },
              { id: "week", label: "هذا الأسبوع" },
            ].map((filter) => (
              <button
                key={filter.id}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition-all ${timeFilter === filter.id ? "bg-primary text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                onClick={() => {
                  playSound("click");
                  onTimeFilterChange(filter.id as "today" | "week");
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={STYLES.glass} id="growth-chart">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>نمو المنصة</span>
              </h3>
            </div>
            <UserGrowthChart data={userGrowthData} />
          </div>
          <div className={STYLES.glass} id="activity-chart">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span>نشاط المستخدمين</span>
              </h3>
            </div>
            <ActivityChart data={activityData} />
          </div>
        </div>

        <div className={STYLES.glass}>
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-black">نشاط المنصة الأخير</h3>
          </div>
          <ActivityFeed activities={recentActivity} onRefresh={onRefresh} loading={isFetching} />
        </div>
      </div>

      <div className="space-y-8">
        <div className={STYLES.glass + " border-primary/20"}>
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-black">الأحداث القادمة</h3>
          </div>
          <UpcomingEvents events={upcomingEvents} />
          {upcomingEvents.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">لا توجد فعاليات مجدولة</p>
            </div>
          )}
        </div>

        <div id="goals-kpis">
          <GoalsKPIs goals={goals} />
        </div>

        <div className="bg-card/50 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <Megaphone className="w-12 h-12 text-primary" />
            <h4 className="font-black text-lg">مركز الإشعارات العام</h4>
            <p className="text-xs text-gray-400 font-medium">إرسال تنبيه إداري عاجل لكافة المستخدمين والطلاب.</p>
            <AdminButton
              variant="premium"
              className="w-full rounded-2xl h-12"
              onClick={onOpenBroadcast}
            >
              إرسال بث تنبيهي
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
});