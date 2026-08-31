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
  Filter,
  Search,
  Star,
  Zap,
  Eye,
  EyeOff,
  Users,
  Calendar,
  Copy,
  Trash2,
  BarChart3,
  ListChecks,
  Send,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import type { Achievement } from "./_lib/types";
import {
  CATEGORY_OPTIONS,
  RARITY_OPTIONS,
  DIFFICULTY_OPTIONS,
  RARITY_COLORS,
  RARITY_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  getAchievementIcon,
} from "./_lib/constants";
import {
  getRarityOrder,
  getDifficultyOrder,
  formatXpReward,
  formatUserCount,
  formatDate,
} from "./_lib/utils";

interface AchievementTableProps {
  achievements: Achievement[];
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
  onDuplicate: (achievement: Achievement) => void;
  onToggleSecret: (achievement: Achievement) => void;
  onBulkDelete: (ids: string[]) => void;
  onGrant?: (achievement: Achievement) => void;
  onRefresh: () => void;
}

export function AchievementTable({
  achievements,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSecret,
  onBulkDelete,
  onGrant,
  onRefresh,
}: AchievementTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [rarityFilter, setRarityFilter] = React.useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const filteredAchievements = React.useMemo(() => {
    return achievements.filter((achievement) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        achievement.title.toLowerCase().includes(term) ||
        achievement.key.toLowerCase().includes(term) ||
        achievement.criteria?.toLowerCase().includes(term) ||
        achievement.description?.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "ALL" || achievement.category === categoryFilter;
      const matchesRarity = rarityFilter === "ALL" || achievement.rarity === rarityFilter;
      const matchesDifficulty =
        difficultyFilter === "ALL" || achievement.difficulty === difficultyFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "visible" && !achievement.isSecret) ||
        (statusFilter === "secret" && achievement.isSecret);

      return matchesSearch && matchesCategory && matchesRarity && matchesDifficulty && matchesStatus;
    });
  }, [achievements, searchTerm, categoryFilter, rarityFilter, difficultyFilter, statusFilter]);

  const columns: ColumnDef<Achievement>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: "الوسام التعليمي",
        cell: ({ row }) => {
          const achievement = row.original;
          const Icon = getAchievementIcon(achievement.icon);
          return (
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white shadow-lg",
                  RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm tracking-tight">{achievement.title}</p>
                  {achievement.isSecret && <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <p
                  className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 truncate max-w-[220px]"
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
        header: "فئة التميز",
        accessorFn: (row) => getRarityOrder(row.rarity),
        sortingFn: "basic",
        cell: ({ row }) => {
          const rarity = row.original.rarity;
          return (
            <Badge
              variant="outline"
              className={cn(
                "font-black text-[10px] uppercase tracking-widest rounded-lg border-2 px-3 py-1 text-white border-white/10",
                RARITY_COLORS[rarity] || RARITY_COLORS.common
              )}
            >
              {RARITY_LABELS[rarity] || rarity}
            </Badge>
          );
        },
      },
      {
        id: "difficulty",
        header: "الصعوبة",
        accessorFn: (row) => getDifficultyOrder(row.difficulty),
        sortingFn: "basic",
        cell: ({ row }) => {
          const difficulty = row.original.difficulty;
          return (
            <Badge
              variant="outline"
              className={cn(
                "font-black text-[10px] uppercase tracking-widest rounded-lg border px-3 py-1",
                DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.MEDIUM
              )}
            >
              {DIFFICULTY_LABELS[difficulty] || difficulty}
            </Badge>
          );
        },
      },
      {
        accessorKey: "category",
        header: "تصنيف الإنجاز",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="rounded-lg bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase"
          >
            {CATEGORY_LABELS[row.original.category] || row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "xpReward",
        header: "مكافأة النقاط",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            <span className="text-sm font-black">{formatXpReward(row.original.xpReward)}</span>
          </div>
        ),
      },
      {
        accessorKey: "isSecret",
        header: "حالة الظهور",
        cell: ({ row }) => {
          const isSecret = row.original.isSecret;
          return (
            <div className="flex items-center gap-2">
              {isSecret ? (
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isSecret ? "text-slate-400" : "text-emerald-500"
                )}
              >
                {isSecret ? "وسام مخفي" : "وسام عام"}
              </span>
            </div>
          );
        },
      },
      {
        id: "unlocked",
        header: "عدد الحاصلين",
        accessorFn: (row) => row.unlockedCount,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-black">{formatUserCount(row.original.unlockedCount)}</span>
          </div>
        ),
      },
      {
        accessorKey: "criteria",
        header: "شرط الإنجاز",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground" dir="ltr">
            <ListChecks className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold font-mono truncate max-w-[160px]">
              {row.original.criteria || "—"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "تاريخ الإنشاء",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-black">{formatDate(row.original.createdAt)}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            onEdit={onEdit}
            onDelete={(a) => onDelete(a.id)}
            extraActions={[
              ...(onGrant
                ? [
                    {
                      icon: Send,
                      label: "منح للطلاب",
                      onClick: onGrant,
                    },
                  ]
                : []),
              {
                icon: Copy,
                label: "تكرار الوسام",
                onClick: onDuplicate,
              },
              {
                icon: row.original.isSecret ? Eye : EyeOff,
                label: row.original.isSecret ? "إظهار للطلاب" : "إخفاء الوسام",
                onClick: onToggleSecret,
              },
            ]}
          />
        ),
      },
    ],
    [onEdit, onDelete, onDuplicate, onToggleSecret, onGrant]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 px-6 py-4 bg-white/5 border-b border-white/10">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث في الأوسمة بالعنوان، المفتاح، أو شرط الإنجاز..."
            className="w-full bg-accent/20 border border-border rounded-xl h-11 px-11 text-sm font-bold focus:ring-1 ring-primary/50 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Filter className="w-4 h-4 ml-2 text-primary" />
              <SelectValue placeholder="تصنيف الإنجاز" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10">
              <SelectItem value="ALL" className="font-bold cursor-pointer">
                جميع الفئات
              </SelectItem>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="w-40 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Star className="w-4 h-4 ml-2 text-amber-500" />
              <SelectValue placeholder="فئة التميز" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10">
              <SelectItem value="ALL" className="font-bold cursor-pointer">
                جميع المستويات
              </SelectItem>
              {RARITY_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-40 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <BarChart3 className="w-4 h-4 ml-2 text-primary" />
              <SelectValue placeholder="مستوى الصعوبة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10">
              <SelectItem value="ALL" className="font-bold cursor-pointer">
                كل المستويات
              </SelectItem>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="font-bold cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-11 rounded-xl bg-accent/20 border-border font-bold">
              <Eye className="w-4 h-4 ml-2 text-emerald-500" />
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10">
              <SelectItem value="ALL" className="font-bold cursor-pointer">
                كل الحالات
              </SelectItem>
              <SelectItem value="visible" className="font-bold cursor-pointer">
                معلن
              </SelectItem>
              <SelectItem value="secret" className="font-bold cursor-pointer">
                مخفي
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredAchievements}
        searchKey=""
        searchPlaceholder=""
        selectable
        columnLabels={{
          title: "الوسام التعليمي",
          rarity: "فئة التميز",
          difficulty: "الصعوبة",
          category: "تصنيف الإنجاز",
          xpReward: "مكافأة النقاط",
          isSecret: "حالة الظهور",
          unlocked: "عدد الحاصلين",
          criteria: "شرط الإنجاز",
          createdAt: "تاريخ الإنشاء",
          actions: "الإجراءات",
        }}
        bulkActions={[
          {
            label: `حذف المحدد (${filteredAchievements.length})`,
            icon: Trash2,
            variant: "destructive",
            onClick: (rows) => onBulkDelete(rows.map((r) => (r as Achievement).id)),
          },
        ]}
        emptyMessage={{
          title: "لا توجد أوسمة مطابقة",
          description: "جرب تعديل معايير البحث أو أضف وسامًا جديدًا.",
        }}
        actions={{ onRefresh }}
      />
    </div>
  );
}