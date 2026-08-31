"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Sparkles, Trophy } from "lucide-react";
import { getAchievementIcon, XP_RANGES_BY_RARITY } from "../_lib/constants";
import { getRarityColor, getRarityLabel } from "../_lib/utils";
import { cn } from "@/lib/utils";

interface AchievementPreviewProps {
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  isSecret: boolean;
  criteria: string;
}

export function AchievementPreview({
  title,
  description,
  icon,
  rarity,
  xpReward,
  isSecret,
  criteria,
}: AchievementPreviewProps) {
  const Icon = getAchievementIcon(icon);
  const suggestedXp = XP_RANGES_BY_RARITY[rarity]?.suggested ?? xpReward;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
          معاينة مباشرة
        </p>
      </div>

      <div className="flex items-start gap-4">
        <motion.div
          key={`${icon}-${rarity}`}
          initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/10 text-white shadow-2xl",
              getRarityColor(rarity)
            )}
          >
            <Icon className="h-10 w-10" />
          </div>
          {rarity === "legendary" && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(6, 182, 212, 0.6)",
                  "0 0 0 15px rgba(6, 182, 212, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.h4
              key={title}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="font-black text-lg tracking-tight truncate"
            >
              {isSecret ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" /> ???
                </span>
              ) : (
                title || "عنوان الوسام"
              )}
            </motion.h4>
          </AnimatePresence>

          <p className="mt-1 text-xs text-muted-foreground font-medium line-clamp-2">
            {isSecret ? "وسام سري - احصل عليه لكشف التفاصيل" : description || "وصف الوسام"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-1">
              <Sparkles className="h-3 w-3 fill-blue-500 text-blue-500" />
              <span className="text-[10px] font-black text-blue-500">
                {xpReward} XP
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-black text-amber-500">
                {getRarityLabel(rarity)}
              </span>
            </div>
            {isSecret && (
              <div className="flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 px-2.5 py-1">
                <EyeOff className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400">سري</span>
              </div>
            )}
          </div>

          {xpReward > 0 && xpReward !== suggestedXp && (
            <p className="mt-2 text-[10px] text-muted-foreground font-medium">
              💡 المقترح لهذه الفئة: <span className="font-black">{suggestedXp} XP</span>
            </p>
          )}
          {criteria && (
            <p className="mt-2 text-[10px] text-muted-foreground font-mono truncate" dir="ltr">
              criteria: {criteria}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}