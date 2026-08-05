"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { RoleBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  Download,
  Shield,
  Users,
  Zap,
  Search,
  Send,
  LogIn,
  Upload,
  AlertTriangle,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  BookOpen,
  Package,
  Award,
  Monitor,
  Key,
  Phone,
  Globe,
  UserCheck,
  UserX,
  RotateCcw,
  Activity,
  FileText,
  Bell,
  LifeBuoy,
  FilterX,
  Calendar,
  Wallet,
  GraduationCap,
  UserCog,
  BadgeCheck,
  CircleOff,
  Sparkles,
  ShieldCheck,
  ShieldX,
  Loader2,
  FileJson,
} from "lucide-react";
import { useExport, ExportColumn } from '@/lib/export-utils';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import dynamic from "next/dynamic";
import { CsvImportDialog } from "@/components/admin/ui/csv-import-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MessageModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});
import { Checkbox } from "@/components/ui/checkbox";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi, type AdminUserListItem, type AdminUsersPage as AdminUsersPageData } from "@/lib/api/admin-users-api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, UserStatus } from "@/types/enums";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserActionBlockReason, canAssignRole } from "@/lib/user-action-guards";
import { useAdaptiveDebounce } from "@/hooks/use-adaptive-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logger } from '@/lib/logger';
import { AnalyticsSection } from "./_components/analytics-section";
import { LazySection } from "@/components/admin/ui/lazy-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { adminAudit } from "@/lib/admin-audit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const ROLE_TABS: Array<{ value: "all" | UserRole; label: string }> = [
  { value: "all", label: "كل المستخدمين" },
  { value: UserRole.STUDENT, label: "الطلاب" },
  { value: UserRole.PARENT, label: "أولياء الأمور" },
  { value: UserRole.TEACHER, label: "المعلمون" },
  { value: UserRole.MODERATOR, label: "المشرفون" },
  { value: UserRole.ADMIN, label: "المدراء" },
  { value: UserRole.SUPPORT, label: "الدعم الفني" },
  { value: UserRole.SUPER_ADMIN, label: "المدراء العامون" },
];

const STATUS_TABS: Array<{ value: "all" | UserStatus; label: string; activeClass?: string }> = [
  { value: "all", label: "كل الحالات" },
  { value: UserStatus.ACTIVE, label: "نشط", activeClass: "data-[state=active]:bg-green-500 data-[state=active]:text-white" },
  { value: UserStatus.INACTIVE, label: "غير نشط", activeClass: "data-[state=active]:bg-slate-500 data-[state=active]:text-white" },
  { value: UserStatus.SUSPENDED, label: "موقوف", activeClass: "data-[state=active]:bg-yellow-500 data-[state=active]:text-white" },
  { value: UserStatus.BANNED, label: "محظور", activeClass: "data-[state=active]:bg-red-500 data-[state=active]:text-white" },
  { value: UserStatus.DELETED, label: "محذوف", activeClass: "data-[state=active]:bg-muted data-[state=active]:text-muted-foreground" },
  { value: UserStatus.PENDING_VERIFICATION, label: "قيد التحقق", activeClass: "data-[state=active]:bg-blue-500 data-[state=active]:text-white" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
  { value: "other", label: "آخر" },
];

const VERIFIED_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "verified", label: "موثق" },
  { value: "unverified", label: "غير موثق" },
];

const SUBSCRIPTION_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "ACTIVE", label: "اشتراك نشط" },
  { value: "EXPIRED", label: "منتهي" },
  { value: "CANCELLED", label: "ملغي" },
  { value: "NONE", label: "بدون اشتراك" },
];

const ONLINE_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "online", label: "متصل الآن" },
  { value: "offline", label: "غير متصل" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = usePermission();
  const { subscribe, isConnected } = useAdminRealtime();

  // ── Permission flags (UI only — backend re-verifies on every request) ──
  const canViewUsers = hasPermission(PERMISSIONS.USERS_VIEW);
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);
  const canCreateUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_CREATE);
  const canUpdateUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_DELETE);
  const canRestoreUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_RESTORE);
  const canSuspendUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_SUSPEND);
  const canExportUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_EXPORT);
  const canImportUsers = canManageUsers || hasPermission(PERMISSIONS.USERS_IMPORT);
  const canAssignRoles = canManageUsers || hasPermission(PERMISSIONS.USERS_ASSIGN_ROLES);
  const canAssignPermissions = canManageUsers || hasPermission(PERMISSIONS.USERS_ASSIGN_PERMISSIONS);
  const canViewSessions = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_SESSIONS);
  const canViewActivity = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_ACTIVITY);
  const canManagePassword = canManageUsers || hasPermission(PERMISSIONS.USERS_MANAGE_PASSWORD);
  const canManageVerification = canManageUsers || hasPermission(PERMISSIONS.USERS_MANAGE_VERIFICATION);
  const canSendNotifications = canManageUsers || hasPermission(PERMISSIONS.USERS_SEND_NOTIFICATIONS);
  const canTerminateSessions = canManageUsers || hasPermission(PERMISSIONS.USERS_TERMINATE_SESSIONS);
  const canViewFinancial = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_FINANCIAL);
  const canViewOrders = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_ORDERS);
  const canViewCertificates = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_CERTIFICATES);
  const canViewSupport = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_SUPPORT);
  const canViewAudit = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_AUDIT_LOG);

  // ── State: pagination + filters ──
  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [role, setRole] = React.useState<"all" | UserRole>(() => (searchParams.get("role") as UserRole) || "all");
  const [status, setStatus] = React.useState<"all" | UserStatus>(() => (searchParams.get("status") as UserStatus) || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("sortOrder") || "desc");

  // ── Advanced filters ──
  const [country, setCountry] = React.useState(() => searchParams.get("country") || "");
  const [city, setCity] = React.useState(() => searchParams.get("city") || "");
  const [gender, setGender] = React.useState(() => searchParams.get("gender") || "all");
  const [verified, setVerified] = React.useState(() => searchParams.get("verified") || "all");
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(() => searchParams.get("subscription") || "all");
  const [online, setOnline] = React.useState(() => searchParams.get("online") || "all");
  const [createdFrom, setCreatedFrom] = React.useState(() => searchParams.get("createdFrom") || "");
  const [createdTo, setCreatedTo] = React.useState(() => searchParams.get("createdTo") || "");
  const [walletMin, setWalletMin] = React.useState(() => searchParams.get("walletMin") || "");
  const [walletMax, setWalletMax] = React.useState(() => searchParams.get("walletMax") || "");
  const [includeDeleted, setIncludeDeleted] = React.useState(() => searchParams.get("includeDeleted") === "true");

  // ── Dialogs state ──
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  const [restoreDialog, setRestoreDialog] = React.useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  const [suspendDialog, setSuspendDialog] = React.useState<{ open: boolean; ids: string[]; reason?: string }>({ open: false, ids: [] });
  const [activateDialog, setActivateDialog] = React.useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  const [messageDialog, setMessageDialog] = React.useState<{ open: boolean; users: AdminUserListItem[] }>({ open: false, users: [] });
  const [passwordDialog, setPasswordDialog] = React.useState<{ open: boolean; user: AdminUserListItem | null; password?: string }>({ open: false, user: null });
  const [verifyDialog, setVerifyDialog] = React.useState<{ open: boolean; user: AdminUserListItem | null; type: "email" | "phone" }>({ open: false, user: null, type: "email" });
  const [roleDialog, setRoleDialog] = React.useState<{ open: boolean; user: AdminUserListItem | null; role?: UserRole }>({ open: false, user: null });
  const [bulkRoleDialog, setBulkRoleDialog] = React.useState<{ open: boolean; ids: string[]; role?: UserRole }>({ open: false, ids: [] });
  const [impersonateDialog, setImpersonateDialog] = React.useState<{ open: boolean; user: AdminUserListItem | null }>({ open: false, user: null });
  const [impersonating, setImpersonating] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [exportingJson, setExportingJson] = React.useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const { debouncedCallback: updateQuerySearch } = useAdaptiveDebounce(
    (value: unknown) => setQuerySearch(String(value)),
    { minDelay: 300, maxDelay: 500, initialDelay: 350 },
  );
  const { exportToCSV, exportToJSON } = useExport();

  const exportAbortControllerRef = React.useRef<AbortController | null>(null);
  const queryAbortControllerRef = React.useRef<AbortController | null>(null);
  const allSelectedIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    queryAbortControllerRef.current = new AbortController();
    return () => {
      if (exportAbortControllerRef.current) {
        exportAbortControllerRef.current.abort();
        exportAbortControllerRef.current = null;
      }
      if (queryAbortControllerRef.current) {
        queryAbortControllerRef.current.abort();
        queryAbortControllerRef.current = null;
      }
    };
  }, []);

  // ── URL sync for all filters ──
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search: querySearch,
      role,
      status,
      sortBy,
      sortOrder,
      country,
      city,
      gender,
      verified,
      subscription: subscriptionStatus,
      online,
      createdFrom,
      createdTo,
      walletMin,
      walletMax,
      includeDeleted: String(includeDeleted),
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "false") params.set(key, value);
    });
    const url = `/admin/users?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [page, limit, querySearch, role, status, sortBy, sortOrder, country, city, gender, verified, subscriptionStatus, online, createdFrom, createdTo, walletMin, walletMax, includeDeleted]);

  const clearAllFilters = () => {
    setSearch("");
    setQuerySearch("");
    setRole("all");
    setStatus("all");
    setCountry("");
    setCity("");
    setGender("all");
    setVerified("all");
    setSubscriptionStatus("all");
    setOnline("all");
    setCreatedFrom("");
    setCreatedTo("");
    setWalletMin("");
    setWalletMax("");
    setIncludeDeleted(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    role !== "all" || status !== "all" || search || country || city ||
    gender !== "all" || verified !== "all" || subscriptionStatus !== "all" ||
    online !== "all" || createdFrom || createdTo || walletMin || walletMax || includeDeleted
  );

  // ── Fetch users (server-side pagination/search/filter/sort) ──
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder, country, city, gender, verified, subscriptionStatus, online, createdFrom, createdTo, walletMin, walletMax, includeDeleted],
    queryFn: async () => {
      const signal = queryAbortControllerRef.current?.signal;
      return adminUsersApi.list({
        page,
        limit,
        search: querySearch,
        role: role === "all" ? undefined : role as UserRole,
        status: (status === "all" || status === UserStatus.INACTIVE) ? undefined : status as UserStatus,
        sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status" | "walletBalance" | "coursesCount" | "ordersCount",
        sortOrder: sortOrder as "asc" | "desc",
        country: country || undefined,
        city: city || undefined,
        gender: gender === "all" ? undefined : gender,
        emailVerified: verified === "all" ? undefined : verified === "verified",
        subscriptionStatus: subscriptionStatus === "all" ? undefined : subscriptionStatus,
        isOnline: online === "all" ? undefined : online === "online",
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        walletMin: walletMin ? Number(walletMin) : undefined,
        walletMax: walletMax ? Number(walletMax) : undefined,
        includeDeleted: includeDeleted || undefined,
      }, { signal });
    },
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 30000,
    enabled: canViewUsers,
  });

  // ── Real-Time: user events → refresh data ──
  React.useEffect(() => {
    if (!canViewUsers) return;
    const unsubscribers: Array<() => void> = [];

    const events: Array<Parameters<typeof subscribe>[0]> = [
      'user_registered',
      'user_login',
      'user_logout',
      'user_suspended',
      'user_activated',
      'user_deleted',
      'user_restored',
      'user_status_changed',
      'user_online',
      'user_offline',
      'user_verified',
      'user_role_changed',
      'user_permissions_changed',
    ];

    events.forEach((eventType) => {
      unsubscribers.push(
        subscribe(eventType, (event) => {
          // Optimistically update the cached row when the event carries an id.
          const userId = event.data?.userId || event.data?.id;
          if (userId) {
            queryClient.setQueryData<AdminUsersPageData>(
              ["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder, country, city, gender, verified, subscriptionStatus, online, createdFrom, createdTo, walletMin, walletMax, includeDeleted],
              (old) => old ? {
                ...old,
                users: old.users.map((u) => {
                  if (u.id !== userId) return u;
                  const updated: AdminUserListItem = { ...u };
                  if (eventType === 'user_online') updated.isOnline = true;
                  if (eventType === 'user_offline') updated.isOnline = false;
                  if (eventType === 'user_status_changed' && event.data?.status) updated.status = event.data.status as UserStatus;
                  if (eventType === 'user_role_changed' && event.data?.role) updated.role = event.data.role as UserRole;
                  if (eventType === 'user_verified') { updated.emailVerified = true; updated.phoneVerified = true; }
                  return updated;
                }),
              } : old
            );
          }
          // Always refetch the summary/counts to keep stats cards fresh.
          void refetch();
        })
      );
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, canViewUsers, queryClient, page, limit, querySearch, role, status, sortBy, sortOrder, country, city, gender, verified, subscriptionStatus, online, createdFrom, createdTo, walletMin, walletMax, includeDeleted]);

  // ── Shared helpers ──
  const refreshWithOptimistic = async (ids: string[], changes: Partial<AdminUserListItem>) => {
    queryClient.setQueryData<AdminUsersPageData>(
      ["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder, country, city, gender, verified, subscriptionStatus, online, createdFrom, createdTo, walletMin, walletMax, includeDeleted],
      (old) => old ? {
        ...old,
        users: old.users.map((item) => ids.includes(item.id) ? { ...item, ...changes } : item),
      } : old
    );
    await refetch();
  };

  // ── Single-row & bulk action handlers ──
  const handleDelete = async (ids: string[]) => {
    setActionLoadingId("bulk-delete");
    try {
      if (!canDeleteUsers) throw new Error("غير مصرح بتنفيذ الإجراء");
      const targets = (data?.users || []).filter((item) => ids.includes(item.id));
      const allowed = targets.filter((target) => !getUserActionBlockReason(currentUser, target, "delete"));
      const blockedCount = targets.length - allowed.length;
      const result = await adminUsersApi.bulkRemove(allowed.map((target) => target.id));
      if (result.deleted) {
        toast.success(`تم حذف ${result.deleted} مستخدم بنجاح`);
        adminAudit.record("users.bulk_delete", { ids: allowed.map((t) => t.id), deleted: result.deleted });
      }
      if (blockedCount) toast.warning(`تم استبعاد ${blockedCount} حساب محمي`);
      if (result.failed) toast.error(`فشل حذف ${result.failed} مستخدم`);
      await refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطأ في الاتصال بالخادم");
      logger.error("Bulk delete failed", err);
    } finally {
      setDeleteDialog({ open: false, ids: [] });
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (ids: string[]) => {
    if (!canRestoreUsers) return toast.error("غير مصرح بتنفيذ الإجراء");
    setActionLoadingId("bulk-restore");
    try {
      const result = await adminUsersApi.bulkRestore(ids);
      toast.success(`تمت استعادة ${result.success} مستخدم`);
      if (result.failed) toast.error(`فشل استعادة ${result.failed} مستخدم`);
      adminAudit.record("users.bulk_restore", { ids, restored: result.success });
      await refetch();
    } catch (err) {
      toast.error("فشل استعادة المستخدمين");
      logger.error("Bulk restore failed", err);
    } finally {
      setRestoreDialog({ open: false, ids: [] });
      setActionLoadingId(null);
    }
  };

  const handleSuspend = async (ids: string[], reason?: string) => {
    if (!canSuspendUsers) return toast.error("غير مصرح بتنفيذ الإجراء");
    setActionLoadingId("bulk-suspend");
    try {
      const targets = (data?.users || []).filter((item) => ids.includes(item.id));
      const allowed = targets.filter((target) => !getUserActionBlockReason(currentUser, target, "suspend"));
      if (!allowed.length) return toast.error("لا توجد حسابات مسموح بتعليقها");
      const result = await adminUsersApi.bulkSuspend(allowed.map((t) => t.id), reason);
      toast.success(`تم تعليق ${result.success} مستخدم`);
      if (result.failed) toast.error(`فشل تعليق ${result.failed} مستخدم`);
      adminAudit.record("users.bulk_suspend", { ids: allowed.map((t) => t.id), reason });
      await refetch();
    } catch (err) {
      toast.error("فشل تعليق المستخدمين");
      logger.error("Bulk suspend failed", err);
    } finally {
      setSuspendDialog({ open: false, ids: [], reason: undefined });
      setActionLoadingId(null);
    }
  };

  const handleActivate = async (ids: string[]) => {
    if (!canSuspendUsers) return toast.error("غير مصرح بتنفيذ الإجراء");
    setActionLoadingId("bulk-activate");
    try {
      const result = await adminUsersApi.bulkActivate(ids);
      toast.success(`تم تفعيل ${result.success} مستخدم`);
      if (result.failed) toast.error(`فشل تفعيل ${result.failed} مستخدم`);
      adminAudit.record("users.bulk_activate", { ids, activated: result.success });
      await refetch();
    } catch (err) {
      toast.error("فشل تفعيل المستخدمين");
      logger.error("Bulk activate failed", err);
    } finally {
      setActivateDialog({ open: false, ids: [] });
      setActionLoadingId(null);
    }
  };

  const handleResetPassword = async (user: AdminUserListItem, password: string) => {
    if (!canManagePassword) return toast.error("غير مصرح بتنفيذ الإجراء");
    const blocked = getUserActionBlockReason(currentUser, user, "reset-password");
    if (blocked) return toast.error(blocked);
    setActionLoadingId(user.id);
    try {
      await adminUsersApi.resetPassword(user.id, password);
      toast.success(`تم تغيير كلمة المرور للمستخدم ${user.name || user.email}`);
      adminAudit.record("users.reset_password", { userId: user.id });
      setPasswordDialog({ open: false, user: null });
    } catch (err) {
      toast.error("فشل تغيير كلمة المرور");
      logger.error("Reset password failed", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerify = async (user: AdminUserListItem, type: "email" | "phone") => {
    if (!canManageVerification) return toast.error("غير مصرح بتنفيذ الإجراء");
    setActionLoadingId(user.id);
    try {
      if (type === "email") {
        await adminUsersApi.verifyEmail(user.id);
        toast.success(`تم توثيق البريد الإلكتروني للمستخدم ${user.name || user.email}`);
      } else {
        await adminUsersApi.verifyPhone(user.id);
        toast.success(`تم توثيق رقم الهاتف للمستخدم ${user.name || user.email}`);
      }
      adminAudit.record("users.verify", { userId: user.id, type });
      await refreshWithOptimistic([user.id], type === "email" ? { emailVerified: true } : { phoneVerified: true });
      setVerifyDialog({ open: false, user: null, type: "email" });
    } catch (err) {
      toast.error("فشل عملية التوثيق");
      logger.error("Verify failed", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAssignRole = async (user: AdminUserListItem | null, role: UserRole, ids?: string[]) => {
    if (!canAssignRoles) return toast.error("غير مصرح بتنفيذ الإجراء");
    const targetUserId = user?.id;
    if (targetUserId) {
      const blocked = getUserActionBlockReason(currentUser, user, "role-change");
      if (blocked) return toast.error(blocked);
      if (!canAssignRole(currentUser?.role || "", role)) return toast.error("لا يمكنك تعيين دور أعلى من صلاحيتك");
    }
    setActionLoadingId("bulk-role");
    try {
      if (targetUserId) {
        await adminUsersApi.assignRole(targetUserId, role, "Assign role from users hub");
        toast.success(`تم تغيير دور المستخدم إلى ${role}`);
        adminAudit.record("users.assign_role", { userId: targetUserId, role });
        await refreshWithOptimistic([targetUserId], { role });
      } else if (ids?.length) {
        const result = await adminUsersApi.bulkAssignRole(ids, role);
        toast.success(`تم تعيين الدور لـ ${result.success} مستخدم`);
        if (result.failed) toast.error(`فشل ${result.failed} مستخدم`);
        adminAudit.record("users.bulk_assign_role", { ids, role });
        await refetch();
      }
      setRoleDialog({ open: false, user: null });
      setBulkRoleDialog({ open: false, ids: [] });
    } catch (err) {
      toast.error("فشل تغيير الدور");
      logger.error("Assign role failed", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleImpersonate = async () => {
    if (!impersonateDialog.user) return;
    const blocked = getUserActionBlockReason(currentUser, impersonateDialog.user, "impersonate");
    if (!canManageUsers || blocked) {
      toast.error(blocked || "غير مصرح بتنفيذ الإجراء");
      return;
    }
    setImpersonating(true);
    try {
      const res = await adminFetch(apiRoutes.admin.impersonateById(impersonateDialog.user.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('تم تبديل الهوية، جاري التوجيه...');
        window.location.href = '/';
      } else {
        const data = await res.json();
        toast.error(data.error || 'فشل في تبديل الهوية');
      }
    } catch (error) {
      logger.error("فشل تبديل الهوية", error);
      toast.error('خطأ في الاتصال');
    } finally {
      setImpersonating(false);
      setImpersonateDialog({ open: false, user: null });
    }
  };

  const handleTerminateAllSessions = async (user: AdminUserListItem) => {
    if (!canTerminateSessions) return toast.error("غير مصرح بتنفيذ الإجراء");
    setActionLoadingId(user.id);
    try {
      await adminUsersApi.terminateAllSessions(user.id);
      toast.success("تم إنهاء جميع الجلسات النشطة للمستخدم");
      adminAudit.record("users.terminate_sessions", { userId: user.id });
    } catch (err) {
      toast.error("فشل إنهاء الجلسات");
      logger.error("Terminate sessions failed", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendActivationLink = async (user: AdminUserListItem) => {
    if (!canManageVerification) return toast.error("غير مصرح بتنفيذ الإجراء");
    setActionLoadingId(user.id);
    try {
      await adminUsersApi.sendActivationLink(user.id);
      toast.success("تم إرسال رابط التفعيل بنجاح");
      adminAudit.record("users.send_activation_link", { userId: user.id });
    } catch (err) {
      toast.error("فشل إرسال رابط التفعيل");
      logger.error("Send activation link failed", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Export handlers ──
  const fetchExportRows = async (): Promise<AdminUserListItem[]> => {
    if (exportAbortControllerRef.current) exportAbortControllerRef.current.abort();
    const abortController = new AbortController();
    exportAbortControllerRef.current = abortController;

    const first = await adminUsersApi.list({
      page: 1,
      limit: 200,
      search: querySearch,
      role: role === "all" ? undefined : role as UserRole,
      status: status === "all" ? undefined : status as UserStatus,
      sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status" | "walletBalance" | "coursesCount" | "ordersCount",
      sortOrder: sortOrder as "asc" | "desc",
      country: country || undefined,
      city: city || undefined,
      gender: gender === "all" ? undefined : gender,
      emailVerified: verified === "all" ? undefined : verified === "verified",
      subscriptionStatus: subscriptionStatus === "all" ? undefined : subscriptionStatus,
      isOnline: online === "all" ? undefined : online === "online",
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      walletMin: walletMin ? Number(walletMin) : undefined,
      walletMax: walletMax ? Number(walletMax) : undefined,
      includeDeleted: includeDeleted || undefined,
    }, { signal: abortController.signal });

    if (abortController.signal.aborted) return [];

    const remaining: AdminUsersPageData[] = [];
    for (let startPage = 2; startPage <= first.pagination.totalPages; startPage += 4) {
      if (abortController.signal.aborted) return [];
      const batch = await Promise.all(
        Array.from({ length: Math.min(4, first.pagination.totalPages - startPage + 1) }, (_, index) =>
          adminUsersApi.list({
            page: startPage + index,
            limit: 200,
            search: querySearch,
            role: role === "all" ? undefined : role as UserRole,
            status: status === "all" ? undefined : status as UserStatus,
            sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status" | "walletBalance" | "coursesCount" | "ordersCount",
            sortOrder: sortOrder as "asc" | "desc",
            country: country || undefined,
            city: city || undefined,
            gender: gender === "all" ? undefined : gender,
            emailVerified: verified === "all" ? undefined : verified === "verified",
            subscriptionStatus: subscriptionStatus === "all" ? undefined : subscriptionStatus,
            isOnline: online === "all" ? undefined : online === "online",
            createdFrom: createdFrom || undefined,
            createdTo: createdTo || undefined,
            walletMin: walletMin ? Number(walletMin) : undefined,
            walletMax: walletMax ? Number(walletMax) : undefined,
            includeDeleted: includeDeleted || undefined,
          }, { signal: abortController.signal })
        ),
      );
      remaining.push(...batch);
    }
    return [first, ...remaining].flatMap((result) => result.users);
  };

  const handleExportCSV = async () => {
    if (!canExportUsers) return toast.error("غير مصرح بتصدير المستخدمين");
    setExporting(true);
    try {
      const users = await fetchExportRows();
      if (!users.length) return toast.error('لا توجد بيانات للتصدير');

      const exportColumns: ExportColumn<AdminUserListItem>[] = [
        { header: 'الاسم', accessor: (u) => u.name || u.username || "بدون اسم" },
        { header: 'اسم المستخدم', accessor: (u) => u.username || "" },
        { header: 'البريد الإلكتروني', accessor: 'email' },
        { header: 'الهاتف', accessor: (u) => u.phone || "" },
        { header: 'الدور', accessor: 'role' },
        { header: 'الحالة', accessor: 'status' },
        { header: 'الدولة', accessor: (u) => u.country || "" },
        { header: 'المدينة', accessor: (u) => u.city || "" },
        { header: 'الجنس', accessor: (u) => u.gender || "" },
        { header: 'البريد موثق', accessor: (u) => u.emailVerified ? "نعم" : "لا" },
        { header: 'الهاتف موثق', accessor: (u) => u.phoneVerified ? "نعم" : "لا" },
        { header: 'الرصيد', accessor: (u) => u.walletBalance || 0 },
        { header: 'عدد الكورسات', accessor: (u) => u.coursesCount || 0 },
        { header: 'عدد الطلبات', accessor: (u) => u.ordersCount || 0 },
        { header: 'عدد الشهادات', accessor: (u) => u.certificatesCount || 0 },
        { header: 'عدد الأجهزة', accessor: (u) => u.devicesCount || 0 },
        { header: 'تاريخ التسجيل', accessor: (u) => new Date(u.createdAt).toLocaleDateString('ar-EG') },
        { header: 'آخر دخول', accessor: (u) => u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول' },
      ];
      exportToCSV(users, exportColumns, 'users');
      toast.success(`تم تصدير ${users.length} مستخدم بنجاح`);
      adminAudit.record("users.export", { format: "csv", count: users.length });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.info("تم إلغاء عملية التصدير");
        return;
      }
      logger.error("فشل تصدير CSV", err);
      toast.error("فشل تصدير بيانات المستخدمين");
    } finally {
      setExporting(false);
      exportAbortControllerRef.current = null;
    }
  };

  const handleExportJSON = async () => {
    if (!canExportUsers) return toast.error("غير مصرح بتصدير المستخدمين");
    setExportingJson(true);
    try {
      const users = await fetchExportRows();
      if (!users.length) return toast.error('لا توجد بيانات للتصدير');
      exportToJSON(users, 'users');
      toast.success(`تم تصدير ${users.length} مستخدم بنجاح`);
      adminAudit.record("users.export", { format: "json", count: users.length });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      logger.error("فشل تصدير JSON", err);
      toast.error("فشل تصدير بيانات المستخدمين");
    } finally {
      setExportingJson(false);
      exportAbortControllerRef.current = null;
    }
  };

  // ── Arabic column labels for the visibility menu ──
  const columnLabels: Record<string, string> = {
    select: "تحديد",
    name: "المستخدم",
    phone: "الهاتف",
    role: "الدور",
    country: "الدولة",
    createdAt: "تاريخ التسجيل",
    lastLogin: "آخر دخول",
    status: "الحالة",
    verification: "التوثيق",
    subscription: "الاشتراك",
    wallet: "الرصيد",
    counts: "الإحصائيات",
    totalXP: "نقاط التفاعل",
    actions: "الإجراءات",
  };

  // ── Table columns ──
  const columns: ColumnDef<AdminUserListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="تحديد الكل"
          className="translate-y-[2px] border-white/20"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="تحديد الصف"
          className="translate-y-[2px] border-white/20"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "المستخدم",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                  {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background ${
                  user.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                }`}
                title={user.isOnline ? "متصل الآن" : "غير متصل"}
              />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">{user.name || user.username || "بدون اسم"}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic" dir="ltr">{user.email}</p>
              {user.username && <p className="text-[10px] text-muted-foreground font-bold">@{user.username}</p>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "الهاتف",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold" dir="ltr">{row.original.phone || "—"}</span>
          {row.original.phoneVerified && (
            <span className="text-[10px] text-success font-bold flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> موثق
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "country",
      header: "الدولة",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold flex items-center gap-1">
            <Globe className="h-3 w-3 text-muted-foreground" />
            {row.original.country || "—"}
          </span>
          {row.original.city && <span className="text-[10px] text-muted-foreground">{row.original.city}</span>}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ التسجيل",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-black">{new Date(row.original.createdAt).toLocaleDateString("ar-EG")}</span>
          <span className="text-[10px] text-muted-foreground font-bold italic">
            منذ {Math.max(0, Math.floor((Date.now() - new Date(row.original.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} يوم
          </span>
        </div>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "آخر دخول",
      cell: ({ row }) => row.original.lastLogin
        ? <div><p className="text-sm font-bold">{new Date(row.original.lastLogin).toLocaleDateString("ar-EG")}</p><p className="text-[10px] text-muted-foreground">{new Date(row.original.lastLogin).toLocaleTimeString("ar-EG")}</p></div>
        : <span className="text-xs text-muted-foreground">لم يسجل دخولًا</span>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <StatusBadge
            status={
              row.original.status === UserStatus.ACTIVE ? "active"
              : row.original.status === UserStatus.SUSPENDED || row.original.status === UserStatus.BANNED ? "suspended"
              : row.original.status === UserStatus.PENDING_VERIFICATION ? "pending"
              : "inactive"
            }
          />
          {row.original.isOnline && (
            <span className="text-[10px] text-success font-black flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              متصل الآن
            </span>
          )}
        </div>
      ),
    },
    {
      id: "verification",
      header: "التوثيق",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge status={row.original.emailVerified ? "verified" : "unverified"} />
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.original.phoneVerified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>الهاتف</span>
          {row.original.twoFactorEnabled && (
            <span className="rounded-full px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary">2FA</span>
          )}
        </div>
      ),
    },
    {
      id: "subscription",
      header: "الاشتراك",
      cell: ({ row }) => {
        const sub = row.original.subscriptionStatus;
        return (
          <div className="flex flex-col">
            <span className={`text-[11px] font-black rounded-full px-2 py-0.5 w-fit ${
              sub === "ACTIVE" ? "bg-success/10 text-success" :
              sub === "EXPIRED" ? "bg-muted text-muted-foreground" :
              sub === "CANCELLED" ? "bg-warning/10 text-warning" : "bg-muted/50 text-muted-foreground"
            }`}>
              {sub === "ACTIVE" ? "نشط" : sub === "EXPIRED" ? "منتهي" : sub === "CANCELLED" ? "ملغي" : "بدون"}
            </span>
            {row.original.subscriptionExpiresAt && (
              <span className="text-[10px] text-muted-foreground mt-0.5">
                حتى {new Date(row.original.subscriptionExpiresAt).toLocaleDateString("ar-EG")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "wallet",
      header: "الرصيد",
      cell: ({ row }) => canViewFinancial ? (
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5" />
          {(row.original.walletBalance || 0).toLocaleString()} ج.م
        </span>
      ) : <span className="text-xs text-muted-foreground">مخفي</span>,
    },
    {
      id: "counts",
      header: "الإحصائيات",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-wrap">
          {(canViewFinancial || canManageUsers) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الرصيد">
              <Wallet className="h-3 w-3" />{row.original.walletBalance || 0}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الكورسات">
            <BookOpen className="h-3 w-3" />{row.original.coursesCount ?? row.original._count?.courses ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الطلبات">
            <Package className="h-3 w-3" />{row.original.ordersCount ?? row.original._count?.orders ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الشهادات">
            <Award className="h-3 w-3" />{row.original.certificatesCount ?? row.original._count?.certificates ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground" title="الأجهزة">
            <Monitor className="h-3 w-3" />{row.original.devicesCount ?? row.original._count?.devices ?? 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "totalXP",
      header: "نقاط التفاعل",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-primary flex items-center gap-1">
            <Zap className="w-3 h-3 fill-primary" />
            {(row.original.totalXP || 0).toLocaleString()} نقطة
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
            {row.original._count?.tasks || 0} نشاط مكتمل
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const user = row.original;
        const deleteBlock = getUserActionBlockReason(currentUser, user, "delete");
        const suspendBlock = getUserActionBlockReason(currentUser, user, "suspend");
        const impersonateBlock = getUserActionBlockReason(currentUser, user, "impersonate");
        const passwordBlock = getUserActionBlockReason(currentUser, user, "reset-password");
        const isDeleted = user.status === UserStatus.DELETED;
        const loadingThis = actionLoadingId === user.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AdminButton variant="ghost" size="icon-sm" className="h-8 w-8" disabled={loadingThis}>
                {loadingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </AdminButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[420px] overflow-y-auto">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* View / Edit */}
              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              {canUpdateUsers && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
              )}

              {/* Status management */}
              {canManageVerification && !isDeleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px]">التوثيق</DropdownMenuLabel>
                  {!user.emailVerified && (
                    <DropdownMenuItem onClick={() => setVerifyDialog({ open: true, user, type: "email" })}>
                      <CheckCircle className="ml-2 h-4 w-4 text-success" />
                      توثيق البريد
                    </DropdownMenuItem>
                  )}
                  {!user.phoneVerified && (
                    <DropdownMenuItem onClick={() => setVerifyDialog({ open: true, user, type: "phone" })}>
                      <Phone className="ml-2 h-4 w-4 text-success" />
                      توثيق الهاتف
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleSendActivationLink(user)}>
                    <Send className="ml-2 h-4 w-4 text-info" />
                    إرسال رابط التفعيل
                  </DropdownMenuItem>
                </>
              )}

              {canSuspendUsers && !isDeleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px]">الحالة</DropdownMenuLabel>
                  {user.status !== UserStatus.SUSPENDED && user.status !== UserStatus.BANNED && (
                    <DropdownMenuItem
                      onClick={() => setSuspendDialog({ open: true, ids: [user.id] })}
                      disabled={!!suspendBlock}
                    >
                      <Ban className="ml-2 h-4 w-4 text-warning" />
                      تعليق الحساب
                    </DropdownMenuItem>
                  )}
                  {(user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED || user.status === UserStatus.INACTIVE) && (
                    <DropdownMenuItem onClick={() => setActivateDialog({ open: true, ids: [user.id] })}>
                      <CheckCircle className="ml-2 h-4 w-4 text-success" />
                      تفعيل الحساب
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {canManagePassword && !isDeleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setPasswordDialog({ open: true, user })}
                    disabled={!!passwordBlock}
                  >
                    <Key className="ml-2 h-4 w-4" />
                    تغيير كلمة المرور
                  </DropdownMenuItem>
                </>
              )}

              {canAssignRoles && !isDeleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setRoleDialog({ open: true, user })}>
                    <UserCog className="ml-2 h-4 w-4" />
                    تغيير الدور
                  </DropdownMenuItem>
                </>
              )}

              {/* Related resources */}
              {(canViewSessions || canViewActivity || canViewAudit || canViewOrders || canViewCertificates || canViewSupport || canViewFinancial) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px]">البيانات المرتبطة</DropdownMenuLabel>
                </>
              )}
              {canViewSessions && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/user-sessions?userId=${user.id}`)}>
                  <Activity className="ml-2 h-4 w-4" />
                  الجلسات النشطة
                </DropdownMenuItem>
              )}
              {canTerminateSessions && !isDeleted && (
                <DropdownMenuItem onClick={() => handleTerminateAllSessions(user)}>
                  <CircleOff className="ml-2 h-4 w-4 text-destructive" />
                  إنهاء جميع الجلسات
                </DropdownMenuItem>
              )}
              {canViewActivity && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/activity`)}>
                  <Activity className="ml-2 h-4 w-4" />
                  سجل النشاط
                </DropdownMenuItem>
              )}
              {canViewAudit && (
                <DropdownMenuItem onClick={() => router.push(`/admin/audit-logs?userId=${user.id}`)}>
                  <FileText className="ml-2 h-4 w-4" />
                  سجل التدقيق
                </DropdownMenuItem>
              )}
              {canViewOrders && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/orders?userId=${user.id}`)}>
                  <Package className="ml-2 h-4 w-4" />
                  الطلبات
                </DropdownMenuItem>
              )}
              {canViewFinancial && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/wallet?userId=${user.id}`)}>
                  <Wallet className="ml-2 h-4 w-4" />
                  المحفظة
                </DropdownMenuItem>
              )}
              {canViewCertificates && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/certificates?userId=${user.id}`)}>
                  <Award className="ml-2 h-4 w-4" />
                  الشهادات
                </DropdownMenuItem>
              )}
              {canViewSupport && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/tickets?userId=${user.id}`)}>
                  <LifeBuoy className="ml-2 h-4 w-4" />
                  تذاكر الدعم
                </DropdownMenuItem>
              )}

              {/* Notifications */}
              {canSendNotifications && !isDeleted && (
                <DropdownMenuItem onClick={() => setMessageDialog({ open: true, users: [user] })}>
                  <Bell className="ml-2 h-4 w-4" />
                  إرسال إشعار
                </DropdownMenuItem>
              )}

              {/* Impersonation */}
              {canManageUsers && !isDeleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setImpersonateDialog({ open: true, user })}
                    disabled={!!impersonateBlock}
                  >
                    <LogIn className="ml-2 h-4 w-4" />
                    تسجيل الدخول كـ
                  </DropdownMenuItem>
                </>
              )}

              {/* Permissions */}
              {canAssignPermissions && !isDeleted && (
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/permissions`)}>
                  <Shield className="ml-2 h-4 w-4" />
                  إدارة الصلاحيات
                </DropdownMenuItem>
              )}

              {/* Restore / Delete */}
              <DropdownMenuSeparator />
              {isDeleted ? (
                canRestoreUsers && (
                  <DropdownMenuItem onClick={() => setRestoreDialog({ open: true, ids: [user.id] })} className="text-success">
                    <RotateCcw className="ml-2 h-4 w-4" />
                    استعادة الحساب
                  </DropdownMenuItem>
                )
              ) : (
                canDeleteUsers && (
                  <DropdownMenuItem
                    onClick={() => setDeleteDialog({ open: true, ids: [user.id] })}
                    disabled={!!deleteBlock}
                    className="text-destructive"
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف (ناعم)
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ── Stats cards (all from backend summary) ──
  const summaryCards: Array<{ title: string; value: number; icon: React.ElementType; color: "blue" | "green" | "yellow" | "red" | "fuchsia" | "purple" | "amber" | "slate" | "default"; description: string }> = [
    { title: "إجمالي المستخدمين", value: data?.summary?.totalUsers || 0, icon: Users, color: "blue", description: "مستخدم في المنصة" },
    { title: "الطلاب", value: data?.summary?.totalStudents || 0, icon: GraduationCap, color: "fuchsia", description: "حساب طالب" },
    { title: "المعلمون", value: data?.summary?.totalTeachers || 0, icon: BookOpen, color: "purple", description: "حساب معلم" },
    { title: "المشرفون", value: data?.summary?.totalModerators || 0, icon: ShieldCheck, color: "amber", description: "حساب مشرف" },
    { title: "المدراء", value: data?.summary?.totalAdmins || 0, icon: Shield, color: "yellow", description: "حساب إداري" },
    { title: "موثقون", value: data?.summary?.verified || 0, icon: BadgeCheck, color: "green", description: "بريد موثق" },
    { title: "غير موثقين", value: data?.summary?.notVerified || 0, icon: UserX, color: "slate", description: "بانتظار التحقق" },
    { title: "نشطون", value: data?.summary?.active || 0, icon: UserCheck, color: "green", description: "حساب نشط" },
    { title: "موقوفون", value: data?.summary?.suspended || 0, icon: Ban, color: "yellow", description: "حساب موقوف" },
    { title: "محظورون", value: data?.summary?.blocked || 0, icon: ShieldX, color: "red", description: "حساب محظور" },
    { title: "محذوفون", value: data?.summary?.deleted || 0, icon: Trash2, color: "slate", description: "حساب محذوف" },
    { title: "جدد اليوم", value: data?.summary?.newToday || 0, icon: Sparkles, color: "blue", description: "اليوم" },
    { title: "جدد هذا الأسبوع", value: data?.summary?.newThisWeek || 0, icon: Calendar, color: "purple", description: "آخر 7 أيام" },
    { title: "جدد هذا الشهر", value: data?.summary?.newThisMonth || 0, icon: Calendar, color: "fuchsia", description: "آخر 30 يوم" },
    { title: "متصلون الآن", value: data?.summary?.onlineNow || 0, icon: Zap, color: "green", description: "نشاط الآن" },
  ];

  // Permission Denied state
  if (!canViewUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center" dir="rtl">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20 mb-6">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-black mb-2">غير مصرح بالوصول</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          ليس لديك الصلاحية لعرض صفحة إدارة المستخدمين. يرجى التواصل مع مدير النظام.
        </p>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          العودة إلى لوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push("/admin")} className="hover:text-primary font-bold transition-colors">
          لوحة التحكم
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-black text-foreground">إدارة المستخدمين</span>
        {isConnected && (
          <span className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 text-success px-2.5 py-0.5 text-[10px] font-black">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            مباشر
          </span>
        )}
      </nav>

      <PageHeader
        title="إدارة مستخدمي المنصة ⚙️"
        description="إدارة جميع مستخدمي المنصة، أدوارهم، وصلاحياتهم، وجميع البيانات المرتبطة بهم من مكان واحد."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-black">
              <Users className="h-3 w-3" /> {data?.pagination?.total || 0} مستخدم
            </span>
            {data?.summary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2.5 py-1 text-[11px] font-black">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {data.summary.onlineNow || 0} متصل الآن
              </span>
            )}
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          {canExportUsers && (
            <>
              <AdminButton variant="outline" icon={Download} onClick={handleExportCSV} loading={exporting} className="rounded-2xl border-white/10">
                تصدير CSV
              </AdminButton>
              <AdminButton variant="outline" icon={FileJson} onClick={handleExportJSON} loading={exportingJson} className="rounded-2xl border-white/10">
                JSON
              </AdminButton>
            </>
          )}
          {canImportUsers && (
            <AdminButton variant="outline" icon={Upload} onClick={() => setImportDialogOpen(true)} className="rounded-2xl border-white/10">
              استيراد CSV
            </AdminButton>
          )}
          {canCreateUsers && (
            <AdminButton variant="premium" icon={UserPlus} onClick={() => router.push("/admin/users/create")} className="rounded-2xl shadow-xl">
              إضافة مستخدم جديد
            </AdminButton>
          )}
        </div>
      </PageHeader>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <AdminStatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
          />
        ))}
      </div>

      {/* Analytics Charts Section */}
      <LazySection minHeight={320} rootMargin="250px">
        <AnalyticsSection />
      </LazySection>

      {/* Role Tabs */}
      <Tabs value={role} onValueChange={(val) => { setRole(val as "all" | UserRole); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          {ROLE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg whitespace-nowrap">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Status Tabs */}
      <Tabs value={status} onValueChange={(val) => { setStatus(val as "all" | UserStatus); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`rounded-xl px-5 text-sm font-black data-[state=active]:shadow-lg whitespace-nowrap ${tab.activeClass || "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Error state */}
      {isError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-bold">تعذر تحميل المستخدمين</p>
              <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "تحقق من الاتصال ثم أعد المحاولة."}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            className="flex items-center gap-2 text-sm font-black hover:text-primary transition-colors"
          >
            <Filter className={`h-4 w-4 ${advancedFiltersOpen ? "text-primary" : ""}`} />
            الفلاتر المتقدمة
            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
          </button>
          {hasActiveFilters && (
            <AdminButton variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              <FilterX className="h-3.5 w-3.5 ml-1" />
              مسح الكل
            </AdminButton>
          )}
        </div>

        {advancedFiltersOpen && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">الدولة</Label>
              <Input
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                placeholder="مثال: مصر"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">المدينة</Label>
              <Input
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                placeholder="مثال: القاهرة"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">الجنس</Label>
              <Select value={gender} onValueChange={(v) => { setGender(v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">التوثيق</Label>
              <Select value={verified} onValueChange={(v) => { setVerified(v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERIFIED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">الاشتراك</Label>
              <Select value={subscriptionStatus} onValueChange={(v) => { setSubscriptionStatus(v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">الحالة</Label>
              <Select value={online} onValueChange={(v) => { setOnline(v); setPage(1); }}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ONLINE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">من تاريخ التسجيل</Label>
              <Input type="date" value={createdFrom} onChange={(e) => { setCreatedFrom(e.target.value); setPage(1); }} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-muted-foreground">إلى تاريخ التسجيل</Label>
              <Input type="date" value={createdTo} onChange={(e) => { setCreatedTo(e.target.value); setPage(1); }} className="h-9" />
            </div>
            {canViewFinancial && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black text-muted-foreground">الحد الأدنى للرصيد</Label>
                  <Input type="number" min={0} value={walletMin} onChange={(e) => { setWalletMin(e.target.value); setPage(1); }} placeholder="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black text-muted-foreground">الحد الأقصى للرصيد</Label>
                  <Input type="number" min={0} value={walletMax} onChange={(e) => { setWalletMax(e.target.value); setPage(1); }} placeholder="100000" className="h-9" />
                </div>
              </>
            )}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded border-white/20"
                />
                عرض المحذوفين
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <AdminDataTable
          columns={columns}
          data={data?.users || []}
          loading={isLoading}
          serverSide
          selectable
          virtualized
          columnLabels={columnLabels}
          onSortingChange={(sorting) => {
            const col = sorting.length > 0 ? sorting[0] : null;
            if (col) {
              setSortBy(col.id);
              setSortOrder(col.desc ? "desc" : "asc");
              setPage(1);
            }
          }}
          enableSelectAllPages
          onSelectAllPages={() => {
            // Select all users across all pages by fetching all IDs
            toast.info("جاري تحديد جميع المستخدمين...");
            void fetchExportRows().then((allUsers) => {
              const allIds = allUsers.map((u) => u.id);
              if (allIds.length > 0) {
                // Store all IDs in a ref for bulk actions
                allSelectedIdsRef.current = allIds;
                toast.success(`تم تحديد ${allIds.length} مستخدم`);
              }
            });
          }}
          bulkActions={[
            ...(canSendNotifications ? [{ label: "إرسال إشعار جماعي", icon: Bell, variant: "outline" as const, onClick: (rows: AdminUserListItem[]) => setMessageDialog({ open: true, users: rows }) }] : []),
            ...(canSuspendUsers ? [{ label: "تعليق الحسابات", icon: Ban, variant: "outline" as const, onClick: (rows: AdminUserListItem[]) => setSuspendDialog({ open: true, ids: rows.map((r) => r.id) }) }] : []),
            ...(canSuspendUsers ? [{ label: "تفعيل الحسابات", icon: CheckCircle, variant: "outline" as const, onClick: (rows: AdminUserListItem[]) => setActivateDialog({ open: true, ids: rows.map((r) => r.id) }) }] : []),
            ...(canAssignRoles ? [{ label: "تعيين دور", icon: UserCog, variant: "outline" as const, onClick: (rows: AdminUserListItem[]) => setBulkRoleDialog({ open: true, ids: rows.map((r) => r.id) }) }] : []),
            ...(canExportUsers ? [{ label: "تصدير المحدد CSV", icon: Download, variant: "outline" as const, onClick: (rows: AdminUserListItem[]) => {
              exportToCSV(rows, [
                { header: "الاسم", accessor: (item) => item.name || item.username || "بدون اسم" },
                { header: "البريد", accessor: "email" },
                { header: "الهاتف", accessor: (item) => item.phone || "" },
                { header: "الدور", accessor: "role" },
                { header: "الحالة", accessor: "status" },
                { header: "الدولة", accessor: (item) => item.country || "" },
                { header: "الرصيد", accessor: (item) => item.walletBalance || 0 },
              ], "selected-users");
              toast.success(`تم تصدير ${rows.length} مستخدم`);
            } }] : []),
            ...(canRestoreUsers ? [{ label: "استعادة", icon: RotateCcw, variant: "outline" as const, onClick: (rows: AdminUserListItem[]) => setRestoreDialog({ open: true, ids: rows.map((r) => r.id) }) }] : []),
            ...(canDeleteUsers ? [{ label: "حذف", icon: Trash2, variant: "destructive" as const, onClick: (rows: AdminUserListItem[]) => setDeleteDialog({ open: true, ids: rows.map((r) => r.id) }) }] : []),
          ]}
          totalRows={data?.pagination?.total || 0}
          pageCount={data?.pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex items-center gap-2">
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="البحث بالاسم، البريد، الهاتف، اسم المستخدم..."
                  aria-label="بحث في المستخدمين"
                  className="bg-accent/10 border border-border rounded-xl h-10 px-10 text-sm focus:ring-1 ring-primary outline-none w-full sm:w-80 font-bold"
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setPage(1);
                    updateQuerySearch(value.trim());
                  }}
                />
              </div>
              <AdminButton
                variant="outline"
                size="icon-sm"
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                className={advancedFiltersOpen ? "bg-primary text-primary-foreground" : ""}
              >
                <Filter className="h-4 w-4" />
              </AdminButton>
              {hasActiveFilters && (
                <AdminButton variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                  <FilterX className="h-3.5 w-3.5 ml-1" />
                  مسح الفلاتر
                </AdminButton>
              )}
            </div>
          }
          emptyMessage={{
            title: !data?.users?.length && !isLoading ? "لا توجد نتائج" : "لا توجد بيانات",
            description: hasActiveFilters ? "جرّب تعديل أو مسح الفلاتر للعثور على المستخدمين." : "لم يتم العثور على أي مستخدمين بعد.",
          }}
        />
      </div>

      {/* ── Dialogs ── */}

      {/* Delete confirm */}
      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ids: [] })}
        title={deleteDialog.ids.length > 1 ? `حذف ${deleteDialog.ids.length} مستخدم؟` : "حذف حساب مستخدم؟"}
        description="سيتم الحذف الناعم (Soft Delete) — لا تُحذف البيانات نهائياً ويمكن استعادتها لاحقاً."
        confirmText="تأكيد الحذف الناعم"
        variant="destructive"
        onConfirm={() => handleDelete(deleteDialog.ids)}
        loading={actionLoadingId === "bulk-delete"}
      />

      {/* Restore confirm */}
      <AdminConfirm
        open={restoreDialog.open}
        onOpenChange={(open) => setRestoreDialog({ open, ids: [] })}
        title={restoreDialog.ids.length > 1 ? `استعادة ${restoreDialog.ids.length} مستخدم؟` : "استعادة حساب مستخدم؟"}
        description="سيتم استعادة الحساب المحذوف وجميع بياناته المرتبطة."
        confirmText="تأكيد الاستعادة"
        variant="success"
        onConfirm={() => handleRestore(restoreDialog.ids)}
        loading={actionLoadingId === "bulk-restore"}
      />

      {/* Suspend confirm + reason */}
      <Dialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog({ open, ids: [], reason: undefined })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-warning" />
              {suspendDialog.ids.length > 1 ? `تعليق ${suspendDialog.ids.length} مستخدم` : "تعليق حساب مستخدم"}
            </DialogTitle>
            <DialogDescription>
              سيتم إغلاق جميع الجلسات وإلغاء التوكنات، وتسجيل العملية في سجل التدقيق، وإرسال إشعار للمستخدم.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="suspend-reason" className="text-sm font-bold">سبب التعليق (اختياري)</Label>
            <Textarea
              id="suspend-reason"
              placeholder="أدخل سبب التعليق..."
              value={suspendDialog.reason || ""}
              onChange={(e) => setSuspendDialog({ ...suspendDialog, reason: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <AdminButton variant="outline" onClick={() => setSuspendDialog({ open: false, ids: [], reason: undefined })}>
              إلغاء
            </AdminButton>
            <AdminButton variant="warning" onClick={() => handleSuspend(suspendDialog.ids, suspendDialog.reason)} loading={actionLoadingId === "bulk-suspend"}>
              تأكيد التعليق
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate confirm */}
      <AdminConfirm
        open={activateDialog.open}
        onOpenChange={(open) => setActivateDialog({ open, ids: [] })}
        title={activateDialog.ids.length > 1 ? `تفعيل ${activateDialog.ids.length} مستخدم؟` : "تفعيل حساب مستخدم؟"}
        description="سيتم إعادة تفعيل الحساب والسماح بتسجيل الدخول واستخدام API."
        confirmText="تأكيد التفعيل"
        variant="success"
        onConfirm={() => handleActivate(activateDialog.ids)}
        loading={actionLoadingId === "bulk-activate"}
      />

      {/* Reset password dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ open, user: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              تغيير كلمة المرور
            </DialogTitle>
            <DialogDescription>
              أدخل كلمة مرور جديدة للمستخدم {passwordDialog.user?.name || passwordDialog.user?.email || ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="new-password" className="text-sm font-bold">كلمة المرور الجديدة</Label>
            <Input
              id="new-password"
              type="password"
              dir="ltr"
              placeholder="8 أحرف على الأقل"
              value={passwordDialog.password || ""}
              onChange={(e) => setPasswordDialog({ ...passwordDialog, password: e.target.value })}
            />
          </div>
          <DialogFooter>
            <AdminButton variant="outline" onClick={() => setPasswordDialog({ open: false, user: null })}>
              إلغاء
            </AdminButton>
            <AdminButton
              onClick={() => passwordDialog.user && passwordDialog.password && handleResetPassword(passwordDialog.user, passwordDialog.password)}
              disabled={!passwordDialog.password || passwordDialog.password.length < 8}
              loading={actionLoadingId === passwordDialog.user?.id}
            >
              حفظ
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify dialog */}
      <AdminConfirm
        open={verifyDialog.open}
        onOpenChange={(open) => setVerifyDialog({ open, user: null, type: verifyDialog.type })}
        title={verifyDialog.type === "email" ? "توثيق البريد الإلكتروني" : "توثيق رقم الهاتف"}
        description={`هل أنت متأكد من توثيق ${verifyDialog.type === "email" ? "البريد الإلكتروني" : "رقم الهاتف"} للمستخدم ${verifyDialog.user?.name || verifyDialog.user?.email || ""}؟`}
        confirmText="تأكيد التوثيق"
        variant="success"
        onConfirm={() => verifyDialog.user && handleVerify(verifyDialog.user, verifyDialog.type)}
        loading={actionLoadingId === verifyDialog.user?.id}
      />

      {/* Assign role dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ open, user: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              تغيير الدور
            </DialogTitle>
            <DialogDescription>
              اختر الدور الجديد للمستخدم {roleDialog.user?.name || roleDialog.user?.email || ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm font-bold">الدور</Label>
            <Select value={roleDialog.role || ""} onValueChange={(v) => setRoleDialog({ ...roleDialog, role: v as UserRole })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_TABS.filter((r) => r.value !== "all").map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <AdminButton variant="outline" onClick={() => setRoleDialog({ open: false, user: null })}>
              إلغاء
            </AdminButton>
            <AdminButton
              onClick={() => roleDialog.user && roleDialog.role && handleAssignRole(roleDialog.user, roleDialog.role)}
              disabled={!roleDialog.role}
              loading={actionLoadingId === "bulk-role"}
            >
              حفظ
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk assign role dialog */}
      <Dialog open={bulkRoleDialog.open} onOpenChange={(open) => setBulkRoleDialog({ open, ids: [] })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              تعيين دور لـ {bulkRoleDialog.ids.length} مستخدم
            </DialogTitle>
            <DialogDescription>اختر الدور الجديد للمستخدمين المحددين.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm font-bold">الدور</Label>
            <Select value={bulkRoleDialog.role || ""} onValueChange={(v) => setBulkRoleDialog({ ...bulkRoleDialog, role: v as UserRole })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_TABS.filter((r) => r.value !== "all").map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <AdminButton variant="outline" onClick={() => setBulkRoleDialog({ open: false, ids: [] })}>
              إلغاء
            </AdminButton>
            <AdminButton
              onClick={() => bulkRoleDialog.role && handleAssignRole(null, bulkRoleDialog.role, bulkRoleDialog.ids)}
              disabled={!bulkRoleDialog.role}
              loading={actionLoadingId === "bulk-role"}
            >
              تعيين الدور
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate confirm */}
      <AdminConfirm
        open={impersonateDialog.open}
        onOpenChange={(open) => setImpersonateDialog({ open, user: null })}
        title="تبديل الهوية (Impersonate)"
        description={`أنت على وشك الدخول بهوية المستخدم ${impersonateDialog.user?.name || 'المختار'}. ستتمكن من رؤية المنصة تماماً كما يراها.`}
        confirmText="تأكيد الدخول"
        variant="premium"
        onConfirm={handleImpersonate}
        loading={impersonating}
      />

      {/* Message broadcast modal */}
      <MessageModal
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog({ open, users: open ? messageDialog.users : [] })}
        users={messageDialog.users}
      />

      {/* CSV Import */}
      <CsvImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        title="استيراد مستخدمين من CSV"
        description="قم برفع ملف CSV يحتوي على بيانات المستخدمين لإضافتهم دفعة واحدة."
        columns={[
          { key: "email", label: "البريد الإلكتروني", required: true },
          { key: "name", label: "الاسم", required: true },
          { key: "username", label: "اسم المستخدم", required: false },
          { key: "password", label: "كلمة المرور", required: true },
          { key: "role", label: "الدور", required: false },
        ]}
        templateFileName="users-template.csv"
        onImport={async (rows) => {
          if (!canImportUsers) {
            toast.error("غير مصرح بالاستيراد");
            return;
          }
          try {
            const payload = rows.map(row => ({
              email: String(row.email),
              name: String(row.name),
              username: row.username ? String(row.username) : undefined,
              password: String(row.password),
              role: row.role ? String(row.role) : "STUDENT",
            }));
            const result = await adminUsersApi.bulkCreate(payload);
            if (result.created > 0) {
              toast.success(`تم استيراد ${result.created} مستخدم بنجاح دفعة واحدة`);
              adminAudit.record("users.import", { created: result.created, failed: result.failed });
              refetch();
            }
            if (result.failed > 0) {
              toast.warning(`فشل في استيراد ${result.failed} مستخدم`);
            }
          } catch (err) {
            toast.error("حدث خطأ في الاتصال أثناء الاستيراد الجماعي");
            logger.error("Import failed", err);
          }
        }}
      />
    </div>
  );
}