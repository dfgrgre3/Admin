// Type definitions for achievements
export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  isSecret: boolean;
  category: string;
  difficulty: string;
  criteria: string;
  unlockedCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AchievementFormValues {
  key: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  isSecret: boolean;
  category: string;
  difficulty: string;
  criteria: string;
}

export interface AchievementStats {
  total: number;
  secret: number;
  visible: number;
  totalUnlocked: number;
  totalXp: number;
  byRarity: Record<string, number>;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export type AchievementSortField =
  | "title"
  | "rarity"
  | "difficulty"
  | "category"
  | "xpReward"
  | "unlockedCount"
  | "createdAt";

export type SortDirection = "asc" | "desc";

export interface AchievementFilters {
  search: string;
  category: string;
  rarity: string;
  difficulty: string;
  status: "all" | "visible" | "secret";
}

// User-Achievement grant history
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  earnedAt: string;
  grantedBy?: string;
  grantReason?: string;
  isManual?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface UserAchievementFilters {
  search: string;
  achievementId: string;
  category: string;
  rarity: string;
  dateRange: "all" | "today" | "week" | "month";
  isManual?: "all" | "manual" | "automatic";
}

export interface GrantAchievementPayload {
  userIds: string[];
  achievementId: string;
  reason?: string;
  notifyUser?: boolean;
}