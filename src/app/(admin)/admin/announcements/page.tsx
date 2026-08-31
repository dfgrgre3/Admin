"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { m } from "framer-motion";
import {
  Plus,
  Send,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ShieldAlert,
  CalendarClock,
  TimerReset,
  Users,
  Tag as TagIcon,
  History,
  Activity,
  GitBranch,
  FlaskConical,
  BarChart3,
  Webhook,
  Link2,
  GitCompare,
  ScrollText,
  Ban,
  FileText,
  Globe,
} from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { ANNOUNCEMENT_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { logAdminAction } from "@/lib/admin-audit";

import {
  Announcement,
  AnnouncementsResponse,
  AnnouncementsStats,
  TYPE_CONFIG,
  PRIORITY_CONFIG,
  parseSort,
  getAnnouncementStatus,
  getAnnouncementStatusLabel,
  summarizeAudience,
} from "./_components/types";
import { StatsCards } from "./_components/stats-cards";
import { FiltersBar } from "./_components/filters-bar";
import {
  AnnouncementDialog,
  AnnouncementFormValues,
} from "./_components/announcement-dialog";
import { PreviewDialog } from "./_components/preview-dialog";
import { BroadcastDialog } from "./_components/broadcast-dialog";
import { ActivityTimeline } from "./_components/activity-timeline";
import { ABTestDialog, ABTestResults } from "./_components/ab-test-dialog";
import { VersionHistory } from "./_components/version-history";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";
import { ApprovalPanel } from "./_components/approval-workflow";
import { WebhooksManager } from "./_components/webhooks-manager";
import { PinnedBanner } from "./_components/pinned-banner";
import { LinkedAnnouncements } from "./_components/linked-announcements";
import { AnnouncementsComparison } from "./_components/announcements-comparison";
import { AuditLog } from "./_components/audit-log";
import { PdfReportExport } from "./_components/pdf-report-export";
import { BlacklistManager } from "./_components/blacklist-manager";
import { IntegrationsManager } from "./_components/integrations-manager";

export default function AdminAnnouncementsPage() {
  const searchParams = useSearchParams();
  const { hasPermission } = usePermission();
  const canManageAnnouncements = hasPermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE);

  // ── حالة الفلترة والترقيم ────────────────────────────────────────────
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [typeFilter, setTypeFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [dateRangeFilter, setDateRangeFilter] = React.useState("all");
  const [audienceFilter, setAudienceFilter] = React.useState("");
  const [sort, setSort] = React.useState("createdAt_desc");
  const { sortBy, sortDir } = React.useMemo(() => parseSort(sort), [sort]);

  const hasActiveFilters =
    Boolean(deferredSearch) ||
    Boolean(typeFilter) ||
    Boolean(priorityFilter) ||
    Boolean(statusFilter) ||
    Boolean(audienceFilter) ||
    dateRangeFilter !== "all";

  React.useEffect(() => {
    setPage(1);
  }, [
    deferredSearch,
    typeFilter,
    priorityFilter,
    statusFilter,
    dateRangeFilter,
    audienceFilter,
    sort,
  ]);

  // ── الحالة: نوافذ الحوار ─────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    React.useState<Announcement | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] =
    React.useState<Announcement | null>(null);
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const [broadcastAnnouncement, setBroadcastAnnouncement] =
    React.useState<Announcement | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyAnnouncementId, setHistoryAnnouncementId] =
    React.useState<string | null>(null);
  const [versionsOpen, setVersionsOpen] = React.useState(false);
  const [versionsAnnouncementId, setVersionsAnnouncementId] =
    React.useState<string | null>(null);
  const [abTestOpen, setABTestOpen] = React.useState(false);
  const [abTestAnnouncement, setABTestAnnouncement] =
    React.useState<Announcement | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false);
  const [analyticsAnnouncementId, setAnalyticsAnnouncementId] =
    React.useState<string | null>(null);
  const [webhooksOpen, setWebhooksOpen] = React.useState(false);
  const [linksOpen, setLinksOpen] = React.useState(false);
  const [linksAnnouncementId, setLinksAnnouncementId] = React.useState<string | null>(null);
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [pdfOpen, setPdfOpen] = React.useState(false);
  const [blacklistOpen, setBlacklistOpen] = React.useState(false);
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [bulkDelete, setBulkDelete] = React.useState<{
    open: boolean;
    ids: string[];
  }>({
    open: false,
    ids: [],
  });
  const openedCreateParamRef = React.useRef(false);

  // ── البيانات: القائمة الرئيسية ───────────────────────────────────────
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "announcements",
      page,
      limit,
      deferredSearch,
      typeFilter,
      priorityFilter,
      statusFilter,
      audienceFilter,
      sortBy,
      sortDir,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortDir,
      });
      if (deferredSearch) params.set("search", deferredSearch);
      if (typeFilter) params.set("type", typeFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (audienceFilter) params.set("audience", audienceFilter);
      const response = await adminFetch(
        `${apiRoutes.admin.announcements}?${params.toString()}`
      );
      const json = await response.json();
      return (json.data || json) as AnnouncementsResponse;
    },
  });

  // ── البيانات: لقطة إحصائيات (أحدث 100 سجل) ───────────────────────────
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["admin", "announcements", "stats"],
    queryFn: async () => {
      const response = await adminFetch(
        `${apiRoutes.admin.announcements}?page=1&limit=100&sortBy=createdAt&sortDir=desc`
      );
      const json = await response.json();
      return (json.data || json) as AnnouncementsResponse;
    },
  });

  const announcements = data?.announcements || [];
  const pagination = data?.pagination;

  const stats: AnnouncementsStats = React.useMemo(() => {
    const items = statsData?.announcements || [];
    const weekAgo = Date.now() - 7 * 86400000;
    const twoWeeksAgo = Date.now() - 14 * 86400000;
    const now = Date.now();
    return {
      total: pagination?.total ?? statsData?.pagination?.total ?? 0,
      active: items.filter((a) => getAnnouncementStatus(a) === "active").length,
      inactive: items.filter((a) => getAnnouncementStatus(a) === "inactive").length,
      thisWeek: items.filter(
        (a) => new Date(a.createdAt).getTime() > weekAgo
      ).length,
      lastWeek: items.filter((a) => {
        const t = new Date(a.createdAt).getTime();
        return t > twoWeeksAgo && t <= weekAgo;
      }).length,
      scheduled: items.filter((a) => getAnnouncementStatus(a) === "scheduled")
        .length,
      expired: items.filter((a) => getAnnouncementStatus(a) === "expired").length,
      urgent: items.filter((a) => a.type === "WARNING" || a.type === "ERROR")
        .length,
      success: items.filter((a) => a.type === "SUCCESS").length,
      draft: 0,
      avgViewsPerDay: Math.round(
        items.reduce((sum, a) => sum + (a.metrics?.views || 0), 0) /
          Math.max(1, items.length)
      ),
      loadedCount: items.length,
    };
  }, [statsData, pagination]);

  const refreshAll = React.useCallback(() => {
    void refetch();
    void refetchStats();
  }, [refetch, refetchStats]);

  // ── فتح نافذة الإنشاء عبر ?create=1 ──────────────────────────────────
  React.useEffect(() => {
    if (
      !openedCreateParamRef.current &&
      canManageAnnouncements &&
      searchParams.get("create") === "1"
    ) {
      openedCreateParamRef.current = true;
      handleOpenDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageAnnouncements, searchParams]);

  const handleOpenDialog = (announcement?: Announcement) => {
    setEditingAnnouncement(announcement ?? null);
    setDialogOpen(true);
  };

  // ── الحفظ (إنشاء / تعديل) ────────────────────────────────────────────
  const handleSubmit = async (values: AnnouncementFormValues) => {
    setSubmitting(true);
    try {
      const method = editingAnnouncement ? "PATCH" : "POST";
      const body = editingAnnouncement
        ? { ...values, id: editingAnnouncement.id }
        : { ...values };

      const response = await adminFetch(apiRoutes.admin.announcements, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        toast.success(
          editingAnnouncement ? "تم تعديل الإعلان بنجاح" : "تم نشر الإعلان بنجاح"
        );

        logAdminAction(editingAnnouncement ? "UPDATE" : "CREATE", "announcement", {
          entityId:
            editingAnnouncement?.id || (result as { id?: string })?.id,
          entityName: values.title,
          details: {
            type: values.type,
            priority: values.priority,
            isActive: values.isActive,
            scheduledAt: values.scheduledAt,
            expiresAt: values.expiresAt,
            audience: values.audience,
            channels: values.channels,
          },
        });

        setDialogOpen(false);
        await requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(
          () => {}
        );
        refreshAll();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(
          (err as { error?: string })?.error || "فشل في حفظ الإعلان"
        );
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  // ── الحذف (مفرد) ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const announcementToDelete = announcements.find(
        (a) => a.id === deleteDialog.id
      );
      const response = await adminFetch(apiRoutes.admin.announcements, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteDialog.id }),
      });

      if (response.ok) {
        toast.success("تم حذف الإعلان بنجاح");
        logAdminAction("DELETE", "announcement", {
          entityId: deleteDialog.id,
          entityName: announcementToDelete?.title,
        });
        await requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(
          () => {}
        );
        refreshAll();
      } else {
        toast.error("فشل في حذف الإعلان");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  // ── الحذف (جماعي) ────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (bulkDelete.ids.length === 0) return;
    const toastId = toast.loading(`جاري حذف ${bulkDelete.ids.length} إعلان...`);
    let success = 0;
    for (const id of bulkDelete.ids) {
      try {
        const response = await adminFetch(apiRoutes.admin.announcements, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (response.ok) success += 1;
      } catch {
        // تجاهل الأخطاء الفردية لمواصلة الحذف
      }
    }
    if (success > 0) {
      toast.success(`تم حذف ${success} إعلان بنجاح`, { id: toastId });
      logAdminAction("DELETE", "announcement_bulk", {
        details: { ids: bulkDelete.ids, deleted: success },
      });
      await requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(
        () => {}
      );
      refreshAll();
    } else {
      toast.error("فشل حذف الإعلانات المحددة", { id: toastId });
    }
    setBulkDelete({ open: false, ids: [] });
  };

  // ── نشر / إيقاف نشر (مفرد) ──────────────────────────────────────────
  const handleToggleActive = async (announcement: Announcement) => {
    const next = !announcement.isActive;
    const toastId = toast.loading(
      next ? "جاري نشر الإعلان..." : "جاري إخفاء الإعلان..."
    );
    try {
      const response = await adminFetch(apiRoutes.admin.announcements, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: announcement.id, isActive: next }),
      });
      if (response.ok) {
        toast.success(
          next ? "تم نشر الإعلان للمستخدمين" : "تم إخفاء الإعلان",
          { id: toastId }
        );
        logAdminAction("UPDATE", "announcement", {
          entityId: announcement.id,
          entityName: announcement.title,
          details: { isActive: next },
        });
        await requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(
          () => {}
        );
        refreshAll();
      } else {
        toast.error("فشل تحديث حالة الإعلان", { id: toastId });
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم", { id: toastId });
    }
  };

  // ── نشر / إيقاف نشر (جماعي) ─────────────────────────────────────────
  const handleBulkSetActive = async (
    selected: Announcement[],
    active: boolean
  ) => {
    const toastId = toast.loading("جاري تحديث الحالة...");
    let success = 0;
    for (const item of selected) {
      try {
        const response = await adminFetch(apiRoutes.admin.announcements, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, isActive: active }),
        });
        if (response.ok) success += 1;
      } catch {
        // تجاهل
      }
    }
    if (success > 0) {
      toast.success(`تم تحديث حالة ${success} إعلان`, { id: toastId });
      logAdminAction("UPDATE", "announcement_bulk", {
        details: { count: success, isActive: active },
      });
      await requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(
        () => {}
      );
      refreshAll();
    } else {
      toast.error("فشل تحديث حالة الإعلانات", { id: toastId });
    }
  };

  // ── نسخ إعلان ────────────────────────────────────────────────────────
  const handleDuplicate = async (announcement: Announcement) => {
    const toastId = toast.loading("جاري نسخ الإعلان...");
    try {
      const response = await adminFetch(apiRoutes.admin.announcements, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${announcement.title} (نسخة)`,
          content: announcement.content,
          type: announcement.type,
          priority: announcement.priority,
          isActive: false,
        }),
      });
      if (response.ok) {
        toast.success("تم نسخ الإعلان كمسودة", { id: toastId });
        logAdminAction("CREATE", "announcement", {
          entityName: `${announcement.title} (نسخة)`,
          details: { duplicatedFrom: announcement.id },
        });
        await requestPublicCacheRevalidation(ANNOUNCEMENT_PUBLIC_CACHE_PATHS).catch(
          () => {}
        );
        refreshAll();
      } else {
        toast.error("فشل نسخ الإعلان", { id: toastId });
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم", { id: toastId });
    }
  };

  // ── فتح حوار البث ────────────────────────────────────────────────────
  const handleOpenBroadcast = (announcement: Announcement) => {
    setBroadcastAnnouncement(announcement);
    setBroadcastOpen(true);
  };

  // ── فتح حوار السجل ───────────────────────────────────────────────────
  const handleOpenHistory = (announcement: Announcement) => {
    setHistoryAnnouncementId(announcement.id);
    setHistoryOpen(true);
  };

  // ── فتح حوار الإصدارات ─────────────────────────────────────────────
  const handleOpenVersions = (announcement: Announcement) => {
    setVersionsAnnouncementId(announcement.id);
    setVersionsOpen(true);
  };

  // ── فتح حوار A/B Test ────────────────────────────────────────────────
  const handleOpenABTest = (announcement: Announcement) => {
    setABTestAnnouncement(announcement);
    setABTestOpen(true);
  };

  // ── فتح حوار التحليلات ───────────────────────────────────────────────
  const handleOpenAnalytics = (announcement: Announcement) => {
    setAnalyticsAnnouncementId(announcement.id);
    setAnalyticsOpen(true);
  };

  // ── تصدير CSV ────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (announcements.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const headers = [
      "العنوان",
      "النوع",
      "الأولوية",
      "الحالة",
      "تاريخ النشر",
      "الجمهور",
      "المحتوى",
    ];
    const rows = announcements.map((a) => [
      a.title,
      TYPE_CONFIG[a.type]?.label || a.type,
      PRIORITY_CONFIG[a.priority]?.label || a.priority,
      getAnnouncementStatusLabel(getAnnouncementStatus(a)),
      formatDateTime(a.createdAt),
      summarizeAudience(a.audience, { grades: a.audienceGrades }),
      a.content.replace(/<[^>]*>/g, "").replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `announcements-${formatDate(new Date()).replace(/\//g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الإعلانات الحالية بنجاح");
  };

  // ── أعمدة الجدول ─────────────────────────────────────────────────────
  const columns: ColumnDef<Announcement>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: "الإعلان",
        enableSorting: false,
        cell: ({ row }) => {
          const announcement = row.original;
          const config = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.INFO;
          const Icon = config.icon;
          const status = getAnnouncementStatus(announcement);
          return (
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border shadow-sm transition-transform hover:scale-105",
                  config.bgClass,
                  config.borderClass
                )}
              >
                <Icon className={cn("h-6 w-6", config.textClass)} />
              </div>
              <div className="max-w-[320px]">
                <p className="font-black text-sm tracking-tight">
                  {announcement.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[10px] font-bold uppercase italic opacity-50 text-muted-foreground">
                  {announcement.content.replace(/<[^>]*>/g, "") || "بدون محتوى"}
                </p>
                {status !== "active" && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-black text-muted-foreground">
                    {status === "scheduled" && (
                      <CalendarClock className="h-2.5 w-2.5" />
                    )}
                    {status === "expired" && (
                      <TimerReset className="h-2.5 w-2.5" />
                    )}
                    {getAnnouncementStatusLabel(status)}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "النوع",
        enableSorting: false,
        cell: ({ row }) => {
          const config = TYPE_CONFIG[row.original.type] || TYPE_CONFIG.INFO;
          return (
            <Badge
              variant="outline"
              className={cn(
                "font-black text-[10px] uppercase tracking-widest rounded-lg border-2 px-3 py-1 bg-white/5",
                config.textClass,
                config.borderClass
              )}
            >
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "الأولوية",
        enableSorting: false,
        cell: ({ row }) => {
          const config =
            PRIORITY_CONFIG[row.original.priority] || PRIORITY_CONFIG.MEDIUM;
          return (
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", config.dotClass)} />
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  config.badgeClass.split(" ")[0]
                )}
              >
                {config.label}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "الحالة",
        enableSorting: false,
        cell: ({ row }) => {
          const status = getAnnouncementStatus(row.original);
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  status === "active"
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : status === "scheduled"
                    ? "bg-blue-500"
                    : status === "expired"
                    ? "bg-amber-500"
                    : "bg-red-500/40"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  status === "active"
                    ? "text-emerald-500"
                    : status === "scheduled"
                    ? "text-blue-500"
                    : status === "expired"
                    ? "text-amber-500"
                    : "text-muted-foreground"
                )}
              >
                {getAnnouncementStatusLabel(status)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "audience",
        header: "الجمهور",
        enableSorting: false,
        cell: ({ row }) => {
          const a = row.original;
          const summary = summarizeAudience(a.audience, {
            grades: a.audienceGrades,
          });
          return (
            <div className="flex items-center gap-2 max-w-[180px]">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-bold truncate">{summary}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "تاريخ النشر",
        enableSorting: false,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex flex-col">
              <span className="text-xs font-black">{formatDate(date)}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                {date.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "author",
        header: "الكاتب",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
              {(row.original.author?.name || "النظام").slice(0, 2)}
            </div>
            <span className="text-xs font-bold text-muted-foreground max-w-[90px] truncate">
              {row.original.author?.name || "النظام"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        enableSorting: false,
        cell: ({ row }) => {
          const announcement = row.original;
          return (
            <RowActions
              row={announcement}
              onView={(a) => {
                setPreviewAnnouncement(a);
                setPreviewOpen(true);
              }}
              onEdit={canManageAnnouncements ? handleOpenDialog : undefined}
              onDelete={
                canManageAnnouncements
                  ? (a) => setDeleteDialog({ open: true, id: a.id })
                  : undefined
              }
              extraActions={[
                {
                  icon: Copy,
                  label: "نسخ الإعلان",
                  onClick: (a) => handleDuplicate(a),
                },
                {
                  icon: announcement.isActive ? EyeOff : Eye,
                  label: announcement.isActive ? "إيقاف النشر" : "إعادة النشر",
                  onClick: (a) => handleToggleActive(a),
                },
                {
                  icon: Send,
                  label: "إعادة بث الإعلان",
                  onClick: (a) => handleOpenBroadcast(a),
                },
                {
                  icon: History,
                  label: "سجل النشاط",
                  onClick: (a) => handleOpenHistory(a),
                },
                {
                  icon: GitBranch,
                  label: "سجل الإصدارات",
                  onClick: (a) => handleOpenVersions(a),
                },
                {
                  icon: FlaskConical,
                  label: "اختبار A/B",
                  onClick: (a) => handleOpenABTest(a),
                },
                {
                  icon: BarChart3,
                  label: "التحليلات",
                  onClick: (a) => handleOpenAnalytics(a),
                },
                {
                  icon: Link2,
                  label: "الإعلانات المرتبطة",
                  onClick: (a) => {
                    setLinksAnnouncementId(a.id);
                    setLinksOpen(true);
                  },
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManageAnnouncements]
  );

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setAudienceFilter("");
    setDateRangeFilter("all");
    setSort("createdAt_desc");
  };

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title="إدارة الإعلانات والتواصل"
        description="نظام متكامل لإنشاء، جدولة، استهداف، بث، وتتبع تفاعل الإعلانات عبر جميع القنوات."
        badge={pagination ? `${pagination.total} إعلان` : undefined}
        meta={
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            الإعلانات المخفية لا تظهر للمستخدمين وتبقى محفوظة في السجلات
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {canManageAnnouncements && (
            <AdminButton
              type="button"
              variant="outline"
              icon={Webhook}
              size="lg"
              rounded="xl"
              onClick={() => setWebhooksOpen(true)}
            >
              Webhooks
            </AdminButton>
          )}
          {canManageAnnouncements && (
            <AdminButton
              type="button"
              variant="outline"
              icon={Globe}
              size="lg"
              rounded="xl"
              onClick={() => setIntegrationsOpen(true)}
            >
              التكاملات
            </AdminButton>
          )}
          {canManageAnnouncements && (
            <AdminButton
              type="button"
              variant="outline"
              icon={ScrollText}
              size="lg"
              rounded="xl"
              onClick={() => setAuditOpen(true)}
            >
              سجل المراجعة
            </AdminButton>
          )}
          {canManageAnnouncements && (
            <AdminButton
              type="button"
              variant="outline"
              icon={Ban}
              size="lg"
              rounded="xl"
              onClick={() => setBlacklistOpen(true)}
            >
              القائمة السوداء
            </AdminButton>
          )}
          {canManageAnnouncements && (
            <AdminButton
              type="button"
              variant="outline"
              icon={FileText}
              size="lg"
              rounded="xl"
              onClick={() => setPdfOpen(true)}
            >
              تصدير PDF
            </AdminButton>
          )}
          {canManageAnnouncements && (
            <AdminButton
              icon={Plus}
              size="lg"
              rounded="xl"
              onClick={() => handleOpenDialog()}
            >
              إضافة إعلان جديد
            </AdminButton>
          )}
        </div>
      </PageHeader>

      <StatsCards stats={stats} />

      <PinnedBanner />

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-glass rounded-[2rem] border border-white/10 p-4 sm:p-6 shadow-2xl"
      >
        <div className="mb-6">
          <FiltersBar
            search={search}
            onSearchChange={setSearch}
            type={typeFilter}
            onTypeChange={setTypeFilter}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            sort={sort}
            onSortChange={setSort}
            dateRange={dateRangeFilter}
            onDateRangeChange={setDateRangeFilter}
            audience={audienceFilter}
            onAudienceChange={setAudienceFilter}
            resultCount={announcements.length}
            hasActiveFilters={hasActiveFilters}
            onReset={handleResetFilters}
            loading={isFetching}
          />
        </div>

        <AdminDataTable
          columns={columns}
          data={announcements}
          loading={isLoading}
          serverSide
          totalRows={pagination?.total || 0}
          pageCount={pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          selectable={canManageAnnouncements}
          actions={{ onRefresh: refreshAll, onExport: handleExportCSV }}
          columnLabels={{
            title: "الإعلان",
            type: "النوع",
            priority: "الأولوية",
            isActive: "الحالة",
            audience: "الجمهور",
            createdAt: "تاريخ النشر",
            author: "الكاتب",
            actions: "الإجراءات",
          }}
          bulkActions={
            canManageAnnouncements
              ? [
                  {
                    label: "نشر",
                    icon: Eye,
                    onClick: (rows) => handleBulkSetActive(rows, true),
                  },
                  {
                    label: "إيقاف النشر",
                    icon: EyeOff,
                    onClick: (rows) => handleBulkSetActive(rows, false),
                  },
                  {
                    label: "حذف",
                    icon: Trash2,
                    variant: "destructive",
                    onClick: (rows) =>
                      setBulkDelete({ open: true, ids: rows.map((r) => r.id) }),
                  },
                ]
              : undefined
          }
          emptyMessage={{
            title: hasActiveFilters ? "لا توجد نتائج مطابقة" : "لا توجد إعلانات بعد",
            description: hasActiveFilters
              ? "جرّب تعديل الفلاتر أو مسح البحث"
              : "ابدأ بنشر أول إعلان لمستخدمي المنصة",
          }}
        />
      </m.div>

      {/* نافذة الإنشاء / التعديل */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        announcement={editingAnnouncement}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {/* نافذة المعاينة */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        announcement={previewAnnouncement}
      />

      {/* نافذة إعادة البث */}
      <BroadcastDialog
        open={broadcastOpen}
        onOpenChange={setBroadcastOpen}
        announcement={broadcastAnnouncement}
        onComplete={refreshAll}
      />

      {/* نافذة سجل النشاط */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-xl bg-card/90 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <Activity className="h-6 w-6 text-violet-500" />
                سجل النشاط
              </DialogTitle>
            </DialogHeader>
            {historyAnnouncementId && (
              <ActivityTimeline announcementId={historyAnnouncementId} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* تأكيد الحذف المفرد */}
      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الإعلان نهائياً؟"
        description="هل أنت متأكد من حذف هذا الإعلان من جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="تأكيد الحذف"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* تأكيد الحذف الجماعي */}
      <AdminConfirm
        open={bulkDelete.open}
        onOpenChange={(open) => setBulkDelete({ open, ids: [] })}
        title={`حذف ${bulkDelete.ids.length} إعلان؟`}
        description="سيتم حذف جميع الإعلانات المحددة نهائياً. لا يمكن التراجع عن هذا الإجراء."
        confirmText="تأكيد الحذف الجماعي"
        variant="destructive"
        onConfirm={handleBulkDelete}
      />

      {/* سجل الإصدارات */}
      <VersionHistory
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
        announcementId={versionsAnnouncementId || ""}
        onRestore={refreshAll}
      />

      {/* حوار A/B Test */}
      <ABTestDialog
        open={abTestOpen}
        onOpenChange={setABTestOpen}
        announcement={abTestAnnouncement}
        onComplete={refreshAll}
      />

      {/* حوار التحليلات */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-5xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                التحليلات والإحصاءات
              </DialogTitle>
            </DialogHeader>
            <AnalyticsDashboard announcementId={analyticsAnnouncementId || undefined} />
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار Webhooks */}
      <Dialog open={webhooksOpen} onOpenChange={setWebhooksOpen}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Webhook className="h-6 w-6 text-violet-500" />
                إدارة Webhooks
              </DialogTitle>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                اربط أنظمتك الخارجية بأحداث الإعلانات - 12 حدث متاح
              </p>
            </DialogHeader>
            <WebhooksManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار الإعلانات المرتبطة */}
      <Dialog open={linksOpen} onOpenChange={setLinksOpen}>
        <DialogContent className="max-w-3xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Link2 className="h-6 w-6 text-blue-500" />
                الإعلانات المرتبطة
              </DialogTitle>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                اربط هذا الإعلان بإعلانات أخرى بأنواع مختلفة من العلاقات
              </p>
            </DialogHeader>
            {linksAnnouncementId && (
              <LinkedAnnouncements announcementId={linksAnnouncementId} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار سجل المراجعة */}
      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-5xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <ScrollText className="h-6 w-6 text-amber-500" />
                سجل المراجعة المتقدم
              </DialogTitle>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                كل التغييرات على الإعلانات - قابل للتصفية والتصدير
              </p>
            </DialogHeader>
            <AuditLog />
          </div>
        </DialogContent>
      </Dialog>

      {/* مقارنة الإعلانات - Floating Bar */}
      <AnnouncementsComparison />

      {/* حوار تصدير PDF */}
      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-w-3xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <FileText className="h-6 w-6 text-rose-500" />
                تصدير التقارير PDF
              </DialogTitle>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                أنشئ تقارير احترافية قابلة للطباعة بـ 4 أنواع
              </p>
            </DialogHeader>
            <PdfReportExport />
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار القائمة السوداء */}
      <Dialog open={blacklistOpen} onOpenChange={setBlacklistOpen}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Ban className="h-6 w-6 text-red-500" />
                إدارة القائمة السوداء
              </DialogTitle>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                استثناء مستخدمين/أدوار/نطاقات من استقبال الإعلانات
              </p>
            </DialogHeader>
            <BlacklistManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار التكاملات */}
      <Dialog open={integrationsOpen} onOpenChange={setIntegrationsOpen}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[90vh]">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <Globe className="h-6 w-6 text-indigo-500" />
                إدارة التكاملات
              </DialogTitle>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                أرسل الإعلانات تلقائياً إلى Slack / Discord / Telegram / Teams
              </p>
            </DialogHeader>
            <IntegrationsManager />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}