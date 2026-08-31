"use client";

import { GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { computeLevelProgress } from "./types";
import type { UserDetails } from "./types";

interface ProfileLevelProgressProps {
  user: UserDetails;
}

export function ProfileLevelProgress({ user }: ProfileLevelProgressProps) {
  const { level, levelProgress, xpToNextLevel } = computeLevelProgress(user);

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-primary flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4" />
          المستوى {level}
        </span>
        <span className="text-xs text-muted-foreground">{xpToNextLevel.toLocaleString()} XP</span>
      </div>
      <Progress value={levelProgress} className="h-2 rounded-full bg-primary/10" />
      <p className="text-[10px] text-muted-foreground mt-1 text-center">
        للوصول للمستوى {level + 1}
      </p>
    </div>
  );
}