"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Gift, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrantAchievementDialog } from "@/app/(admin)/admin/achievements/_components/grant-achievement-dialog";
import { useUserAchievements, useRevokeAchievement } from "@/app/(admin)/admin/achievements/_hooks/use-user-achievements";
import type { UserDetails } from "./types";

interface AchievementsTabProps {
  user: UserDetails;
  canManage?: boolean;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "from-slate-400 to-slate-600",
  UNCOMMON: "from-emerald-400 to-emerald-600",
  RARE: "from-blue-400 to-blue-600",
  EPIC: "from-purple-400 to-purple-600",
  LEGENDARY: "from-amber-400 to-orange-600",
};

const RARITY_LABELS: Record<string, string> = {
  COMMON: "عادي",
  UNCOMMON: "غير شائع",
  RARE: "نادر",
  EPIC: "أسطوري",
  LEGENDARY: "خرافي",
};

export function AchievementsTab({ user, canManage = true }: AchievementsTabProps) {
  const [grantOpen, setGrantOpen] = useState(false);
  const { data: userAchievements = [], isLoading } = useUserAchievements({ userId: user.id });
  const revoke = useRevokeAchievement();

  const stats = useMemo(() => {
    const byRarity: Record<string, number> = {};
    let totalXp = 0;
    let manualCount = 0;
    userAchievements.forEach((ua) => {
      const rarity = ua.achievement?.rarity || "COMMON";
      byRarity[rarity] = (byRarity[rarity] || 0) + 1;
      totalXp += ua.achievement?.xpReward || 0;
      if (ua.isManual) manualCount += 1;
    });
    return {
      total: userAchievements.length,
      totalXp,
      manualCount,
      byRarity,
    };
  }, [userAchievements]);

  const sortedAchievements = useMemo(() => {
    return [...userAchievements].sort((a, b) => {
      const aRarity = a.achievement?.rarity || "";
      const bRarity = b.achievement?.rarity || "";
      const order = ["LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"];
      return order.indexOf(aRarity) - order.indexOf(bRarity);
    });
  }, [userAchievements]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            إنجازات المستخدم
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            عرض جميع الأوسمة التي حصل عليها {user.name || "هذا المستخدم"}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setGrantOpen(true)} className="gap-2">
            <Gift className="h-4 w-4" />
            منح وسام جديد
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="إجمالي الأوسمة"
          value={stats.total}
          color="from-blue-500 to-cyan-500"
          loading={isLoading}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="إجمالي نقاط XP"
          value={stats.totalXp.toLocaleString("ar-EG")}
          color="from-amber-500 to-orange-500"
          loading={isLoading}
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="الأوسمة الخرافية"
          value={stats.byRarity.LEGENDARY || 0}
          color="from-purple-500 to-pink-500"
          loading={isLoading}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="منح يدوي"
          value={stats.manualCount}
          color="from-emerald-500 to-teal-500"
          loading={isLoading}
        />
      </div>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : sortedAchievements.length === 0 ? (
        <EmptyState onGrant={() => setGrantOpen(true)} canManage={canManage} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map((ua, index) => (
            <AchievementCardItem
              key={ua.id}
              userAchievement={ua}
              index={index}
              canRevoke={canManage}
              onRev={() => revoke.mutate(ua.id)}
              isRevoking={revoke.isPending}
            />
          ))}
        </div>
      )}

      {canManage && (
        <GrantAchievementDialog
          open={grantOpen}
          onOpenChange={setGrantOpen}
          defaultUserIds={[user.id]}
          defaultUserName={user.name ?? undefined}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  loading?: boolean;
}

function StatCard({ icon, label, value, color, loading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
            </div>
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface AchievementCardItemProps {
  userAchievement: {
    id: string;
    earnedAt: string;
    isManual?: boolean;
    grantReason?: string;
    achievement: {
      id: string;
      title: string;
      description: string;
      icon: string;
      rarity: string;
      xpReward: number;
      category: string;
    };
  };
  index: number;
  canRevoke: boolean;
  onRev: () => void;
  isRevoking: boolean;
}

function AchievementCardItem({ userAchievement, index, canRevoke, onRev, isRevoking }: AchievementCardItemProps) {
  const { achievement, earnedAt, isManual, grantReason } = userAchievement;
  const rarityKey = achievement.rarity || "COMMON";
  const gradient = RARITY_COLORS[rarityKey] || RARITY_COLORS.COMMON;
  const rarityLabel = RARITY_LABELS[rarityKey] || achievement.rarity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div
              className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}
            >
              {achievement.icon || "🏆"}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="text-xs">
                {rarityLabel}
              </Badge>
              {isManual && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                  يدوي
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base">{achievement.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {achievement.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>+{achievement.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{new Date(earnedAt).toLocaleDateString("ar-EG")}</span>
            </div>
          </div>

          {grantReason && (
            <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-md">
              💬 {grantReason}
            </p>
          )}

          {canRevoke && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRev}
              disabled={isRevoking}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              إلغاء الوسام
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ onGrant, canManage }: { onGrant: () => void; canManage: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
        <Award className="h-10 w-10 text-primary" />
      </div>
      <h4 className="font-semibold text-lg">لا توجد أوسمة بعد</h4>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        لم يحصل هذا المستخدم على أي أوسمة حتى الآن
      </p>
      {canManage && (
        <Button onClick={onGrant} className="mt-4 gap-2">
          <Gift className="h-4 w-4" />
          منح أول وسام
        </Button>
      )}
    </motion.div>
  );
}