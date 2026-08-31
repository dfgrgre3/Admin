"use client";

import type { UserDetails } from "../types";

const XP_PER_LEVEL = 1000;

export interface LevelProgress {
  level: number;
  totalXP: number;
  levelProgress: number;
  xpToNextLevel: number;
}

export function computeLevelProgress(user: Pick<UserDetails, "totalXP">): LevelProgress {
  const totalXP = Math.max(0, user.totalXP ?? 0);
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const levelProgress = (currentLevelXP / XP_PER_LEVEL) * 100;
  const xpToNextLevel = Math.max(0, XP_PER_LEVEL - currentLevelXP);
  return { level, totalXP, levelProgress, xpToNextLevel };
}