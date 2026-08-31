"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { TableSkeleton } from "@/components/admin/ui/loading-skeleton";
import { Plus, RefreshCw, Download, Upload, Trophy, History, Award, Users, Sparkles, Activity } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { AchievementTable } from "./AchievementTable";
import { AchievementFormDialog } from "./AchievementFormDialog";
import { AchievementStats } from "./_components/achievement-stats";
import { GrantAchievementDialog } from "./_components/grant-achievement-dialog";
import {
  AchievementGrid,
  AchievementViewToggle,
} from "./_components/achievement-grid-view";
import type { Achievement } from "./_lib/types";
import {
  useAchievements,
  useCreateAchievement,
  useDeleteAchievement,
  useToggleAchievementSecret,
  useDuplicateAchievement,
  useBulkDeleteAchievements,
} from "./_hooks/use-achievements";
import { convertToCSV, downloadFile } from "./_lib/utils";

type ViewMode = "table" | "grid";

export default function AdminAchievementsPage() {
  const [view, setView] = React.useState<ViewMode>("table");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAchievement, setEditingAchievement] = React.useState<Achievement | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = React.useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });
  const [grantDialog, setGrantDialog] = React.useState<{ open: boolean; achievement: Achievement | null }>({
    open: false,
    achievement: null,
  });

  const { data: achievements = [], isLoading, refetch } = useAchievements();
  const createMutation = useCreateAchievement();
  const deleteMutation = useDeleteAchievement();
  const toggleSecretMutation = useToggleAchievementSecret();
  const duplicateMutation = useDuplicateAchievement();
  const bulkDeleteMutation = useBulkDeleteAchievements();

  const handleOpenDialog = (achievement?: Achievement) => {
    setEditingAchievement(achievement || null);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (id: string) => setDeleteDialog({ open: true, id });

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteMutation.mutateAsync(deleteDialog.id);
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleBulkDeleteRequest = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleteDialog({ open: true, ids });
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(bulkDeleteDialog.ids);
    } finally {
      setBulkDeleteDialog({ open: false, ids: [] });
    }
  };

  const handleToggleSecret = (achievement: Achievement) => {
    toggleSecretMutation.mutate({ id: achievement.id, isSecret: !achievement.isSecret });
  };

  const handleDuplicate = (achievement: Achievement) => duplicateMutation.mutate(achievement);

  const handleGrant = (achievement: Achievement) =>
    setGrantDialog({ open: true, achievement });

  const handleExportCSV = () => {
    if (achievements.length === 0) {
      toast.error("لا توجد أوسمة للتصدير");
      return;
    }
    const csv = convertToCSV(achievements, [
      { key: "key", label: "المفتاح" },
      { key: "title", label: "العنوان" },
      { key: "description", label: "الوصف" },
      { key: "icon", label: "الأيقونة" },
      { key: "rarity", label: "فئة التميز" },
      { key: "category", label: "التصنيف" },
      { key: "difficulty", label: "الصعوبة" },
      { key: "xpReward", label: "مكافأة النقاط" },
      { key: "isSecret", label: "مخفي" },
      { key: "unlockedCount", label: "عدد الحاصلين" },
      { key: "criteria", label: "الشرط" },
    ]);
    downloadFile(
      csv,
      `achievements-${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8"
    );
    toast.success(`تم تصدير ${achievements.length} وسام بصيغة CSV`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (!Array.isArray(imported)) throw new Error("تنسيق الملف غير صالح");

        let importedCount = 0;
        let failedCount = 0;
        for (const achievement of imported) {
          try {
            await createMutation.mutateAsync(achievement);
            importedCount++;
          } catch {
            failedCount++;
          }
        }

        if (importedCount > 0) {
          toast.success(`تم استيراد ${importedCount} وسام بنجاح`);
          refetch();
        }
        if (failedCount > 0) {
          toast.error(`فشل استيراد ${failedCount} وسام`);
        }
      } catch {
        toast.error("فشل في قراءة ملف الاستيراد");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="نظام الأوسمة والتقدير"
        description="إدارة الأوسمة التعليمية، تكريم الطلاب المتميزين، ومنح إنجازات التفوق للمستخدمين والطلاب."
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/achievements/history">
            <AdminButton variant="outline" icon={History}>
              سجل المنح
            </AdminButton>
          </Link>
          <AdminButton variant="outline" icon={Download} onClick={handleExportCSV}>
            تصدير CSV
          </AdminButton>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <AdminButton variant="outline" icon={Upload}>
              استيراد أوسمة
            </AdminButton>
          </div>
          <AdminButton
            variant="outline"
            icon={RefreshCw}
            onClick={() => refetch()}
            loading={isLoading}
          >
            تحديث السجلات
          </AdminButton>
          <AdminButton icon={Plus} onClick={() => handleOpenDialog()}>
            إضافة وسام جديد
          </AdminButton>
        </div>
      </PageHeader>

      <AchievementStats achievements={achievements} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="font-black text-lg uppercase tracking-widest">سجل الأوسمة</h2>
            <span className="text-xs font-bold text-muted-foreground">
              ({achievements.length} وسام)
            </span>
          </div>
          <AchievementViewToggle view={view} onViewChange={setView} />
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : view === "table" ? (
          <AchievementTable
            achievements={achievements}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteRequest}
            onDuplicate={handleDuplicate}
            onToggleSecret={handleToggleSecret}
            onBulkDelete={handleBulkDeleteRequest}
            onGrant={handleGrant}
            onRefresh={() => refetch()}
          />
        ) : (
          <AchievementGrid
            achievements={achievements}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteRequest}
            onDuplicate={handleDuplicate}
            onToggleSecret={handleToggleSecret}
            onGrant={handleGrant}
          />
        )}
      </motion.div>

      <AchievementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingAchievement={editingAchievement}
        onSuccess={() => {
          refetch();
          setDialogOpen(false);
          setEditingAchievement(null);
        }}
      />

      <GrantAchievementDialog
        open={grantDialog.open}
        onOpenChange={(open) => setGrantDialog({ open, achievement: grantDialog.achievement })}
        achievement={grantDialog.achievement}
        onSuccess={() => refetch()}
      />

      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الوسام التعليمي"
        description="هل أنت متأكد من حذف هذا الوسام من سجلات النظام؟ هذا الإجراء سيؤثر على سجلات الطلاب الحاصلين عليه."
        confirmText="تأكيد الحذف"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <AdminConfirm
        open={bulkDeleteDialog.open}
        onOpenChange={(open) => setBulkDeleteDialog({ open, ids: [] })}
        title={`حذف ${bulkDeleteDialog.ids.length} وسام`}
        description="هل أنت متأكد من حذف جميع الأوسمة المحددة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف الكل"
        variant="destructive"
        onConfirm={handleBulkDelete}
        loading={bulkDeleteMutation.isPending}
      />
    </div>
  );
}