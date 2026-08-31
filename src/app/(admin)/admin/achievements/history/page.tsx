"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Users, Bot, Calendar, Trophy, ArrowRight, Download, Activity, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { TableSkeleton } from "@/components/admin/ui/loading-skeleton";
import { toast } from "sonner";

import { AchievementsHistoryTable } from "../achievements-history-table";
import {
  useUserAchievements,
  useRevokeAchievement,
} from "../_hooks/use-user-achievements";
import type { UserAchievement } from "../_lib/types";
import { convertToCSV, downloadFile, formatDate } from "../_lib/utils";

export default function AchievementsHistoryPage() {
  const { data: records = [], isLoading, refetch } = useUserAchievements();
  const revokeMutation = useRevokeAchievement();

  const [revokeDialog, setRevokeDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const handleRevokeRequest = (id: string) => setRevokeDialog({ open: true, id });

  const handleRevoke = async () => {
    if (!revokeDialog.id) return;
    try {
      await revokeMutation.mutateAsync(revokeDialog.id);
    } finally {
      setRevokeDialog({ open: false, id: null });
    }
  };

  // Stats
  const stats = React.useMemo(() => {
    const manualCount = records.filter((r) => r.isManual).length;
    const automaticCount = records.filter((r) => !r.isManual).length;
    const totalXp = records.reduce((sum, r) => sum + (r.achievement?.xpReward || 0), 0);
    const uniqueUsers = new Set(records.map((r) => r.userId)).size;
    return { manualCount, automaticCount, totalXp, uniqueUsers, total: records.length };
  }, [records]);

  const handleExport = () => {
    if (records.length === 0) {
      toast.error("لا توجد سجلات للتصدير");
      return;
    }
    const exportData = records.map((r) => ({
      userName: r.user?.name || "",
      userEmail: r.user?.email || "",
      achievementTitle: r.achievement?.title || "",
      achievementKey: r.achievement?.key || "",
      rarity: r.achievement?.rarity || "",
      xpReward: r.achievement?.xpReward || 0,
      earnedAt: r.earnedAt,
      isManual: r.isManual ? "manual" : "automatic",
    }));
    const csv = convertToCSV(exportData, [
      { key: "userName", label: "اسم المستخدم" },
      { key: "userEmail", label: "البريد الإلكتروني" },
      { key: "achievementTitle", label: "الوسام" },
      { key: "achievementKey", label: "المفتاح" },
      { key: "rarity", label: "الفئة" },
      { key: "xpReward", label: "النقاط" },
      { key: "earnedAt", label: "تاريخ المنح" },
      { key: "isManual", label: "النوع" },
    ]);
    downloadFile(
      csv,
      `achievements-history-${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8"
    );
    toast.success("تم تصدير السجل بنجاح");
  };

  const statCards = [
    {
      title: "إجمالي السجلات",
      value: stats.total,
      label: "عملية منح",
      icon: Activity,
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      title: "منح يدوي",
      value: stats.manualCount,
      label: "بواسطة المدير",
      icon: Users,
      color: "from-amber-500/20 to-amber-500/5",
    },
    {
      title: "منح تلقائي",
      value: stats.automaticCount,
      label: "من النظام",
      icon: Bot,
      color: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      title: "الطلاب المستفيدون",
      value: stats.uniqueUsers,
      label: "طالب حصل على وسام",
      icon: Award,
      color: "from-purple-500/20 to-purple-500/5",
    },
  ];

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="سجل منح الأوسمة"
        description="سجل شامل بجميع الأوسمة الممنوحة للطلاب والمستخدمين، مع إمكانية تتبع المصدر (يدوي/تلقائي)."
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/achievements">
            <AdminButton variant="outline" icon={ArrowRight}>
              العودة لإدارة الأوسمة
            </AdminButton>
          </Link>
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>
            تصدير CSV
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl border border-white/10 p-5 bg-gradient-to-br backdrop-blur-sm ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-black">{card.value.toLocaleString("ar-EG")}</p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">{card.label}</p>
                </div>
                <div className="rounded-xl bg-background/40 p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="font-black text-lg uppercase tracking-widest">سجل المنح الكامل</h2>
          <span className="text-xs font-bold text-muted-foreground">
            ({records.length} سجل)
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : (
          <AchievementsHistoryTable records={records} onRevoke={handleRevokeRequest} />
        )}
      </motion.div>

      <AdminConfirm
        open={revokeDialog.open}
        onOpenChange={(open) => setRevokeDialog({ open, id: null })}
        title="إلغاء منح الوسام"
        description="هل أنت متأكد من إلغاء هذا الوسام من سجل المستخدم؟ سيتم خصم النقاط المرتبطة به."
        confirmText="تأكيد الإلغاء"
        variant="destructive"
        onConfirm={handleRevoke}
        loading={revokeMutation.isPending}
      />
    </div>
  );
}