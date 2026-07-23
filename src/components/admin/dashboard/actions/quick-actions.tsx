"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  BookOpen,
  FileText,
  ClipboardList,
  Settings,
  Bell,
  Megaphone,
  Plus,
  ArrowUpRight
} from "lucide-react";

interface QuickAction {
  title: string;
  icon: any;
  href: string;
  color: "blue" | "green" | "purple" | "amber" | "gray" | "rose";
}

interface QuickActionsProps {
  onActionClick?: (action: QuickAction) => void;
  playSound?: (sound: string) => void;
}

const quickActionsConfig: QuickAction[] = [
  { title: "إضافة مستخدم", icon: UserPlus, href: "/admin/users?action=new", color: "blue" },
  { title: "مادة جديدة", icon: BookOpen, href: "/admin/subjects?action=new", color: "green" },
  { title: "إنشاء اختبار", icon: FileText, href: "/admin/exams?action=new", color: "purple" },
  { title: "مهمة جديدة", icon: ClipboardList, href: "/admin/challenges?action=new", color: "amber" },
  { title: "الإعدادات", icon: Settings, href: "/admin/settings", color: "gray" },
  { title: "تنبيه عام", icon: Bell, href: "/admin/notifications?action=new", color: "rose" },
];

const quickActionColorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  green: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  purple: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  amber: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  gray: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  rose: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
};

export function QuickActions({ onActionClick, playSound }: QuickActionsProps) {
  const handleActionClick = (action: QuickAction) => {
    if (playSound) playSound("click");
    if (onActionClick) onActionClick(action);
  };

  return (
    <AdminCard variant="glass" className="border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <span>الإجراءات السريعة</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowUpRight className="w-4 h-4" />
          <span>وصول سريع</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {quickActionsConfig.map((action, i) => (
          <a
            key={i}
            href={action.href}
            onMouseEnter={() => playSound?.('hover')}
            onClick={() => handleActionClick(action)}
            className="admin-glass p-6 flex flex-col items-center justify-center gap-4 group hover:border-primary/50 transition-all rounded-2xl"
          >
            <div className={cn(
              "p-4 rounded-2xl border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all",
              quickActionColorClasses[action.color] ?? quickActionColorClasses.blue
            )}>
              <action.icon className="w-7 h-7" />
            </div>
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">
              {action.title}
            </span>
          </a>
        ))}
      </div>
    </AdminCard>
  );
}

export function BroadcastActionCard({
  onOpen,
  playSound
}: {
  onOpen: () => void;
  playSound?: (sound: string) => void;
}) {
  return (
    <AdminCard variant="glass" className="border-primary/20">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-primary/10 text-primary rounded-2xl">
          <Megaphone className="w-12 h-12" />
        </div>
        <div>
          <h4 className="font-black text-lg">مركز الإشعارات العام</h4>
          <p className="text-xs text-gray-400 font-medium mt-2">
            إرسال تنبيه إداري عاجل لكافة المستخدمين والطلاب.
          </p>
        </div>
        <AdminButton
          variant="premium"
          className="w-full rounded-2xl h-12"
          onClick={() => {
            playSound?.("click");
            onOpen();
          }}
        >
          إرسال بث تنبيهي
        </AdminButton>
      </div>
    </AdminCard>
  );
}
