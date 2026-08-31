"use client";

import * as React from "react";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Users,
  Calendar,
  Trash2,
  Filter,
  Award,
  User,
  Bot,
  Mail,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { CATEGORY_OPTIONS, RARITY_OPTIONS, getAchievementIcon } from "./_lib/constants";
import { formatDateTime } from "./_lib/utils";
import type { UserAchievement } from "./_lib/types";

interface AchievementsHistoryTableProps {
  records: UserAchievement[];
  onRevoke: (id: string) => void;
}

export function AchievementsHistoryTable({ records, onRevoke }: AchievementsHistoryTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [rarityFilter, setRarityFilter] = React.useState("ALL");
  const [dateFilter, setDateFilter] = React.useState("all");
  const [grantTypeFilter, setGrantTypeFilter] = React.useState<"all" | "manual" | "automatic">(
    "all"
  );

  const filtered = React.useMemo(() => {
    return records.filter((record) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        record.user?.name?.toLowerCase().includes(term) ||
        record.user?.email?.toLowerCase().includes(term) ||
        record.achievement.title.toLowerCase().includes(term) ||
        record.achievement.key.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "ALL" || record.achievement.category === categoryFilter;
      const matchesRarity = rarityFilter === "ALL" || record.achievement.rarity === rarityFilter;

      const earnedAt = new Date(record.earnedAt);
      const now = new Date();
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = earnedAt.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = earnedAt >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = earnedAt >= monthAgo;
      }

      const matchesType =
        grantTypeFilter === "all" ||
        (grantTypeFilter === "manual" && record.isManual) ||
        (grantTypeFilter === "automatic" && !record.isManual);

      return matchesSearch && matchesCategory && matchesRarity && matchesDate && matchesType;
    });
  }, [records, searchTerm, categoryFilter, rarityFilter, dateFilter, grantTypeFilter]);

  const columns: ColumnDef<UserAchievement>[] = React.useMemo(
    () => [
      {
        id: "user",
        header: "المستخدم",
        cell: ({ row }) => {
          const user = row.original.user;
          const name = user?.name || user?.email || "مستخدم";
          const email = user?.email;
          const avatar = user?.avatar;
          return (
            <Link
              href={`/admin/users/${row.original.userId}`}
              className="flex items-center gap-3 hover:bg-white/5 -m-2 p-2 rounded-xl transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-black text-primary overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={name} className="h-full w-full object-cover" />
                ) : (
                  (name || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm truncate">{name}</p>
                {email && (
                  <p className="text-[10px] text-muted-foreground truncate font-bold flex items-center gap-1">
                    <Mail className="h-2.5 w-2.5" />
                    {email}
                  </p>
                )}
              </div>
            </Link>
          );
        },
      },
      {
        id: "achievement",
        header: "الوسام",
        cell: ({ row }) => {
          const achievement = row.original.achievement;
          const Icon = getAchievementIcon(achievement.icon);
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white shadow-md",
                  achievement.isSecret && "opacity-60"
                )}
                style={{
                  backgroundColor:
                    achievement.rarity === "legendary"
                      ? "rgb(6, 182, 212)"
                      : achievement.rarity === "epic"
                      ? "rgb(245, 158, 11)"
                      : achievement.rarity === "rare"
                      ? "rgb(161, 161, 170)"
                      : achievement.rarity === "uncommon"
                      ? "rgb(234, 88, 12)"
                      : "rgb(100, 116, 139)",
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm truncate">{achievement.title}</p>
                <p
                  className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 truncate max-w-[200px]"
                  dir="ltr"
                >
                  {achievement.key}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "rarity",
        header: "الفئة",
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-lg border-2 text-white border-white/10">
            {row.original.achievement.rarity}
          </Badge>
        ),
      },
      {
        id: "xp",
        header: "النقاط",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-black text-blue-500">
            <Star className="w-3.5 h-3.5 fill-blue-500" />+{row.original.achievement.xpReward}
          </div>
        ),
      },
      {
        id: "type",
        header: "طريقة المنح",
        cell: ({ row }) =>
          row.original.isManual ? (
            <Badge
              variant="outline"
              className="rounded-lg bg-amber-500/10 text-amber-500 border-amber-500/30 font-black text-[10px]"
            >
              <User className="h-3 w-3 ml-1" />
              يدوي
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-lg bg-blue-500/10 text-blue-500 border-blue-500/30 font-black text-[10px]"
            >
              <Bot className="h-3 w-3 ml-1" />
              تلقائي
            </Badge>
          ),
      },
      {
        accessorKey: "earnedAt",
        header: "تاريخ المنح",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{formatDateTime(row.original.earnedAt)}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            onDelete={() => onRevoke(row.original.id)}
          />
        ),
      },
    ],
    [onRevoke]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-4 bg-white/5 border-b border-white/10">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، أو الوسام..."
            className="w-full bg-accent/20 border border-border rounded-xl h-11 px-11 text-sm font-bold focus:ring-1 ring-primary/50 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Filter className="w-4 h-4 ml-2 text-primary" />
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع التصنيفات</SelectItem>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="w-36 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Star className="w-4 h-4 ml-2 text-amber-500" />
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الفئات</SelectItem>
              {RARITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-36 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Calendar className="w-4 h-4 ml-2 text-primary" />
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفترات</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={grantTypeFilter}
            onValueChange={(v) => setGrantTypeFilter(v as "all" | "manual" | "automatic")}
          >
            <SelectTrigger className="w-36 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Users className="w-4 h-4 ml-2 text-primary" />
              <SelectValue placeholder="المنح" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المنح</SelectItem>
              <SelectItem value="manual">يدوي</SelectItem>
              <SelectItem value="automatic">تلقائي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={filtered}
        searchKey=""
        searchPlaceholder=""
        columnLabels={{
          user: "المستخدم",
          achievement: "الوسام",
          rarity: "الفئة",
          xp: "النقاط",
          type: "طريقة المنح",
          earnedAt: "تاريخ المنح",
          actions: "الإجراءات",
        }}
        emptyMessage={{
          title: "لا توجد سجلات منح",
          description: "لم يتم منح أي وسام بعد.",
        }}
        bulkActions={[
          {
            label: `إلغاء ${filtered.length} سجل`,
            icon: Trash2,
            variant: "destructive",
            onClick: (rows) => {
              rows.forEach((r) => onRevoke((r as UserAchievement).id));
            },
          },
        ]}
      />
    </div>
  );
}