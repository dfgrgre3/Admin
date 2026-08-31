"use client";

import { Activity, Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ACTIVITY_TYPE_BADGES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  study: { label: "دراسة", variant: "default" },
  exam: { label: "اختبار", variant: "secondary" },
  achievement: { label: "إنجاز", variant: "default" },
  course_completed: { label: "إكمال كورس", variant: "default" },
  login: { label: "تسجيل دخول", variant: "outline" },
};

const FALLBACK: { label: string; variant: "default" | "secondary" | "outline" } = {
  label: "نشاط",
  variant: "outline",
};

export function ActivityTypeBadge({ type }: { type: string }) {
  const badge = ACTIVITY_TYPE_BADGES[type] ?? FALLBACK;
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

const ACTIVITY_ICONS: Record<string, { Icon: LucideIcon; color: string }> = {
  study: { Icon: BookOpen, color: "text-blue-500" },
  exam: { Icon: Activity, color: "text-purple-500" },
  achievement: { Icon: Award, color: "text-yellow-500" },
  course_completed: { Icon: TrendingUp, color: "text-green-500" },
  login: { Icon: Clock, color: "text-cyan-500" },
};

export function ActivityIcon({ type }: { type: string }) {
  const config = ACTIVITY_ICONS[type] ?? {
    Icon: Activity,
    color: "text-gray-500",
  };
  const { Icon, color } = config;
  return <Icon className={`h-5 w-5 ${color}`} />;
}