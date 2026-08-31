// Constants and options for achievements
import {
  Award,
  Trophy,
  Medal,
  Star,
  Zap,
  Target,
  Flame,
  Crown,
  Gem,
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  Rocket,
  Heart,
  Gift,
  Shield,
  Flame as Fire,
  Lightbulb,
  Music,
  Camera,
  Palette,
  Compass,
  Map,
  Globe,
  Atom,
  Microscope,
  Pencil,
  PencilLine,
  Calculator,
  Languages,
  Trophy as TrophyIcon,
  type LucideIcon,
} from "lucide-react";

export const RARITY_OPTIONS = [
  { value: "common", label: "أساسي", weight: 1 },
  { value: "uncommon", label: "برونزي", weight: 2 },
  { value: "rare", label: "فضي", weight: 3 },
  { value: "epic", label: "ذهبي", weight: 4 },
  { value: "legendary", label: "بلاتيني", weight: 5 },
] as const;

export type RarityValue = (typeof RARITY_OPTIONS)[number]["value"];

export const CATEGORY_OPTIONS = [
  { value: "STUDY", label: "نشاط دراسي", icon: BookOpen },
  { value: "TASKS", label: "إتمام مهام", icon: CheckCircle2 },
  { value: "EXAMS", label: "اختبارات", icon: GraduationCap },
  { value: "TIME", label: "وقت المذاكرة", icon: Clock },
  { value: "STREAK", label: "استمرارية", icon: Flame },
  { value: "SOCIAL", label: "تفاعل اجتماعي", icon: Heart },
  { value: "MASTERY", label: "إتقان", icon: Star },
  { value: "EXPLORATION", label: "استكشاف", icon: Compass },
] as const;

export type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

export const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "مبتدئ", level: 1, color: "emerald" },
  { value: "MEDIUM", label: "متوسط", level: 2, color: "blue" },
  { value: "HARD", label: "متقدم", level: 3, color: "amber" },
  { value: "EXPERT", label: "خبير", level: 4, color: "rose" },
] as const;

export type DifficultyValue = (typeof DIFFICULTY_OPTIONS)[number]["value"];

// Curated lucide icons for achievement badges
export const ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Award", label: "الجائزة", icon: Award },
  { value: "Trophy", label: "الكأس", icon: Trophy },
  { value: "Medal", label: "الوسام", icon: Medal },
  { value: "Star", label: "النجمة", icon: Star },
  { value: "Zap", label: "البرق", icon: Zap },
  { value: "Target", label: "الهدف", icon: Target },
  { value: "Flame", label: "اللهب", icon: Flame },
  { value: "Fire", label: "النار", icon: Fire },
  { value: "Crown", label: "التاج", icon: Crown },
  { value: "Gem", label: "الجوهرة", icon: Gem },
  { value: "Sparkles", label: "اللمعان", icon: Sparkles },
  { value: "BookOpen", label: "الكتاب", icon: BookOpen },
  { value: "GraduationCap", label: "التخرج", icon: GraduationCap },
  { value: "CheckCircle2", label: "الإنجاز", icon: CheckCircle2 },
  { value: "Clock", label: "الوقت", icon: Clock },
  { value: "TrendingUp", label: "التقدم", icon: TrendingUp },
  { value: "Brain", label: "العقل", icon: Brain },
  { value: "Rocket", label: "الصاروخ", icon: Rocket },
  { value: "Heart", label: "القلب", icon: Heart },
  { value: "Gift", label: "الهدية", icon: Gift },
  { value: "Shield", label: "الدرع", icon: Shield },
  { value: "Lightbulb", label: "الفكرة", icon: Lightbulb },
  { value: "Music", label: "الموسيقى", icon: Music },
  { value: "Camera", label: "الكاميرا", icon: Camera },
  { value: "Palette", label: "الفن", icon: Palette },
  { value: "Compass", label: "البوصلة", icon: Compass },
  { value: "Map", label: "الخريطة", icon: Map },
  { value: "Globe", label: "الكرة الأرضية", icon: Globe },
  { value: "Atom", label: "الذرة", icon: Atom },
  { value: "Microscope", label: "المجهر", icon: Microscope },
  { value: "Pencil", label: "القلم", icon: Pencil },
  { value: "Calculator", label: "الحاسبة", icon: Calculator },
  { value: "Languages", label: "اللغات", icon: Languages },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((option) => [option.value, option.icon])
);

export function getAchievementIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Award;
}

export const RARITY_COLORS: Record<string, string> = {
  common: "bg-slate-500",
  uncommon: "bg-orange-600",
  rare: "bg-zinc-400",
  epic: "bg-amber-500",
  legendary: "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
};

export const RARITY_TEXT_COLORS: Record<string, string> = {
  common: "text-slate-400",
  uncommon: "text-orange-500",
  rare: "text-zinc-300",
  epic: "text-amber-500",
  legendary: "text-cyan-400",
};

export const RARITY_BG_COLORS: Record<string, string> = {
  common: "bg-slate-500/10 border-slate-500/30",
  uncommon: "bg-orange-500/10 border-orange-500/30",
  rare: "bg-zinc-400/10 border-zinc-400/30",
  epic: "bg-amber-500/10 border-amber-500/30",
  legendary: "bg-cyan-500/10 border-cyan-500/30",
};

export const RARITY_LABELS: Record<string, string> = {
  common: "أساسي",
  uncommon: "برونزي",
  rare: "فضي",
  epic: "ذهبي",
  legendary: "بلاتيني",
};

export const CATEGORY_LABELS: Record<string, string> = {
  STUDY: "نشاط دراسي",
  TASKS: "إتمام مهام",
  EXAMS: "اختبارات",
  TIME: "وقت المذاكرة",
  STREAK: "استمرارية",
  SOCIAL: "تفاعل اجتماعي",
  MASTERY: "إتقان",
  EXPLORATION: "استكشاف",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "مبتدئ",
  MEDIUM: "متوسط",
  HARD: "متقدم",
  EXPERT: "خبير",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  MEDIUM: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  HARD: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  EXPERT: "text-rose-500 border-rose-500/30 bg-rose-500/10",
};

// XP ranges per rarity for validation
export const XP_RANGES_BY_RARITY: Record<string, { min: number; max: number; suggested: number }> = {
  common: { min: 5, max: 50, suggested: 10 },
  uncommon: { min: 50, max: 150, suggested: 75 },
  rare: { min: 150, max: 500, suggested: 250 },
  epic: { min: 500, max: 1500, suggested: 750 },
  legendary: { min: 1500, max: 10000, suggested: 2500 },
};

export const ACHIEVEMENT_LIMITS = {
  MIN_KEY_LENGTH: 3,
  MAX_KEY_LENGTH: 64,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_XP: 0,
  MAX_XP: 10000,
  MAX_CRITERIA_LENGTH: 200,
} as const;

export const ACHIEVEMENT_TEMPLATES = [
  {
    title: "أول خطوة",
    description: "أكمل درسك الأول على المنصة",
    key: "FIRST_LESSON_COMPLETED",
    icon: "BookOpen",
    rarity: "common",
    category: "STUDY",
    difficulty: "EASY",
    xpReward: 10,
    criteria: "COMPLETE_1_LESSON",
  },
  {
    title: "المثابر",
    description: "ادرس لمدة 7 أيام متتالية",
    key: "WEEK_STREAK",
    icon: "Flame",
    rarity: "rare",
    category: "STREAK",
    difficulty: "MEDIUM",
    xpReward: 250,
    criteria: "STREAK_7_DAYS",
  },
  {
    title: "بطل الاختبارات",
    description: "احصل على 100% في 5 اختبارات",
    key: "PERFECT_EXAMS_MASTER",
    icon: "Trophy",
    rarity: "epic",
    category: "EXAMS",
    difficulty: "HARD",
    xpReward: 1000,
    criteria: "PERFECT_SCORE_5_EXAMS",
  },
  {
    title: "الملك المتفوق",
    description: "احصل على المركز الأول في لوحة المتصدرين",
    key: "LEADERBOARD_CHAMPION",
    icon: "Crown",
    rarity: "legendary",
    category: "MASTERY",
    difficulty: "EXPERT",
    xpReward: 5000,
    criteria: "RANK_1_LEADERBOARD",
  },
] as const;