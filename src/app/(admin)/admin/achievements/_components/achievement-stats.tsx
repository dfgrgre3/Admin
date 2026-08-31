"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Zap, Users, Trophy, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeAchievementStats } from "../_lib/utils";
import type { Achievement } from "../_lib/types";
import {
  RARITY_LABELS,
  RARITY_COLORS,
  RARITY_BG_COLORS,
  CATEGORY_LABELS,
} from "../_lib/constants";

interface AchievementStatsProps {
  achievements: Achievement[];
}

export function AchievementStats({ achievements }: AchievementStatsProps) {
  const stats = React.useMemo(() => computeAchievementStats(achievements), [achievements]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mainCards = [
    {
      title: "إجمالي الأوسمة",
      value: stats.total,
      label: "وسام تعليمي",
      icon: Award,
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      title: "الأوسمة المعلنة",
      value: stats.visible,
      label: "وسام ظاهر للطلاب",
      icon: Eye,
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
    },
    {
      title: "الأوسمة السرية",
      value: stats.secret,
      label: "وسام مخفي",
      icon: EyeOff,
      color: "from-slate-500/20 to-slate-500/5",
      iconColor: "text-slate-400",
    },
    {
      title: "إجمالي الحاصلين",
      value: stats.totalUnlocked.toLocaleString("ar-EG"),
      label: "عملية منح ناجحة",
      icon: Users,
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 p-5",
                "bg-gradient-to-br backdrop-blur-sm",
                card.color
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-black">{card.value}</p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    {card.label}
                  </p>
                </div>
                <div className={cn("rounded-xl bg-background/40 p-3", card.iconColor)}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Distribution Breakdown */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* By Rarity */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-black text-sm uppercase tracking-widest">
              توزيع حسب فئة التميز
            </h3>
          </div>
          <div className="space-y-2">
            {Object.entries(stats.byRarity)
              .sort(([, a], [, b]) => b - a)
              .map(([rarity, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rarity} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">{RARITY_LABELS[rarity] || rarity}</span>
                      <span className="font-black">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn("h-full rounded-full", RARITY_COLORS[rarity])}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* By Category */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-black text-sm uppercase tracking-widest">
              توزيع حسب التصنيف
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="text-xs font-bold">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className="text-xs font-black text-primary">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}