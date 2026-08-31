"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { usePermission } from "@/components/auth/PermissionGuard";
import { getRequiredPermissionForAdminPath } from "@/lib/admin-panel-route-access";
import { PERMISSIONS, resolvePermissionInput } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Trophy,
  Bell,
  MessageSquare,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Gift,
  Target,
  Award,
  Medal,
  Newspaper,
  Gamepad2,
  BarChart3,
  Monitor,
  ScrollText,
  Home,
  GraduationCap,
  Search,
  Keyboard,
  Star,
  StarOff,
  UserPlus,
  FilePlus,
  Bookmark,
  Bot,
  Radio,
  TableProperties,
  Send,
  Split,
  Workflow,
  PlayCircle,
  ShieldCheck,
  CreditCard,
  Ticket,
  DollarSign,
  ClipboardList,
  Database,
  Activity,
  Library,
  Video,
  Image as ImageIcon,
  LayoutTemplate,
  AlertTriangle,
  Flame,
  Package,
  Route,
  Shield,
  ShieldHalf,
  PlaySquare,
  PackageOpen,
  MessagesSquare,
  Vote,
  ShoppingCart,
  CalendarClock,
  Languages,
  Braces,
  Gauge,
} from "lucide-react";
import { IconButton } from "@/components/admin/ui/admin-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUIState } from "@/hooks/use-ui-state";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
  permission?: string;
}

interface BookmarkItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
}

interface SidebarNavLinkProps {
  item: SidebarNavItem;
  pathname: string | null;
  collapsed: boolean;
  onBookmarkToggle?: (item: SidebarNavItem) => void;
}

interface SidebarNavSectionProps {
  title: string;
  items: SidebarNavItem[];
  pathname: string | null;
  collapsed: boolean;
  onBookmarkToggle?: (item: SidebarNavItem) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const mainNavItems: SidebarNavItem[] = [
  {
    title: "لوحة المعلومات",
    href: "/admin",
    icon: LayoutDashboard,
    color: "bg-orange-500",
    permission: "DASHBOARD_VIEW",
  },
  {
    title: "المستخدمين",
    href: "/admin/users",
    icon: Users,
    color: "bg-violet-500",
    permission: "USERS_VIEW",
  },
  {
    title: "المشرفون",
    href: "/admin/admins",
    icon: Shield,
    color: "bg-emerald-500",
    permission: "USERS_VIEW",
  },
  {
    title: "المشرفون الإشرافيون",
    href: "/admin/moderators",
    icon: ShieldHalf,
    color: "bg-cyan-500",
    permission: "USERS_VIEW",
  },
  {
    title: "مصفوفة الصلاحيات",
    href: "/admin/users/permissions",
    icon: ShieldCheck,
    color: "bg-amber-500",
    permission: "USERS_MANAGE",
  },
  {
    title: "الأدوار والصلاحيات",
    href: "/admin/roles",
    icon: Shield,
    color: "bg-emerald-600",
    permission: "ROLES_VIEW",
  },
  {
    title: "المعلمين",
    href: "/admin/teachers",
    icon: GraduationCap,
    color: "bg-purple-500",
    permission: "TEACHERS_VIEW",
  },
  {
    title: "عمليات المراقبة اللحظية",
    href: "/admin/live",
    icon: Radio,
    color: "bg-rose-500",
    permission: "LIVE_MONITOR_VIEW",
  },
  {
    title: "التقارير والتحليلات",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "bg-fuchsia-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "مُنشئ التقارير (الخزانة)",
    href: "/admin/reports",
    icon: TableProperties,
    color: "bg-orange-600",
    permission: "REPORTS_VIEW",
  },
];

const contentNavItems: SidebarNavItem[] = [
  {
    title: "الدورات التعليمية",
    href: "/admin/courses",
    icon: PlayCircle,
    color: "bg-orange-500",
    permission: "SUBJECTS_VIEW",
  },
  {
    title: "تصنيفات الدورات",
    href: "/admin/course-categories",
    icon: Bookmark,
    color: "bg-amber-500",
    permission: "SUBJECTS_VIEW",
  },
  {
    title: "المواد الدراسية",
    href: "/admin/subjects",
    icon: BookOpen,
    color: "bg-orange-600",
    permission: "SUBJECTS_VIEW",
  },
  {
    title: "مسارات التعلم",
    href: "/admin/learning-paths",
    icon: Route,
    color: "bg-cyan-600",
    permission: "LEARNING_PATHS_VIEW",
  },
  {
    title: "الكتب",
    href: "/admin/books",
    icon: FileText,
    color: "bg-purple-500",
    permission: "BOOKS_VIEW",
  },
  {
    title: "الامتحانات",
    href: "/admin/exams",
    icon: Target,
    color: "bg-violet-500",
    permission: "EXAMS_VIEW",
  },
  {
    title: "بنك الأسئلة",
    href: "/admin/question-bank",
    icon: Library,
    color: "bg-purple-600",
    permission: "EXAMS_VIEW",
  },
  {
    title: "البث المباشر",
    href: "/admin/live-sessions",
    icon: Video,
    color: "bg-rose-500",
    permission: "SUBJECTS_MANAGE",
  },
  {
    title: "الموارد",
    href: "/admin/resources",
    icon: Gift,
    color: "bg-fuchsia-500",
    permission: "RESOURCES_VIEW",
  },
  {
    title: "مكتبة الوسائط",
    href: "/admin/media",
    icon: ImageIcon,
    color: "bg-violet-600",
    permission: "RESOURCES_VIEW",
  },
  {
    title: "الدروس",
    href: "/admin/lessons",
    icon: PlaySquare,
    color: "bg-cyan-500",
    permission: "SUBJECTS_VIEW",
  },
  {
    title: "الواجبات",
    href: "/admin/assignments",
    icon: ClipboardList,
    color: "bg-teal-500",
    permission: "SUBJECTS_VIEW",
  },
  {
    title: "حزم الدورات",
    href: "/admin/course-bundles",
    icon: PackageOpen,
    color: "bg-emerald-500",
    permission: "SUBJECTS_VIEW",
  },
  {
    title: "منشئ صفحات الهبوط",
    href: "/admin/landing",
    icon: LayoutTemplate,
    color: "bg-purple-500",
    permission: "SETTINGS_MANAGE",
  },
  {
    title: "المساعد الذكي",
    href: "/admin/ai",
    icon: Bot,
    color: "bg-orange-500",
    permission: "AI_MANAGE",
  },
  {
    title: "↳ إدارة المساعدين",
    href: "/admin/ai/assistants",
    icon: Bot,
    color: "bg-violet-500",
    permission: "AI_MANAGE",
  },
  {
    title: "↳ مراجعة المحتوى",
    href: "/admin/ai/content-review",
    icon: ClipboardList,
    color: "bg-orange-600",
    permission: "AI_MANAGE",
  },
  {
    title: "↳ سجلات الذكاء",
    href: "/admin/ai/logs",
    icon: ScrollText,
    color: "bg-blue-500",
    permission: "AI_MANAGE",
  },
  {
    title: "↳ الرقابة الذكية",
    href: "/admin/ai/moderation",
    icon: Shield,
    color: "bg-rose-500",
    permission: "AI_MANAGE",
  },
];

const engagementNavItems: SidebarNavItem[] = [
  {
    title: "المهام التعليمية",
    href: "/admin/challenges",
    icon: ClipboardList,
    color: "bg-orange-500",
    permission: "CHALLENGES_VIEW",
  },
  {
    title: "الأوسمة والتقدير",
    href: "/admin/achievements",
    icon: Award,
    color: "bg-amber-400",
    permission: "ACHIEVEMENTS_VIEW",
  },
  {
    title: "المكافآت",
    href: "/admin/rewards",
    icon: Gift,
    color: "bg-fuchsia-500",
    permission: "REWARDS_VIEW",
  },
  {
    title: "فترات التميز",
    href: "/admin/seasons",
    icon: Medal,
    color: "bg-purple-500",
    permission: "SEASONS_VIEW",
  },
  {
    title: "أتمتة العمليات",
    href: "/admin/automations",
    icon: Workflow,
    color: "bg-violet-500",
    permission: "ADMIN_BYPASS",
  },
  {
    title: "حملات التواصل (CRM)",
    href: "/admin/marketing",
    icon: Send,
    color: "bg-violet-600",
    permission: "MARKETING_VIEW",
  },
  {
    title: "تجارب تحسين الأداء A/B",
    href: "/admin/ab-testing",
    icon: Split,
    color: "bg-fuchsia-600",
    permission: "AB_TESTING_VIEW",
  },
];

const communityNavItems: SidebarNavItem[] = [
  {
    title: "الإعلانات الرسمية",
    href: "/admin/announcements",
    icon: Bell,
    color: "bg-orange-400",
    permission: "ANNOUNCEMENTS_VIEW",
  },
  {
    title: "إدارة الإشعارات",
    href: "/admin/notifications",
    icon: Send,
    color: "bg-rose-500",
    permission: "ANNOUNCEMENTS_MANAGE",
  },
  {
    title: "منتدى الحوار",
    href: "/admin/forum",
    icon: MessageSquare,
    color: "bg-violet-500",
    permission: "FORUM_VIEW",
  },
  {
    title: "النقاشات",
    href: "/admin/discussions",
    icon: MessagesSquare,
    color: "bg-cyan-500",
    permission: "FORUM_VIEW",
  },
  {
    title: "استطلاعات الرأي",
    href: "/admin/polls",
    icon: Vote,
    color: "bg-emerald-500",
    permission: "FORUM_VIEW",
  },
  {
    title: "المدونة الأكاديمية",
    href: "/admin/blog",
    icon: Newspaper,
    color: "bg-purple-500",
    permission: "BLOG_VIEW",
  },
  {
    title: "الفعاليات",
    href: "/admin/events",
    icon: Calendar,
    color: "bg-amber-500",
    permission: "EVENTS_VIEW",
  },
  {
    title: "المسابقات العلمية",
    href: "/admin/contests",
    icon: Trophy,
    color: "bg-orange-500",
    permission: "CONTESTS_VIEW",
  },
];

const financialNavItems: SidebarNavItem[] = [
  {
    title: "التحليل المالي",
    href: "/admin/revenue",
    icon: DollarSign,
    color: "bg-amber-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "الطلبات",
    href: "/admin/orders",
    icon: ShoppingCart,
    color: "bg-blue-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "الاشتراك والفواتير",
    href: "/admin/invoices",
    icon: FileText,
    color: "bg-cyan-600",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "خطط التقسيط",
    href: "/admin/installments",
    icon: CalendarClock,
    color: "bg-violet-600",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "سجل المدفوعات",
    href: "/admin/payments",
    icon: CreditCard,
    color: "bg-orange-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "أكواد التخفيض",
    href: "/admin/coupons",
    icon: Ticket,
    color: "bg-purple-500",
    permission: "MARKETING_VIEW",
  },
  {
    title: "المسوقون بالعمولة",
    href: "/admin/affiliates",
    icon: Gift,
    color: "bg-violet-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "إدارة فشل الدفع",
    href: "/admin/dunning",
    icon: AlertTriangle,
    color: "bg-rose-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "مولد التقارير",
    href: "/admin/reports",
    icon: BarChart3,
    color: "bg-fuchsia-500",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "الخطط والاشتراكات",
    href: "/admin/plans",
    icon: Package,
    color: "bg-orange-600",
    permission: "ANALYTICS_VIEW",
  },
  {
    title: "تحليلات التعليم",
    href: "/admin/learning-analytics",
    icon: Flame,
    color: "bg-orange-600",
    permission: "ANALYTICS_VIEW",
  },
];

const infrastructureNavItems: SidebarNavItem[] = [
  {
    title: "مركز المراقبة والآمان",
    href: "/admin/monitoring-security",
    icon: ShieldCheck,
    color: "bg-rose-500",
    permission: "LIVE_MONITOR_VIEW",
  },
  {
    title: "المراقبة اللحظية",
    href: "/admin/live",
    icon: Radio,
    color: "bg-rose-600",
    permission: "LIVE_MONITOR_VIEW",
  },
  {
    title: "صحة خفايا المملكة ⚔️",
    href: "/admin/health",
    icon: Activity,
    color: "bg-purple-600",
    permission: "LIVE_MONITOR_VIEW",
  },
  {
    title: "مراقبة الأداء",
    href: "/admin/infrastructure",
    icon: Monitor,
    color: "bg-violet-600",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "قواعد البيانات",
    href: "/admin/infrastructure/partitions",
    icon: Split,
    color: "bg-fuchsia-600",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "النسخ الاحتياطي",
    href: "/admin/backups",
    icon: Database,
    color: "bg-amber-500",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "تذاكر الدعم الفني",
    href: "/admin/tickets",
    icon: Ticket,
    color: "bg-orange-600",
    permission: "USERS_MANAGE",
  },
  {
    title: "سجلات النظام (Engine)",
    href: "/admin/audit-logs",
    icon: ScrollText,
    color: "bg-violet-500",
    permission: "AUDIT_LOGS_VIEW",
  },
  {
    title: "التعريب واللغات",
    href: "/admin/languages",
    icon: Languages,
    color: "bg-teal-500",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "مستكشف API",
    href: "/admin/api-explorer",
    icon: Braces,
    color: "bg-blue-500",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "مؤشرات النظام",
    href: "/admin/system-metrics",
    icon: Gauge,
    color: "bg-emerald-500",
    permission: PERMISSIONS.SETTINGS_VIEW,
  }
];

function SidebarNavLink({ item, pathname, collapsed, onBookmarkToggle }: SidebarNavLinkProps) {
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      prefetch={false}
      aria-label={collapsed ? item.title : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-gradient-to-l from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-7 rounded-l-full bg-gradient-to-b from-primary to-primary/60 shadow-lg shadow-primary/50" />
      )}

      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0",
          "border",
          isActive
            ? "bg-card/30 border-primary/30 text-primary-foreground shadow-md"
            : "bg-muted/60 border-transparent group-hover:border-primary/20 group-hover:shadow-md",
          !isActive && item.color && "group-hover:bg-gradient-to-br"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-all duration-200",
            "group-hover:scale-110 group-hover:rotate-3"
          )}
          aria-hidden="true"
        />
      </div>

      {!collapsed && <span className="truncate flex-1 font-medium">{item.title}</span>}

      {!collapsed && item.badge && (
        <span className="mr-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1.5 shadow-sm">
          {item.badge}
        </span>
      )}

      {!collapsed && onBookmarkToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmarkToggle(item);
          }}
          className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-background/80 focus-visible:opacity-100"
          aria-label="إضافة للمفضلة"
          title="إضافة للمفضلة"
        >
          <Star className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-500 transition-colors" />
        </button>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="left" className="font-medium shadow-lg">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
}

function SidebarNavSection({
  title,
  items,
  pathname,
  collapsed,
  onBookmarkToggle,
  isCollapsed,
  onToggle,
}: SidebarNavSectionProps) {
  const sectionId = React.useId();
  const sectionHidden = !collapsed && !!isCollapsed;

  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      {!collapsed && (
        <button
          onClick={onToggle}
          type="button"
          aria-expanded={!sectionHidden}
          aria-controls={sectionId}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-all duration-200 group select-none text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg hover:bg-accent/50"
        >
          <span className="transition-colors">{title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-all duration-200 opacity-70 group-hover:opacity-100 group-hover:scale-110",
              sectionHidden ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          />
        </button>
      )}
      {collapsed && <div className="mx-3 my-2.5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />}

      <div
        id={sectionId}
        inert={sectionHidden || undefined}
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out",
          sectionHidden ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
        )}
      >
        <div className="space-y-0.5">
          {items.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onBookmarkToggle={onBookmarkToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Module-level icon map for bookmarks — avoids rebuilding a 36-entry object
// on every render for every bookmark.
const BOOKMARK_ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  BookOpen,
  Trophy,
  Bell,
  MessageSquare,
  Calendar,
  Settings,
  FileText,
  Gift,
  Target,
  Award,
  Medal,
  Newspaper,
  Gamepad2,
  BarChart3,
  Monitor,
  ScrollText,
  Home,
  GraduationCap,
  Search,
  Keyboard,
  Star,
  UserPlus,
  FilePlus,
  Bookmark,
  Bot,
  Radio,
  TableProperties,
  Send,
  Split,
  Workflow,
  PlayCircle,
  ShieldCheck,
  CreditCard,
  Ticket,
  DollarSign,
  ClipboardList,
  Database,
  Shield,
  ShieldHalf,
  PlaySquare,
  PackageOpen,
  MessagesSquare,
  Vote,
  ShoppingCart,
  CalendarClock,
  Languages,
  Braces,
  Gauge,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useUIState<boolean>("sidebar-collapsed", false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [collapsedSections, setCollapsedSections] = useUIState<Record<string, boolean>>("sidebar-collapsed-sections", {});
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const allNavItems = React.useMemo(
    () => [
      ...mainNavItems,
      ...contentNavItems,
      ...engagementNavItems,
      ...communityNavItems,
      ...financialNavItems,
      ...infrastructureNavItems,
    ],
    []
  );

  const currentPageTitle = React.useMemo(() => {
    if (!pathname) return "";
    if (pathname === "/admin") return "لوحة المعلومات";
    const found = allNavItems.find(
      (item) => item.href !== "/admin" && (pathname === item.href || pathname.startsWith(`${item.href}/`))
    );
    return found ? found.title : "";
  }, [pathname, allNavItems]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const canAccessNavItem = React.useCallback(
    (item: SidebarNavItem) => {
      const routePermission = getRequiredPermissionForAdminPath(item.href);
      const explicitPermission = item.permission
        ? resolvePermissionInput(item.permission)
        : null;
      const requiredPermission = routePermission || explicitPermission;

      if (!requiredPermission) return true;

      return hasPermission(requiredPermission);
    },
    [hasPermission]
  );

  const filterBySearchAndPermission = React.useCallback(
    (items: SidebarNavItem[]) => {
      if (!searchQuery) {
        return items.filter((item) => canAccessNavItem(item));
      }
      const query = searchQuery.toLowerCase();
      return items.filter(
        (item) => canAccessNavItem(item) && item.title.toLowerCase().includes(query)
      );
    },
    [canAccessNavItem, searchQuery]
  );

  const filteredMainNav = React.useMemo(() => filterBySearchAndPermission(mainNavItems), [filterBySearchAndPermission]);
  const filteredContentNav = React.useMemo(() => filterBySearchAndPermission(contentNavItems), [filterBySearchAndPermission]);
  const filteredEngagementNav = React.useMemo(() => filterBySearchAndPermission(engagementNavItems), [filterBySearchAndPermission]);
  const filteredCommunityNav = React.useMemo(() => filterBySearchAndPermission(communityNavItems), [filterBySearchAndPermission]);
  const filteredFinancialNav = React.useMemo(() => filterBySearchAndPermission(financialNavItems), [filterBySearchAndPermission]);
  const filteredInfrastructureNav = React.useMemo(() => filterBySearchAndPermission(infrastructureNavItems), [filterBySearchAndPermission]);

  // Load bookmarks from localStorage via lazy initializer — runs once during
  // initial render (no effect needed, no cascading setState warning).
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("admin-sidebar-bookmarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
    return [];
  });

  // Bookmarks are persisted locally and may have been created before an
  // administrator revoked access. Never let those saved labels bypass the
  // same sidebar permission filter.
  const visibleBookmarks = React.useMemo(
    () => bookmarks.filter((bookmark) => {
      const item = allNavItems.find((navItem) => navItem.href === bookmark.href);
      return item ? canAccessNavItem(item) : false;
    }),
    [allNavItems, bookmarks, canAccessNavItem],
  );

  const toggleCollapsed = () => {
    setCollapsed((previous) => !previous);
  };

  const removeBookmark = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    window.localStorage.setItem("admin-sidebar-bookmarks", JSON.stringify(updated));
    if (bookmark) {
      toast.success(`تمت إزالة "${bookmark.title}" من المفضلة`);
    }
  };

  const toggleBookmark = (item: SidebarNavItem) => {
    const existing = bookmarks.find(b => b.href === item.href);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      const iconComponent = item.icon as any;
      const newBookmark: BookmarkItem = {
        id: `bookmark-${Date.now()}`,
        title: item.title,
        href: item.href,
        iconName: iconComponent.displayName || iconComponent.name || 'Bookmark',
      };
      const updated = [...bookmarks, newBookmark];
      setBookmarks(updated);
      window.localStorage.setItem("admin-sidebar-bookmarks", JSON.stringify(updated));
      toast.success(`تمت إضافة "${item.title}" إلى المفضلة`);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShortcutsOpen(false);
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-l border-border glass-panel-strong",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      aria-label="القائمة الجانبية للإدارة"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 bg-background px-3">
        {!collapsed && (
          <div className="flex items-center gap-3 pr-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-primary/10 border border-primary/30">
              <Image
                src="/logo-tolo.webp"
                alt="TOLO"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground">{currentPageTitle || "لوحة التحكم"}</span>
              <p className="text-[10px] text-primary font-bold mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {currentPageTitle ? `الفيصل: ${currentPageTitle}` : "إدارة الموقع"}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && (
            <IconButton
              icon={Search}
              label="البحث"
              variant="ghost"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              aria-label="البحث"
              className="hover:bg-primary/10 hover:text-primary"
            />
          )}
          <IconButton
            icon={collapsed ? ChevronLeft : ChevronRight}
            label={collapsed ? "توسيع" : "طي"}
            variant="ghost"
            onClick={toggleCollapsed}
            className={cn(
              collapsed ? "mx-auto" : "",
              "hover:bg-primary/10 hover:text-primary"
            )}
            aria-label={collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
          />
        </div>
      </div>

      {!collapsed && user && (
        <div className="border-b border-border/50 px-3 py-3">
          <div className="rounded-2xl border border-primary/20 bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-chart-2 text-white font-bold text-sm shadow-lg shadow-primary/30 ring-2 ring-primary/20">
                {(user.name || "A").substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-foreground">{user.name || "Admin"}</p>
                <p className="truncate mt-0.5 text-[10px] text-muted-foreground font-medium">{user.email || "admin@tolo.com"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2 border-b border-border/50">
          <div className="relative group">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="بحث سريع في القائمة..."
              aria-label="بحث سريع في القائمة"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-muted/40 pl-8 pr-10 py-2.5 text-xs transition-all duration-200 hover:bg-muted/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30 text-foreground text-right shadow-sm"
              dir="rtl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground text-xs p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md hover:bg-muted transition-all"
                type="button"
                aria-label="مسح البحث"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {!collapsed && visibleBookmarks.length > 0 && (
        <div className="px-3 py-3 border-b border-border/50">
          <h3 className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <div className="flex items-center justify-center h-5 w-5 rounded-md bg-yellow-500/10 text-yellow-500">
              <Star className="h-3 w-3" />
            </div>
            <span>المفضلة</span>
          </h3>
          <nav className="space-y-0.5 mt-2">
            {visibleBookmarks.map((bookmark) => {
              const IconComponent = BOOKMARK_ICON_MAP[bookmark.iconName] || Bookmark;
              const isActive = pathname === bookmark.href;
              return (
                <div
                  key={bookmark.id}
                  className="group flex items-center"
                >
                  <Link
                    href={bookmark.href}
                    className={cn(
                      "flex-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all duration-200",
                      isActive
                        ? "bg-primary/15 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="truncate font-medium">{bookmark.title}</span>
                  </Link>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    aria-label={`إزالة "${bookmark.title}" من المفضلة`}
                    title={`إزالة "${bookmark.title}" من المفضلة`}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 hover:bg-destructive/10 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <StarOff className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin" aria-label="القائمة الرئيسية">
        <SidebarNavSection
          title="الرئيسية"
          items={filteredMainNav}
          pathname={pathname}
          collapsed={collapsed}
          onBookmarkToggle={toggleBookmark}
          isCollapsed={searchQuery ? false : !!collapsedSections["الرئيسية"]}
          onToggle={() => toggleSection("الرئيسية")}
        />
        <SidebarNavSection
          title="المحتوى التعليمي"
          items={filteredContentNav}
          pathname={pathname}
          collapsed={collapsed}
          onBookmarkToggle={toggleBookmark}
          isCollapsed={searchQuery ? false : !!collapsedSections["المحتوى التعليمي"]}
          onToggle={() => toggleSection("المحتوى التعليمي")}
        />
        <SidebarNavSection
          title="الأنشطة والتحفيز"
          items={filteredEngagementNav}
          pathname={pathname}
          collapsed={collapsed}
          onBookmarkToggle={toggleBookmark}
          isCollapsed={searchQuery ? false : !!collapsedSections["الأنشطة والتحفيز"]}
          onToggle={() => toggleSection("الأنشطة والتحفيز")}
        />
        <SidebarNavSection
          title="المجتمع"
          items={filteredCommunityNav}
          pathname={pathname}
          collapsed={collapsed}
          onBookmarkToggle={toggleBookmark}
          isCollapsed={searchQuery ? false : !!collapsedSections["المجتمع"]}
          onToggle={() => toggleSection("المجتمع")}
        />
        <SidebarNavSection
          title="الإدارة المالية"
          items={filteredFinancialNav}
          pathname={pathname}
          collapsed={collapsed}
          onBookmarkToggle={toggleBookmark}
          isCollapsed={searchQuery ? false : !!collapsedSections["الإدارة المالية"]}
          onToggle={() => toggleSection("الإدارة المالية")}
        />
        <SidebarNavSection
          title="البنية التحتية"
          items={filteredInfrastructureNav}
          pathname={pathname}
          collapsed={collapsed}
          onBookmarkToggle={toggleBookmark}
          isCollapsed={searchQuery ? false : !!collapsedSections["البنية التحتية"]}
          onToggle={() => toggleSection("البنية التحتية")}
        />
      </nav>

      {/* Footer */}
      <nav className="border-t border-border/50 p-3 space-y-0.5" aria-label="أدوات النظام">
        <SidebarNavLink
          item={{
            title: "سجل النظام",
            href: "/admin/audit-logs",
            icon: ScrollText,
            color: "bg-violet-500",
            permission: "AUDIT_LOGS_VIEW",
          }}
          pathname={pathname}
          collapsed={collapsed}
        />
        <SidebarNavLink
          item={{
            title: "الإعدادات",
            href: "/admin/settings",
            icon: Settings,
            color: "bg-purple-500",
            permission: PERMISSIONS.SETTINGS_VIEW,
          }}
          pathname={pathname}
          collapsed={collapsed}
        />

        {!collapsed && (
          <button
            onClick={() => setShortcutsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary hover:shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 border border-border/50">
              <Keyboard className="h-4 w-4" />
            </div>
            <span className="font-medium">اختصارات لوحة المفاتيح</span>
          </button>
        )}

        <div className={cn("pt-2 mt-2 border-t border-border/50", collapsed && "px-0")}>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-accent/80 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary hover:shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 border border-border/50">
              <Home className="h-4 w-4" />
            </div>
            {!collapsed && <span className="font-medium">العودة للموقع</span>}
          </Link>
        </div>
      </nav>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-md" aria-labelledby="shortcuts-dialog-title">
          <DialogHeader>
            <DialogTitle id="shortcuts-dialog-title" className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              اختصارات لوحة المفاتيح
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3" role="list" aria-label="قائمة الاختصارات">
            {[
              { keys: ["Ctrl", "K"], action: "البحث السريع" },
              { keys: ["Ctrl", "/"], action: "لوحة الأوامر" },
              { keys: ["Ctrl", "B"], action: "تبديل الشريط الجانبي" },
              { keys: ["Ctrl", "H"], action: "الذهاب للرئيسية" },
              { keys: ["Ctrl", "Shift", "F"], action: "البحث المتقدم" },
              { keys: ["Alt", "1-9"], action: "الانتقال للقسم (1-9)" },
              { keys: ["↑", "↓"], action: "التنقل بين العناصر" },
              { keys: ["Enter"], action: "فتح/اختيار العنصر" },
              { keys: ["Ctrl", "N"], action: "إنشاء جديد" },
              { keys: ["Ctrl", "S"], action: "حفظ (في النماذج)" },
              { keys: ["Ctrl", "Shift", "L"], action: "تبديل الوضع الليلي" },
              { keys: ["Ctrl", "Shift", "?"], action: "عرض الاختصارات" },
              { keys: ["Esc"], action: "إغلاق القوائم/النوافذ" },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" role="listitem">
                <span className="text-sm">{shortcut.action}</span>
                <div className="flex items-center gap-1" aria-label={`مفاتيح الاختصار: ${shortcut.keys.join(' + ')}`}>
                  {shortcut.keys.map((key, j) => (
                    <kbd key={j} className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
