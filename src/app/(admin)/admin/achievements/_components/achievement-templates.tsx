"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, BookOpen, Flame, Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ACHIEVEMENT_TEMPLATES } from "../_lib/constants";
import { getAchievementIcon } from "../_lib/constants";
import { getRarityColor, getRarityLabel } from "../_lib/utils";

interface AchievementTemplatesProps {
  onSelect: (template: typeof ACHIEVEMENT_TEMPLATES[number]) => void;
  className?: string;
}

export function AchievementTemplates({ onSelect, className }: AchievementTemplatesProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
          أو ابدأ بقالب جاهز
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENT_TEMPLATES.map((template, index) => {
          const Icon = getAchievementIcon(template.icon);
          return (
            <motion.button
              key={template.key}
              type="button"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template)}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-right transition-all hover:border-primary/40 hover:bg-white/10"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white shadow-md",
                  getRarityColor(template.rarity)
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs font-black truncate">{template.title}</p>
                <p className="text-[10px] text-muted-foreground font-bold truncate">
                  {getRarityLabel(template.rarity)} • {template.xpReward} XP
                </p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}