"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Eye, EyeOff, Copy, Edit3, Trash2, Send, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AchievementCard } from "./achievement-badge";
import type { Achievement } from "../_lib/types";
import {
  getCategoryLabel,
  getDifficultyLabel,
  getRarityLabel,
  formatXpReward,
} from "../_lib/utils";

type ViewMode = "table" | "grid";

interface AchievementViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function AchievementViewToggle({ view, onViewChange }: AchievementViewToggleProps) {
  return (
    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        onClick={() => onViewChange("table")}
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-black transition-all",
          view === "table"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-4 w-4" />
        جدول
      </button>
      <button
        type="button"
        onClick={() => onViewChange("grid")}
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-black transition-all",
          view === "grid"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        شبكة
      </button>
    </div>
  );
}

interface AchievementGridProps {
  achievements: Achievement[];
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
  onDuplicate: (achievement: Achievement) => void;
  onToggleSecret: (achievement: Achievement) => void;
  onGrant?: (achievement: Achievement) => void;
}

export function AchievementGrid({
  achievements,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSecret,
  onGrant,
}: AchievementGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="font-black text-lg">لا توجد أوسمة</p>
        <p className="text-sm text-muted-foreground">ابدأ بإضافة وسام جديد للطلاب</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-6"
    >
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          variants={itemVariants}
          className="group relative"
        >
          <AchievementCard
            title={achievement.title}
            description={achievement.description}
            icon={achievement.icon}
            rarity={achievement.rarity}
            xpReward={achievement.xpReward}
            isSecret={achievement.isSecret}
            unlockedCount={achievement.unlockedCount} category={""} difficulty={""}          />

          {/* Action menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border border-white/10 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="إجراءات"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-xl border-white/10">
              <DropdownMenuItem
                onClick={() => onEdit(achievement)}
                className="font-bold cursor-pointer"
              >
                <Edit3 className="h-4 w-4 ml-2" />
                تعديل
              </DropdownMenuItem>
              {onGrant && (
                <DropdownMenuItem
                  onClick={() => onGrant(achievement)}
                  className="font-bold cursor-pointer"
                >
                  <Send className="h-4 w-4 ml-2" />
                  منح للطلاب
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onToggleSecret(achievement)}
                className="font-bold cursor-pointer"
              >
                {achievement.isSecret ? (
                  <>
                    <Eye className="h-4 w-4 ml-2" />
                    إظهار للطلاب
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 ml-2" />
                    إخفاء الوسام
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDuplicate(achievement)}
                className="font-bold cursor-pointer"
              >
                <Copy className="h-4 w-4 ml-2" />
                تكرار الوسام
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(achievement.id)}
                className="font-bold cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      ))}
    </motion.div>
  );
}