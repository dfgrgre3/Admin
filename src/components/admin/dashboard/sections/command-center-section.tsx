"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  BarChart3,
  Wallet,
  MessageSquare,
  Settings,
  LayoutGrid,
  Search,
  Command,
  ArrowLeft,
  Award,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";

interface ModuleItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "amber" | "rose" | "cyan" | "violet" | "emerald";
}

const MODULES: ModuleItem[] = [
  { title: "المستخدمين", description: "إدارة الحسابات والصلاحيات", href: "/admin/users", icon: Users, color: "blue" },
  { title: "المواد الدراسية", description: "المحتوى التعليمي والكورسات", href: "/admin/subjects", icon: BookOpen, color: "green" },
  { title: "الامتحانات", description: "إنشاء وتصحيح الاختبارات", href: "/admin/exams", icon: FileText, color: "purple" },
  { title: "المعلمون", description: "إدارة الطاقم التعليمي", href: "/admin/teachers", icon: GraduationCap, color: "violet" },
  { title: "التحليلات", description: "تقارير وإحصائيات المنصة", href: "/admin/analytics", icon: BarChart3, color: "cyan" },
  { title: "المحفظة والمدفوعات", description: "الإيرادات والمعاملات", href: "/admin/wallet", icon: Wallet, color: "emerald" },
  { title: "التذاكر والدعم", description: "رسائل وتذاكر المستخدمين", href: "/admin/tickets", icon: MessageSquare, color: "amber" },
  { title: "الإنجازات والشارات", description: "نظام المكافآت والوسامات", href: "/admin/achievements", icon: Award, color: "rose" },
  { title: "الفعاليات والمسابقات", description: "التحديات والمناسبات", href: "/admin/events", icon: CalendarDays, color: "blue" },
  { title: "الأمان والمراقبة", description: "سجلات الحماية والتنبيهات", href: "/admin/security-logs", icon: ShieldAlert, color: "rose" },
  { title: "الرسائل والإعلانات", description: "التواصل مع جميع المستخدمين", href: "/admin/announcements", icon: MessageSquare, color: "purple" },
  { title: "الإعدادات", description: "إعدادات المنصة العامة", href: "/admin/settings", icon: Settings, color: "green" },
];

const colorClasses: Record<ModuleItem["color"], string> = {
  blue: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20",
  green: "bg-green-500/10 text-green-500 group-hover:bg-green-500/20",
  purple: "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20",
  amber: "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20",
  rose: "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20",
  cyan: "bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20",
  violet: "bg-violet-500/10 text-violet-500 group-hover:bg-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20",
};

const QUICK_SEARCHES = [
  { label: "المستخدمين", href: "/admin/users" },
  { label: "الامتحانات", href: "/admin/exams" },
  { label: "التحليلات", href: "/admin/analytics" },
  { label: "الطلبات", href: "/admin/orders" },
];

interface CommandCenterSectionProps {
  playSound: (sound: string) => void;
}

/**
 * CommandCenterSection — real quick navigation hub with a functional search
 * box and shortcuts to the main admin modules.
 */
export const CommandCenterSection = React.memo(function CommandCenterSection({
  playSound,
}: CommandCenterSectionProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("click");
    const q = query.trim();
    router.push(q ? `/admin/users?search=${encodeURIComponent(q)}` : "/admin/users");
  };

  const handleOpenPalette = () => {
    playSound("click");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">مركز الأوامر والتنقل السريع</h3>
              <p className="text-sm text-gray-400">الوصول المباشر إلى أهم أقسام لوحة التحكم</p>
            </div>
          </div>
          <button
            onClick={handleOpenPalette}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
            title="فتح لوحة الأوامر (Ctrl+K)"
          >
            <Command className="h-4 w-4" />
            لوحة الأوامر
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] font-black text-gray-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مستخدم أو انتقل إلى قسم..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 pr-12 pl-4 text-sm font-semibold text-white placeholder:text-gray-500 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 items-center gap-1 rounded-xl bg-primary px-3 text-xs font-black text-primary-foreground transition-transform hover:scale-105"
            >
              بحث
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">الأكثر زيارة:</span>
            {QUICK_SEARCHES.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onMouseEnter={() => playSound("hover")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300 transition-colors hover:border-primary/30 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <a
                key={module.href}
                href={module.href}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110", colorClasses[module.color])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{module.title}</p>
                  <p className="truncate text-[11px] text-gray-500">{module.description}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
});
