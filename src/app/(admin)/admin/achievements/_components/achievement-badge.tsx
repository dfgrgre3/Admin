"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAchievementIcon } from "../_lib/constants";
import {
  getRarityColor,
  getRarityLabel,
} from "../_lib/utils";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  rarity: string;
  isSecret?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "h-10 w-10", icon: "h-5 w-5" },
  md: { container: "h-14 w-14", icon: "h-7 w-7" },
  lg: { container: "h-20 w-20", icon: "h-10 w-10" },
  xl: { container: "h-28 w-28", icon: "h-14 w-14" },
};

export function AchievementBadge({
  icon,
  title,
  rarity,
  isSecret = false,
  size = "md",
  showLabel = false,
  animated = true,
  className,
}: AchievementBadgeProps) {
  const Icon = getAchievementIcon(icon);
  const sizes = SIZE_MAP[size];

  const badge = (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border-2 border-white/10 text-white shadow-lg",
        getRarityColor(rarity),
        sizes.container,
        className
      )}
    >
      <Icon className={cn(sizes.icon, isSecret && "opacity-30")} />
      {isSecret && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className={cn(sizes.icon, "text-white/80")} />
        </div>
      )}
      {rarity === "legendary" && animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(6, 182, 212, 0.5)",
              "0 0 0 12px rgba(6, 182, 212, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
    </div>
  );

  if (!showLabel) return badge;

  return (
    <div className="flex flex-col items-center gap-2">
      {badge}
      <div className="text-center">
        <p className="text-xs font-black">{title}</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          {getRarityLabel(rarity)}
        </p>
      </div>
    </div>
  );
}

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  isSecret: boolean;
  category: string;
  difficulty: string;
  unlockedCount?: number;
  onClick?: () => void;
}

export function AchievementCard({
  title,
  description,
  icon,
  rarity,
  xpReward,
  isSecret,
  unlockedCount,
  onClick,
}: AchievementCardProps) {
  const Icon = getAchievementIcon(icon);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 transition-all",
        "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
        "hover:shadow-2xl hover:border-primary/50",
        isSecret ? "border-dashed" : "border-white/10"
      )}
    >
      {/* Rarity glow */}
      <div
        className={cn(
          "absolute -inset-px opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          getRarityColor(rarity)
        )}
      />

      <div className="relative flex items-start gap-4">
        <AchievementBadge
          icon={icon}
          title={title}
          rarity={rarity}
          isSecret={isSecret}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-sm leading-tight line-clamp-1">
              {isSecret ? "???" : title}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {getRarityLabel(rarity)}
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground font-medium line-clamp-2">
            {isSecret ? "وسام سري - احصل عليه لكشف التفاصيل" : description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-black text-blue-500">
              <Sparkles className="h-3 w-3 fill-blue-500" />
              {xpReward} XP
            </div>
            {typeof unlockedCount === "number" && (
              <div className="text-[10px] font-bold text-muted-foreground">
                {unlockedCount} حاصل
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}