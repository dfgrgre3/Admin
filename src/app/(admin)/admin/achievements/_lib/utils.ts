// Utility functions for achievements
import {
  RARITY_LABELS,
  RARITY_COLORS,
  RARITY_TEXT_COLORS,
  RARITY_BG_COLORS,
  RARITY_OPTIONS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_OPTIONS,
  CATEGORY_LABELS,
} from "./constants";

export function getRarityLabel(rarity: string): string {
  return RARITY_LABELS[rarity] || rarity;
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export function getDifficultyLabel(difficulty: string): string {
  return DIFFICULTY_LABELS[difficulty] || difficulty;
}

export function getRarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] ?? RARITY_COLORS.common ?? "";
}

export function getRarityTextColor(rarity: string): string {
  return RARITY_TEXT_COLORS[rarity] ?? RARITY_TEXT_COLORS.common ?? "";
}

export function getRarityBgColor(rarity: string): string {
  return RARITY_BG_COLORS[rarity] ?? RARITY_BG_COLORS.common ?? "";
}

export function getDifficultyColor(difficulty: string): string {
  return DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.MEDIUM ?? "";
}

export function formatXpReward(xp: number): string {
  return `${xp.toLocaleString("ar-EG")} نقطة`;
}

export function formatUserCount(count: number): string {
  if (count === 0) return "لا يوجد";
  if (count === 1) return "مستخدم واحد";
  if (count === 2) return "مستخدمان";
  if (count >= 3 && count <= 10) return `${count} مستخدمين`;
  return `${count.toLocaleString("ar-EG")} مستخدم`;
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getRarityOrder(rarity: string): number {
  return RARITY_OPTIONS.find((o) => o.value === rarity)?.weight ?? 0;
}

export function getDifficultyOrder(difficulty: string): number {
  return DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.level ?? 0;
}

export function validateAchievementKey(key: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(key);
}

export function validateXpReward(xp: number): boolean {
  return Number.isInteger(xp) && xp >= 0 && xp <= 10000;
}

// Compute stats from a list of achievements
export function computeAchievementStats<
  T extends {
    rarity: string;
    category: string;
    difficulty: string;
    isSecret: boolean;
    unlockedCount?: number;
    xpReward?: number;
  },
>(achievements: T[]) {
  const stats = {
    total: achievements.length,
    secret: 0,
    visible: 0,
    totalUnlocked: 0,
    totalXp: 0,
    byRarity: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
  };

  for (const achievement of achievements) {
    if (achievement.isSecret) stats.secret++;
    else stats.visible++;

    stats.totalUnlocked += achievement.unlockedCount || 0;
    stats.totalXp += achievement.xpReward || 0;

    stats.byRarity[achievement.rarity] = (stats.byRarity[achievement.rarity] || 0) + 1;
    stats.byCategory[achievement.category] = (stats.byCategory[achievement.category] || 0) + 1;
    stats.byDifficulty[achievement.difficulty] =
      (stats.byDifficulty[achievement.difficulty] || 0) + 1;
  }

  return stats;
}

// Convert JSON export to CSV
export function convertToCSV<T extends object>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  const headerRow = headers.map((h) => `"${h.label}"`).join(",");
  const rows = data.map((item) =>
    headers
      .map((h) => {
        const value = item[h.key];
        const stringValue = value === null || value === undefined ? "" : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headerRow, ...rows].join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate unique achievement key from title
export function generateAchievementKey(title: string, prefix = "ACH"): string {
  const transliterated = title
    .trim()
    .replace(/[\u0600-\u06FF]/g, "") // Remove Arabic
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_")
    .slice(0, 32);

  if (transliterated) return `${prefix}_${transliterated}`;
  return `${prefix}_${Date.now().toString(36).toUpperCase()}`;
}

export function generateCopyKey(originalKey: string): string {
  const baseKey = originalKey.replace(/_COPY(?:_\d+)?$/, "");
  const random = Math.floor(Math.random() * 1000);
  return `${baseKey}_COPY_${random}`;
}

export const DEFAULT_FORM_VALUES = {
  key: "",
  title: "",
  description: "",
  icon: "Award",
  rarity: "common",
  xpReward: 10,
  isSecret: false,
  category: "STUDY",
  difficulty: "EASY",
  criteria: "",
};