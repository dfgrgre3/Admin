"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  BookOpen,
  FileText,
  ClipboardList,
  Settings,
  Bell,
} from "lucide-react";

const STYLES = {
  glass: "admin-glass p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl relative overflow-hidden",
};

const quickActionsConfig = [
  { title: "إضافة مستخدم", icon: UserPlus, href: "/admin/users?action=new", color: "blue" },
  { title: "مادة جديدة", icon: BookOpen, href: "/admin/subjects?action=new", color: "green" },
  { title: "إنشاء اختبار", icon: FileText, href: "/admin/exams?action=new", color: "purple" },
  { title: "مهمة جديدة", icon: ClipboardList, href: "/admin/challenges?action=new", color: "orange" },
  { title: "الإعدادات", icon: Settings, href: "/admin/settings", color: "gray" },
  { title: "تنبيه عام", icon: Bell, href: "/admin/notifications?action=new", color: "rose" },
] as const;

const quickActionColorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  purple: "bg-purple-500/10 text-purple-500",
  orange: "bg-orange-500/10 text-orange-500",
  gray: "bg-gray-500/10 text-gray-500",
  rose: "bg-rose-500/10 text-rose-500",
};

interface QuickActionsSectionProps {
  playSound: (sound: string) => void;
}

/**
 * QuickActionsSection — the grid of quick-action shortcut cards.
 *
 * Extracted from the God Component. The action config is static so this
 * component only re-renders when `playSound` changes (rarely).
 */
export const QuickActionsSection = React.memo(function QuickActionsSection({
  playSound,
}: QuickActionsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {quickActionsConfig.map((action, i) => (
        <a
          key={i}
          href={action.href}
          onMouseEnter={() => playSound("hover")}
          onClick={() => playSound("click")}
          className={STYLES.glass + " p-6 flex flex-col items-center justify-center gap-4 group hover:border-primary/50 transition-all"}
        >
          <div className={cn("p-4 rounded-2xl border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all", quickActionColorClasses[action.color] ?? quickActionColorClasses.blue)}>
            <action.icon className="w-7 h-7" />
          </div>
          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{action.title}</span>
        </a>
      ))}
    </div>
  );
});