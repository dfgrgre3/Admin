"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { ShoppingBag, CreditCard, Users, User, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RecentItem {
  id: string;
  title: string;
  subtitle?: string;
  status: "completed" | "pending" | "cancelled" | "active";
  date: string;
  amount?: string;
  href?: string;
}

interface RecentItemsProps {
  title: string;
  icon: React.ElementType;
  items: RecentItem[];
  viewAllHref?: string;
  className?: string;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  active: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

export const RecentItems = React.memo(function RecentItems({ title, icon: Icon, items, viewAllHref, className }: RecentItemsProps) {
  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <Icon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              لا توجد عناصر
            </p>
          </div>
        ) : (
          items.map((item) => {
            const status = statusConfig[item.status];
            const StatusIcon = status.icon;
            
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:border-primary/30",
                  status.bg,
                  status.border
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="font-bold text-sm hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <p className="font-bold text-sm">{item.title}</p>
                    )}
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <StatusIcon className={cn("w-3 h-3", status.color)} />
                      <span className={cn("text-xs font-bold", status.color)}>
                        {item.status === "completed" && "مكتمل"}
                        {item.status === "pending" && "قيد الانتظار"}
                        {item.status === "cancelled" && "ملغي"}
                        {item.status === "active" && "نشط"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                  {item.amount && (
                    <div className="text-left">
                      <p className="font-black text-sm">{item.amount}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminCard>
  );
});

interface RecentSectionProps {
  recentOrders: RecentItem[];
  recentPayments: RecentItem[];
  recentStudents: RecentItem[];
  recentTeachers: RecentItem[];
  recentCourses: RecentItem[];
  className?: string;
}

export const RecentSection = React.memo(function RecentSection({
  recentOrders,
  recentPayments,
  recentStudents,
  recentTeachers,
  recentCourses,
  className
}: RecentSectionProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentItems
          title="الطلبات الأخيرة"
          icon={ShoppingBag}
          items={recentOrders}
          viewAllHref="/admin/orders"
        />
        <RecentItems
          title="المدفوعات الأخيرة"
          icon={CreditCard}
          items={recentPayments}
          viewAllHref="/admin/payments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecentItems
          title="الطلاب الجدد"
          icon={Users}
          items={recentStudents}
          viewAllHref="/admin/students"
        />
        <RecentItems
          title="المعلمون الجدد"
          icon={User}
          items={recentTeachers}
          viewAllHref="/admin/teachers"
        />
        <RecentItems
          title="الكورسات الجديدة"
          icon={BookOpen}
          items={recentCourses}
          viewAllHref="/admin/courses"
        />
      </div>
    </div>
  );
});
