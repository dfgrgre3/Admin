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
  Zap,
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

interface QuickAction {
  title: string;
  href: string;
  icon: React.ElementType;
  color: string;
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
    title: "مصفوفة الصلاحيات",
    href: "/admin/users/permissions",
    icon: ShieldCheck,
    color: "bg-amber-500",
    permission: "USERS_MANAGE",
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
    href: "/admin/live",
    icon: ShieldCheck,
    color: "bg-rose-500",
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
  }
];

const quickActions: QuickAction[] = [
  { title: "إضافة مستخدم", href: "/admin/users/create", icon: UserPlus, color: "orange", permission: "USERS_MANAGE" },
  { title: "إضافة محتوى", href: "/admin/subjects?create=1", icon: FilePlus, color: "violet", permission: "SUBJECTS_MANAGE" },
  { title: "إضافة مهمة", href: "/admin/challenges?create=1", icon: ClipboardList, color: "amber", permission: "CHALLENGES_MANAGE" },
  { title: "المساعد الذكي", href: "/admin/ai", icon: Bot, color: "rose", permission: "AI_MANAGE" },
  { title: "إرسال إعلان", href: "/admin/announcements?create=1", icon: Bell, color: "purple", permission: "ANNOUNCEMENTS_MANAGE" },
];

function SidebarNavLink({ item, pathname, collapsed, onBookmarkToggle }: SidebarNavLinkProps) {
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      aria-label={collapsed ? item.title : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-primary" />
      )}

      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
          isActive
            ? "bg-card/20 text-primary-foreground"
            : "bg-muted/50 group-hover:bg-gradient-to-br group-hover:text-white",
          !isActive && item.color
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            "group-hover:scale-110"
          )}
          aria-hidden="true"
        />
      </div>

      {!collapsed && <span className="truncate flex-1">{item.title}</span>}

      {!collapsed && item.badge && (
        <span className="mr-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
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
          className="p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 hover:bg-muted"
          aria-label="إضافة للمفضلة"
          title="إضافة للمفضلة"
        >
          <Star className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-500" />
        </button>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
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
          className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors group select-none text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
        >
          <span>{title}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200 opacity-60 group-hover:opacity-100",
              sectionHidden ? "rotate-90" : "rotate-0"
            )}
            aria-hidden="true"
          />
        </button>
      )}
      {collapsed && <div className="mx-3 my-2 h-px bg-border/50" />}

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
  Zap,
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
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useUIState<boolean>("sidebar-collapsed", false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [collapsedSections, setCollapsedSections] = useUIState<Record<string, boolean>>("sidebar-collapsed-sections", {});
  const { user } = useAuth();
  const { hasPermission } = usePermission();

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
  const filteredQuickActions = React.useMemo(() => {
    return quickActions.filter((action) => {
      const requiredPermission = action.permission
        ? resolvePermissionInput(action.permission)
        : getRequiredPermissionForAdminPath(action.href);

      return !requiredPermission || hasPermission(requiredPermission);
    });
  }, [hasPermission]);

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
        "flex h-screen flex-col border-l border-border glass-panel-strong transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      aria-label="القائمة الجانبية للإدارة"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 pr-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-card border border-primary/20 shadow-lg shadow-primary/10">
              <Image
                src="/logo-tolo.jpg"
                alt="TOLO"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground">لوحة التحكم</span>
              <p className="text-[10px] text-muted-foreground font-medium">إدارة الموقع</p>
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
            />
          )}
          <IconButton
            icon={collapsed ? ChevronLeft : ChevronRight}
            label={collapsed ? "توسيع" : "طي"}
            variant="ghost"
            onClick={toggleCollapsed}
            className={collapsed ? "mx-auto" : ""}
            aria-label={collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
          />
        </div>
      </div>

      {!collapsed && user && (
        <div className="border-b border-border px-3 py-3">
          <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-card p-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-chart-2 text-white font-bold text-xs shadow-md shadow-primary/20">
                {(user.name || "A").substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-foreground">{user.name || "Admin"}</p>
                <p className="truncate mt-0.5 text-[10px] text-muted-foreground">{user.email || "admin@tolo.com"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!collapsed && (
        <div className="px-3 pt-2 pb-2 border-b">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث سريع في القائمة..."
              aria-label="بحث سريع في القائمة"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-muted/60 pl-8 pr-9 py-2 text-xs transition-all duration-200 hover:bg-muted focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-border text-foreground text-right"
              dir="rtl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-2 text-muted-foreground hover:text-foreground text-xs p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                type="button"
                aria-label="مسح البحث"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!collapsed && filteredQuickActions.length > 0 && (
        <div className="px-3 py-2 border-b">
          <h3 className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            إجراءات سريعة
          </h3>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {filteredQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    action.color === "orange" && "text-orange-500",
                    action.color === "violet" && "text-violet-500",
                    action.color === "amber" && "text-amber-500",
                    action.color === "rose" && "text-rose-500",
                    action.color === "purple" && "text-purple-500"
                  )} />
                  <span className="truncate">{action.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {!collapsed && bookmarks.length > 0 && (
        <div className="px-3 py-2 border-b">
          <h3 className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
            <Star className="h-3 w-3" />
            المفضلة
          </h3>
          <nav className="space-y-0.5 mt-1">
            {bookmarks.map((bookmark) => {
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
                      "flex-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span className="truncate">{bookmark.title}</span>
                  </Link>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    aria-label={`إزالة "${bookmark.title}" من المفضلة`}
                    title={`إزالة "${bookmark.title}" من المفضلة`}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 hover:bg-muted rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <StarOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin" aria-label="القائمة الرئيسية">
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
      <nav className="border-t p-3 space-y-0.5" aria-label="أدوات النظام">
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
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
              <Keyboard className="h-4 w-4" />
            </div>
            <span>اختصارات لوحة المفاتيح</span>
          </button>
        )}

        <div className={cn("pt-2 mt-2 border-t", collapsed && "px-0")}>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
              <Home className="h-4 w-4" />
            </div>
            {!collapsed && <span>العودة للموقع</span>}
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