"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, X, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightSeverity = "info" | "success" | "warning" | "danger";
export type InsightCategory = "trend" | "anomaly" | "opportunity" | "prediction";

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: InsightCategory;
  metric?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  confidence?: number; // 0-100
}

interface AIInsightsBannerProps {
  insights: AnalyticsInsight[];
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
  title?: string;
  collapsible?: boolean;
}

const severityConfig: Record<InsightSeverity, { bg: string; border: string; icon: typeof Sparkles; color: string }> = {
  info: { bg: "bg-blue-500/5", border: "border-blue-500/30", icon: Lightbulb, color: "text-blue-500" },
  success: { bg: "bg-emerald-500/5", border: "border-emerald-500/30", icon: TrendingUp, color: "text-emerald-500" },
  warning: { bg: "bg-amber-500/5", border: "border-amber-500/30", icon: AlertTriangle, color: "text-amber-500" },
  danger: { bg: "bg-red-500/5", border: "border-red-500/30", icon: AlertTriangle, color: "text-red-500" },
};

const categoryLabels: Record<InsightCategory, string> = {
  trend: "اتجاه",
  anomaly: "شذوذ",
  opportunity: "فرصة",
  prediction: "تنبؤ",
};

export function AIInsightsBanner({
  insights,
  loading,
  onRefresh,
  className,
  title = "رؤى الذكاء الاصطناعي",
  collapsible = true,
}: AIInsightsBannerProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const visible = insights.filter((i) => !dismissed.has(i.id));

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-5",
        className
      )}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-lg flex items-center gap-2">
                {title}
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  AI
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? "جاري تحليل البيانات..."
                  : `${visible.length} ${visible.length === 1 ? "رؤية" : "رؤى"} مكتشفة تلقائياً`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                aria-label="تحديث"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
            )}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-90")} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid gap-3 md:grid-cols-2"
            >
              {loading ? (
                <>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/30" />
                  ))}
                </>
              ) : visible.length === 0 ? (
                <div className="md:col-span-2 flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm font-bold">لا توجد رؤى جديدة حالياً</p>
                  <p className="text-xs">سنخطرك عندما نكتشف أنماطاً مهمة</p>
                </div>
              ) : (
                visible.map((insight) => {
                  const config = severityConfig[insight.severity];
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "group relative rounded-2xl border p-4 backdrop-blur transition-all",
                        config.bg,
                        config.border
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", config.bg)}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-bold text-sm">{insight.title}</span>
                              <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider", config.bg, config.color)}>
                                {categoryLabels[insight.category]}
                              </span>
                              {insight.confidence !== undefined && (
                                <span className="text-[9px] font-bold text-muted-foreground">
                                  ثقة {insight.confidence}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {insight.description}
                            </p>
                            {insight.action && (
                              <button
                                onClick={insight.action.onClick}
                                className={cn("mt-2 text-xs font-bold flex items-center gap-1", config.color, "hover:underline")}
                              >
                                {insight.action.label}
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => dismiss(insight.id)}
                          className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                          aria-label="إخفاء"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}