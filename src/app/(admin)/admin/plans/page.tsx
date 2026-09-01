"use client";

import * as React from "react";
import { Download, Package, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import type { SubscriptionPlan } from "./_lib/types";
import {
  useBulkDeletePlans,
  useBulkTogglePlans,
  usePlans,
  useTogglePlan,
} from "./_hooks/use-plans";
import { usePlanFilters } from "./_hooks/use-plan-filters";
import { computePlanStats, convertPlansToCSV, downloadFile } from "./_lib/utils";
import { PlansStatsCards } from "./_components/plans-stats-cards";
import { PlansTable } from "./_components/plans-table";
import { PlanFormDialog } from "./_components/plan-form-dialog";
import { PlanDetailsDialog } from "./_components/plan-details-dialog";
import { PlanDuplicateDialog } from "./_components/plan-duplicate-dialog";
import { PlanDeleteDialog } from "./_components/plan-delete-dialog";

export default function AdminPlansPage() {
  const { data: plans = [], isLoading, refetch } = usePlans();
  const filters = usePlanFilters(plans);
  const toggleMutation = useTogglePlan();
  const bulkToggleMutation = useBulkTogglePlans();
  const bulkDeleteMutation = useBulkDeletePlans();

  // حالة الحوارات
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<SubscriptionPlan | null>(null);
  const [detailsPlan, setDetailsPlan] = React.useState<SubscriptionPlan | null>(null);
  const [duplicatePlan, setDuplicatePlan] = React.useState<SubscriptionPlan | null>(null);
  const [deletePlan, setDeletePlan] = React.useState<SubscriptionPlan | null>(null);
  const [bulkDeletePlans, setBulkDeletePlans] = React.useState<SubscriptionPlan[]>([]);

  const stats = React.useMemo(() => computePlanStats(plans), [plans]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleExport = () => {
    if (plans.length === 0) {
      toast.error("لا توجد خطط للتصدير");
      return;
    }
    downloadFile(
      convertPlansToCSV(plans),
      `plans-${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv;charset=utf-8"
    );
    toast.success(`تم تصدير ${plans.length} خطة بنجاح`);
  };

  const handleBulkActivate = (selected: SubscriptionPlan[]) =>
    bulkToggleMutation.mutate({ ids: selected.map((p) => p.id), isActive: true });

  const handleBulkDeactivate = (selected: SubscriptionPlan[]) =>
    bulkToggleMutation.mutate({ ids: selected.map((p) => p.id), isActive: false });

  const handleBulkDelete = (selected: SubscriptionPlan[]) => setBulkDeletePlans(selected);

  const confirmBulkDelete = () => {
    if (bulkDeletePlans.length === 0) return;
    bulkDeleteMutation.mutate(bulkDeletePlans.map((p) => p.id), {
      onSuccess: () => setBulkDeletePlans([]),
    });
  };

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة الخطط والاشتراكات 📦"
        description="إنشاء وإدارة خطط الاشتراك، تحديد الأسعار والمدة والمميزات لكل خطة، وربط الخطط المتشابهة في مجموعة فوترة واحدة."
        icon={Package}
        accentColor="bg-orange-500/10 text-orange-500"
      >
        <AdminButton variant="outline" icon={Download} onClick={handleExport}>
          تصدير CSV
        </AdminButton>
        <AdminButton
          variant="outline"
          icon={RefreshCw}
          onClick={() => refetch()}
          loading={isLoading}
        >
          تحديث
        </AdminButton>
        <AdminButton icon={Plus} onClick={handleOpenCreate}>
          إنشاء خطة جديدة
        </AdminButton>
      </PageHeader>

      <PlansStatsCards stats={stats} />

      <PlansTable
        plans={filters.filteredPlans}
        isLoading={isLoading}
        search={filters.search}
        onSearchChange={filters.setSearch}
        status={filters.status}
        onStatusChange={filters.setStatus}
        interval={filters.interval}
        onIntervalChange={filters.setInterval}
        onRefresh={() => refetch()}
        onExport={handleExport}
        onView={setDetailsPlan}
        onEdit={handleOpenEdit}
        onDelete={setDeletePlan}
        onDuplicate={setDuplicatePlan}
        onToggle={(plan) =>
          toggleMutation.mutate({ id: plan.id, isActive: !plan.isActive })
        }
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
      />

      {/* الحوارات */}
      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingPlan={editingPlan}
        plans={plans}
      />

      <PlanDetailsDialog
        open={Boolean(detailsPlan)}
        onOpenChange={(open) => !open && setDetailsPlan(null)}
        plan={detailsPlan}
        plans={plans}
      />

      <PlanDuplicateDialog
        open={Boolean(duplicatePlan)}
        onOpenChange={(open) => !open && setDuplicatePlan(null)}
        plan={duplicatePlan}
        plans={plans}
      />

      <PlanDeleteDialog
        open={Boolean(deletePlan)}
        onOpenChange={(open) => !open && setDeletePlan(null)}
        plan={deletePlan}
      />

      {/* تأكيد الحذف الجماعي */}
      <ConfirmDialog
        open={bulkDeletePlans.length > 0}
        onOpenChange={(open) => !open && setBulkDeletePlans([])}
        title={`حذف ${bulkDeletePlans.length} خطة`}
        description="هل أنت متأكد من حذف جميع الخطط المحددة؟ الخطط المستخدمة من قبل مشتركين سيتم تعطيلها بدلاً من حذفها."
        confirmText="حذف الكل"
        cancelText="إلغاء"
        variant="destructive"
        loading={bulkDeleteMutation.isPending}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
