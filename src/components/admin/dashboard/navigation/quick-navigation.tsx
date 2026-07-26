"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { 
  Users, BookOpen, FileText, ClipboardList, Settings, 
  DollarSign, BarChart3, Shield, Bell, MessageSquare, 
  HelpCircle, Star, LayoutGrid 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "amber" | "red" | "gray";
  badge?: number;
}

interface QuickNavigationProps {
  favorites?: NavItem[];
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { title: "المستخدمين", href: "/admin/users", icon: Users, color: "blue" },
  { title: "الكورسات", href: "/admin/courses", icon: BookOpen, color: "green" },
  { title: "الامتحانات", href: "/admin/exams", icon: FileText, color: "purple" },
  { title: "الواجبات", href: "/admin/assignments", icon: ClipboardList, color: "amber" },
  { title: "الطلبات", href: "/admin/orders", icon: DollarSign, color: "red" },
  { title: "التقارير", href: "/admin/reports", icon: BarChart3, color: "blue" },
  { title: "الأمان", href: "/admin/security", icon: Shield, color: "gray" },
  { title: "الإشعارات", href: "/admin/notifications", icon: Bell, color: "purple", badge: 5 },
  { title: "الدعم", href: "/admin/support", icon: MessageSquare, color: "green" },
  { title: "الإعدادات", href: "/admin/settings", icon: Settings, color: "gray" },
];

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  green: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  purple: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  amber: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  red: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  gray: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
};

export function QuickNavigation({ favorites = defaultNavItems, className }: QuickNavigationProps) {
  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span>التنقل السريع</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {favorites.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative"
            >
              <div className={cn(
                "p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all",
                colorClasses[item.color]
              )}>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold">{item.title}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminCard>
  );
}

interface FavoritesProps {
  items: NavItem[];
  onRemove?: (href: string) => void;
  className?: string;
}

export function Favorites({ items, onRemove, className }: FavoritesProps) {
  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <span>المفضلة</span>
        </h3>
        <span className="text-xs text-muted-foreground">{items.length} عنصر</span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
          <Star className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            لا توجد عناصر مفضلة
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-primary/30 transition-all group"
              >
                <div className={cn("p-2 rounded-lg", colorClasses[item.color])}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm flex-1">{item.title}</span>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onRemove(item.href);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-500 transition-all"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
